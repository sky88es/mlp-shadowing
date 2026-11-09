#!/usr/bin/env python3
"""Find free-license real photos on Wikimedia Commons.

Usage: python3 kids/find_photo.py "squirrel acorn" [more search terms...]
Prints candidates (featured/quality first) as JSON lines ready for the lesson "photos" field:
  {"url": <1200px thumb>, "page": <commons page>, "credit": <author>, "license": <license>, "title": ...}
Save one (resized to 1200px, into the repo):  python3 kids/find_photo.py --save <commons page url> kids/photos/<name>.jpg
Only CC0 / Public domain / CC BY / CC BY-SA photos (jpg/png) are listed.
"""
import json, re, sys, time, urllib.error, urllib.parse, urllib.request, html

API = "https://commons.wikimedia.org/w/api.php"
HDR = {"User-Agent": "KidsReadingBot/1.0 (https://github.com/sky88es/mlp-shadowing)"}


def get(url):
    """GET with backoff: Commons often answers 429 to bursts."""
    for wait in (0, 5, 15, 30, 60):
        time.sleep(wait)
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=HDR), timeout=60).read()
        except urllib.error.HTTPError as e:
            if e.code != 429 or wait == 60:
                raise


OK = re.compile(r"^(CC0|Public domain|PD|CC BY(-SA)? [0-9.]+)", re.I)


def search(q, n=20):
    params = {"action": "query", "format": "json", "generator": "search", "gsrnamespace": 6,
              "gsrlimit": n, "gsrsearch": q + " filetype:bitmap", "prop": "imageinfo",
              "iiprop": "url|extmetadata|size|mime", "iiurlwidth": 1200}
    data = json.loads(get(API + "?" + urllib.parse.urlencode(params)))
    out = []
    for p in data.get("query", {}).get("pages", {}).values():
        ii = p["imageinfo"][0]
        m = ii.get("extmetadata", {})
        g = lambda k: html.unescape(re.sub(r"<[^>]+>", "", m.get(k, {}).get("value", ""))).strip()
        lic = g("LicenseShortName")
        if ii.get("mime") not in ("image/jpeg", "image/png") or not OK.match(lic) or ii["width"] < 900:
            continue
        rank = ("featured" in g("Assessments")) * 2 + ("quality" in g("Assessments"))
        out.append((rank, {"title": p["title"][5:], "url": ii.get("thumburl", ii["url"]), "page": ii["descriptionurl"],
                           "credit": g("Artist")[:80] or "Unknown", "license": lic,
                           "size": f'{ii["width"]}x{ii["height"]}', "desc": g("ImageDescription")[:120]}))
    return [o for _, o in sorted(out, key=lambda x: -x[0])]


def save(page_url, out_path, width=1280):
    """Download a Commons file (by its page URL) resized to `width`, print the photo JSON for the lesson."""
    title = urllib.parse.unquote(page_url.rsplit("/File:", 1)[1]).replace("_", " ")
    params = {"action": "query", "format": "json", "titles": "File:" + title, "prop": "imageinfo",
              "iiprop": "url|extmetadata", "iiurlwidth": width}
    p = next(iter(json.loads(get(API + "?" + urllib.parse.urlencode(params)))["query"]["pages"].values()))
    ii = p["imageinfo"][0]; m = ii["extmetadata"]
    g = lambda k: html.unescape(re.sub(r"<[^>]+>", "", m.get(k, {}).get("value", ""))).strip()
    url = ii["thumburl"].split("?")[0]
    data = get(url)
    from io import BytesIO
    from PIL import Image
    im = Image.open(BytesIO(data)).convert("RGB")
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)))
    im.save(out_path, "JPEG", quality=82, optimize=True)
    print(json.dumps({"src": out_path.split("kids/", 1)[-1], "credit": g("Artist")[:80] or "Unknown",
                      "license": g("LicenseShortName"), "page": ii["descriptionurl"]}, ensure_ascii=False))


if __name__ == "__main__":
    if sys.argv[1] == "--save":
        save(sys.argv[2], sys.argv[3]); sys.exit()
    for q in sys.argv[1:]:
        print(f"# {q}")
        for o in search(q)[:8]:
            print(json.dumps(o, ensure_ascii=False))
