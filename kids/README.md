# 🌞 아침 리딩 — 초1 · 7세 · 주간 묶음 (월~금)

매주 금요일 아침, 다음 주 **월~금 5일치**를 한 번에 인쇄용 PDF로 보냅니다.
요일마다 **영어 2쪽 → 국어 2쪽 → 글쓰기 1쪽** 순서(하루 5장)입니다.
받는 사람: `sangwon.park@jbam.co.kr` · 제목 `[아침 리딩] M/D–M/D 주간 묶음 · English + 국어 + 글쓰기`

## 가장 중요한 기준: 초등 1학년, 길지 않게
- English 본문: **문단 3개, 모두 합쳐 50~75단어**. 한 문장 5~10단어, 현재형 위주, 이야기에는 짧은 대화.
- 국어 본문: **문단 3개, 6~8문장, 200~260자**. 한 문장은 짧게.
- 글쓰기: **두세 낱말짜리 문장 하나**(한글 10칸 안, 영어 5단어 안).
- 어려운 숫자·연도는 꼭 필요한 것 하나만.

## 한 편(unit)의 구성 — 영어·국어 같은 틀 (Bricks Reading 참고)
| 본문 쪽 | 활동 쪽 |
|---|---|
| 큰 사진/그림 + 제목 | 내용 확인: A 중심 내용, B 그림 고르기 2, C 3지선다 3 |
| 생각 열기(Let's Start) 질문 | 낱말 놀이(Word Zone) 3 |
| 본문(새 낱말 형광펜) | 내용 정리(Story Wrap Up) 3칸 |
| 옆 단: 새 낱말 6 · 깜짝 퀴즈 · 알고 있나요? | 내 생각 말하기 (+국어: 받아쓰기 5, 따라 쓰기) |

## 글쓰기 쪽 (`WRITE`)
- 오늘의 말씀 따라 쓰기: 아주 쉬운 성경 구절 또는 좋은 글 한 문장.
- 한글은 **격자 칸**(10칸, 십자 보조선)에 흐린 글씨 한 줄 + 빈 줄 두 줄, 낱말 연습 2개.
- 영어는 **4선**에 흐린 글씨 두 줄 + 빈 줄.
- 영어 구절은 World English Bible(공공 영역)을 `https://bible-api.com/<book+chapter:verse>?translation=web`로 받아 **글자 그대로**(구절의 일부만 써도 됨). 기억으로 쓰지 않는다.
- 한국어는 저작권 있는 번역본을 옮기지 않고, 아이 눈높이로 **쉽게 풀어 쓴 문장**을 쓴다.
- 필드: `ref_ko, ref, ko, en, words[2], prompt`

## 주제
- English: 같은 주제를 Fiction ↔ Nonfiction으로 이틀씩 짝짓기. 미국 초1~2 교과 주제(동물, 우주, 몸, 날씨, 지역사회, 세계, 소리, 음식)를 고루.
- 국어: 어린이신문에서 소재를 고른다(조금 지난 기사도 됨). 정보글 · 이야기 · 기사문 · 서평 · 동시 · 속담을 돌린다.
  - 소년한국일보 `https://www.kidshankook.kr/` — 스페셜뉴스, 지구촌뉴스, 글나라책마을, 속담 팩트체크, 과학 연재
  - 내친구서울 `https://kids.seoul.go.kr/` — 꼼꼼 서울소식, 두 배로 성장소, 어린이 기자 기사
  - 문장은 그대로 옮기지 않고 새로 쓴다. `sources`에 매체·제목을 적는다. 어린이 기자 이름은 쓰지 않는다.
- `kids/calendar.json`에 날짜별 계획(월~금만 사용).

## 사진·그림
- 사진: Wikimedia Commons 무료 라이선스만. `python3 kids/find_photo.py "검색어"` → `--save <Commons 페이지 URL> kids/photos/<날짜>-<en|ko>[2].jpg`
  - Commons는 연달아 받으면 429를 준다. 한 장 받고 20초 이상 쉰다.
  - 저장한 사진은 꼭 열어 보고 주제와 맞는지 확인한다.
  - 사진을 못 받을 때를 대비해 `hero`에 `photo`와 `scene`을 **둘 다** 넣는다(사진이 없으면 그림이 나온다).
- 그림: `scene = {bg, items:[[이모지, x%, y%, 크기%, 반전?]]}`. bg: day field autumn snow night house kitchen sea pitch stage space rain.

## 매주 작업 순서
1. `kids/tools/week<N>_en.py`(EN), `week<N>_ko.py`(KO, WRITE)에 5일치를 쓴다. 스키마는 `week2_*.py`와 같게.
2. 사진 찾기·저장.
3. `python3 kids/tools/build_week.py week<N>` → `node kids/build_index.js`
4. `node kids/make_pdf.js kids/pdf/week-<월요일>.pdf <5일치 json>` → 27쪽. `OVERFLOW`가 나오면 글을 줄인다. 그다음 `python3 -W ignore kids/tools/shrink_pdf.py kids/pdf/week-<월요일>.pdf`로 무손실 정리(약 3MB, **3.0MB 이하여야 메일에 붙는다**). `pdftoppm`으로 직접 확인(이모지 그림이 나오는지).
   - 3.0MB를 넘으면: `build_week.py`의 인쇄용 사진 폭(600)을 500으로 낮춰 다시 빌드하거나, 쪽수가 많으면 사진을 줄인다.
   - 절대 PyMuPDF `rewrite_images()`를 쓰지 않는다(이모지 그림이 지워진다).
5. 커밋 · push → **PDF를 첨부해서** 메일 발송: `node kids/make_email.js week-<월요일>.pdf <5일치 json> --attach` 출력을 htmlBody로, PDF는 Gmail `send_message`의 attachments(`content`: `sha256:<해시>:<절대경로>`, filename `week-<월요일>.pdf`, mimeType `application/pdf`)로 붙인다. 해시는 `sha256sum`으로. 첨부 용량 한도(약 3MB)를 넘겨 거절되면 메일 안 링크 버튼만 있는 판(`--attach` 없이)으로 보낸다.
6. PR을 만들어 main에 squash 병합(사이트 갱신).
