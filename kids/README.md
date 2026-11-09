# 🌞 아침 리딩 — 7세 · 초1 · 하루 20분 · 주간 묶음

일주일치(월~일) **English 1편 + 국어 1편**을 Bricks Reading 구성으로 만들어 한 번에 인쇄용 PDF로 보냅니다.
받는 사람: `sangwon.park@jbam.co.kr` · 제목 `[아침 리딩] M/D–M/D 주간 묶음 · English + 국어`

## 한 편(unit)의 구성 — 영어·국어 같은 틀
| Student Book (본문 쪽) | Workbook (활동 쪽) |
|---|---|
| Let's Start / 생각 열기 (질문 + 체크 2개) | Comprehension / 내용 확인: A 중심 내용, B 그림 고르기 2, C 3지선다 3 |
| New Words / 새 낱말 6 (그림+뜻) | Word Zone / 낱말 놀이 3 (새 문장 속 빈칸) |
| 본문 + 실사 사진(정보글) 또는 큰 그림(이야기), 새 낱말 형광펜 | Story Wrap Up / 내용 정리 (3칸 그래픽 오거나이저, a·b·c 넣기) |
| Pop Quiz / 깜짝 퀴즈 · You Know What? / 알고 있나요? | Talk! Your Turn / 내 생각 말하기 (+국어: 받아쓰기 5, 따라 쓰기) |

PDF: 표지(주간 계획표·스티커 칸) → 날마다 4쪽(English 2 + 국어 2) → 정답. 7일이면 30쪽.
사이트(`kids/index.html`): 같은 내용 + 문단별 🔊(읽는 단어 노란색), 🐢 천천히, 영어 해석 보기, 문제 맞히면 ⭐, Story Map 채우기, 받아쓰기 듣기.

## 수준 · 분량
- English: Bricks Reading 100·120·200 수준을 섞는다. 100 ≈ 70–90단어, 120 ≈ 90–120단어, 200 ≈ 130–160단어. 3–4문단, 이야기에는 대화문.
  같은 주제를 **Fiction ↔ Nonfiction 이틀 짝**으로(Bricks 120처럼: "Hit It, Maria!" / "Birthday in Different Lands").
  미국 초1~2 교과 주제(생물의 한살이, 지역사회, 오감, 날씨·계절, 지도·세계, 물질의 상태, 소리, 우주)를 고루 넣는다.
- 국어: 초1~2 눈높이, 3문단 8–12문장. 장르를 돌린다: 정보글 · 이야기 · 기사문(육하원칙) · 서평 · 동시 · 속담 · 옛이야기.

## 어디서 가져오나
- **국어**: 어린이신문을 읽고 소재를 고른다(조금 지난 기사도 괜찮음).
  - 소년한국일보 `https://www.kidshankook.kr/` — 스페셜뉴스, 지구촌뉴스, 글나라책마을(새로 나온 책·그림책), 「초등 속담 팩트체크」, 「시를 읽읍시다」, 우리 말·속담, 사회·상식, 과학 연재
  - 내친구서울 `https://kids.seoul.go.kr/` — 꼼꼼 서울소식, 두 배로 성장소(과학), 어린이 기자 기사(자유주제·지정주제), 숨은 속담 찾기 / 유아용 '내친구서울 새싹'
  - 기사 문장을 그대로 옮기지 않고 아이 눈높이로 **새로 쓴다**. `sources`에 매체·코너·날짜를 적는다. 어린이 기자 글·서평은 형식만 본뜬다.
- **영어**: 창작 이야기 + 사실은 WebSearch로 확인(Britannica, NASA Space Place, National Geographic Kids, Smithsonian 등). 확인 안 된 숫자는 쓰지 않는다.
- **사진**: Wikimedia Commons 무료 라이선스만(CC0·PD·CC BY·CC BY-SA). 내셔널지오그래픽·방송사 사진은 쓰지 않는다.
  - 찾기 `python3 kids/find_photo.py "검색어"` → 저장 `python3 kids/find_photo.py --save <Commons 페이지 URL> kids/photos/<날짜>-<en|ko>[2].jpg` (작가·라이선스가 `photos/credits.json`에 자동 기록)
  - 저장한 사진은 꼭 열어 보고 주제에 맞는지, 아이가 봐도 괜찮은지 확인. Commons가 429를 주면 기다렸다 다시(스크립트가 자동 재시도).
- **그림**(이야기·사진 없는 문단): `scene = {bg, items:[[이모지, x%, y%, 크기%, 반전?]]}`. bg: day field autumn snow night house kitchen sea pitch stage space rain. 주인공 크게(22–34), 소품 작게. 글자 박힌 이모지(📅 등)는 피한다.

## 매주 작업 순서 (예약 작업)
1. `kids/calendar.json`에서 다음 주(월~일) 주제를 확인한다. 4주 이상 남지 않았으면 같은 규칙으로 4주치를 더 채운다.
2. 어린이신문 두 곳을 열어 국어 소재를 고르고, 영어 사실은 WebSearch로 확인한다.
3. `kids/tools/weekN_en.py`, `kids/tools/weekN_ko.py`에 7일치 `EN`/`KO` 딕셔너리를 쓴다(스키마는 `week1_*.py` 참고).
4. 사진을 찾고 저장한다(정보글마다 1–2장).
5. `python3 kids/tools/build_week.py weekN` → `node kids/build_index.js`
6. `node kids/make_pdf.js kids/pdf/week-<월요일날짜>.pdf kids/lessons/<7일치>.json` — `OVERFLOW pages:`가 나오면 그 날 글을 줄이고 다시. `pdftoppm`으로 몇 쪽 열어 확인.
7. 커밋 · push.
8. `node kids/make_email.js week-<월요일>.pdf <7일치 json>` 출력 HTML을 Gmail `send_message` htmlBody로 보낸다(PDF는 링크, 8MB라 첨부 불가).
