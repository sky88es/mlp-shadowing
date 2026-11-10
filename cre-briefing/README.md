# CRE Radar – 한국 상업용부동산 데일리 브리핑

매일 아침 이메일로 보내는 브리핑의 템플릿입니다. 데이터(JSON)만 채우면 같은 디자인의 메일 HTML이 만들어집니다.

```bash
python3 cre-briefing/build_email.py cre-briefing/data/YYYY-MM-DD.json > out.html          # HTML 본문
python3 cre-briefing/build_email.py cre-briefing/data/YYYY-MM-DD.json --plain > out.txt   # 텍스트 대체본
```

JSON 구조는 `data/2026-11-10.json`을 예시로 보면 됩니다.

- `hero`: 오늘의 톱 기사 (tag, title, text, url)
- `summary`: 핵심 꼭지 3~5개. 각 항목에 tag, title, text, src, url
- `rates`: 금리 타일. name, value, chg, dir(up/dn/flat), asof, src, url. 4개씩 한 줄
- `financing.deals`: 실제 딜의 조달 금리. type, deal, terms, rate, size, when, src, url
- `financing.levels`: 자산별 현재 선순위 금리 수준
- `sectors`: 섹터별 기사. tag, name, sub, items[title, text, date, src, url, ref(오늘 이전 보도면 true)]
- `valuation`: 캡레이트·공실률 타일
- `insights`: 분석 코멘트

모든 기사에는 반드시 `src`(매체)와 `url`(원문 링크)을 넣습니다. 출처는 메일에 "Source · 매체 ↗" 형태로 표시됩니다.
