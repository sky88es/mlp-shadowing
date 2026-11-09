# 🌞 아침 리딩 (7세 · 초1 · 하루 20분)

매일 아침 **English 지문 1개 + 국어 지문 1개**를 Brick Reading처럼 짧은 비문학(6문장)으로 만들어
사이트·인쇄용 PDF·메일로 보냅니다. 매일 새로운 주제, 동물·자연·세계 이야기는 **진짜 사진**과 함께.

- 사이트: `kids/index.html` (GitHub Pages가 `main`에 켜져 있으면 `https://sky88es.github.io/mlp-shadowing/kids/`)
  날짜별 모아 보기, 실사 사진, 장면 그림, 문장·단어 🔊 듣기(기기 음성, 읽는 단어 노란색), 🐢 천천히, 확인 문제 ⭐ 모으기, 받아쓰기 듣기, 다음 주제 미리 보기.
- PDF 4쪽: ① English 읽기(사진+6장면) ② English 워크북 ③ 국어 읽기 ④ 국어 활동.
- 메일: 받는 사람 `sangwon.park@jbam.co.kr`, 제목 `[아침 리딩] DAY n · <English 제목> / <국어 제목>`.

## 하루 20분
| | English 10분 | 국어 10분 |
|---|---|---|
| 1 | 🎧 듣기 2분 | 🎧 듣기 2분 |
| 2 | 🗣 한 문장씩 따라 읽기 3분 | 📢 소리 내어 읽기 3분 |
| 3 | 🃏 단어 2분 | 🃏 낱말·흉내 내는 말 2분 |
| 4 | ⭐ 문제 3분 | ⭐ 문제·받아쓰기 3분 |

## 주제 (요일 틀 + `calendar.json` 날짜별 계획)
| 요일 | English | 국어 |
|---|---|---|
| 월 | 🐾 Animals (실사 사진) | 📅 오늘은 무슨 날? · 계절·절기 |
| 화 | 🌍 Around the World | ✈️ 세계 여러 나라 이야기 |
| 수 | ⚽ Sports (축구·운동) | 🐙 신기한 동물 (실사 사진) |
| 목 | 🔬 Science · Body | 🤔 생활 속 과학 궁금증 |
| 금 | 🍕 Food · Cooking | 🍜 맛있는 음식 이야기 |
| 토 | 🎸 Music · Hobbies | 🏃 놀이 · 운동 · 음악 |
| 일 | 🌟 Amazing True Story | 📜 옛이야기 · 속담 |
- 그날의 주제는 `calendar.json`의 날짜 항목을 따른다. 기념일·절기가 있으면 그게 먼저.
- 사실 확인이 안 되면 같은 요일 분야의 다른 재미있는 주제로 바꾸고 `calendar.json`도 고친다.
- 달력이 7일 이내로 남으면 다음 4주치를 같은 규칙으로 추가한다(최근 60일과 겹치지 않게).

## 어디서 가져오나
- **사실**: WebSearch로 확인한 내용만 쓴다. 우선 출처: Britannica, NASA Space Place, National Geographic Kids, Smithsonian, 국립생물자원관, 국립과천과학관, 국립국어원, 한국민족문화대백과, 국가기록원, 정부 보도자료. 문장은 베끼지 않고 새로 쓴다.
- **사진**: Wikimedia Commons의 무료 라이선스(CC0·PD·CC BY·CC BY-SA)만. 작가·라이선스·원본 링크를 반드시 표시.
  내셔널지오그래픽·방송사(세계테마기행 등) 사진·영상은 저작권이 있어 쓰지 않는다.
  - 찾기: `python3 kids/find_photo.py "검색어"` (featured/quality 우선)
  - 저장: `python3 kids/find_photo.py --save <commons 페이지 URL> kids/photos/YYYY-MM-DD-en.jpg` → 출력된 credit/license/page를 lesson `photo`에 넣는다.
  - 반드시 저장한 사진을 직접 열어 보고 주제와 맞는지, 아이가 봐도 괜찮은지 확인한다. 맞는 사진이 없으면 `photo`를 빼도 된다.
- **옛이야기·속담**: 작자 미상 전래동화, 이솝 우화 등 공공 영역만 짧게 다시 쓴다.

## 분량·수준
- English: **6문장**(문장당 7~12단어, 현재형 위주), 사진 1장, 장면 그림 6개, 단어 8개, 정리 그림(organizer) 4단계,
  문제 4개(Main Idea / Detail / True·False / Vocabulary), Talk 1개.
- 국어: **6문장**(초1~2 수준, 짧은 문장), 사진 1장, 장면 그림 6개, 새 낱말 4개, 흉내 내는 말 3개, organizer 4단계,
  문제 4개(중심 내용 / 내용 / O·X / 낱말), 받아쓰기 5개, 따라 쓰기 1문장, 써 보기 1개, 그려 보기 1개.
- hook_ko: 아이가 "어? 정말?" 하게 만드는 첫 질문 한 줄.
- 무섭거나 슬픈 내용, 폭력, 특정 상표 광고성 내용은 피한다.

## 그림(scene)
`scene = { bg, items: [[이모지, x%, y%, 크기(가로 대비 %), 좌우반전?], ...] }`, x·y는 중심점.
bg: `autumn` `field` `snow` `night` `day` `sea` `house` `space`. 주인공을 크게(20~35), 소품을 작게.
날짜·글자가 박힌 이모지(📅 등)는 쓰지 않는다.

## 매일 작업 순서
1. DAY = 기존 lesson 수 + 1, 날짜는 Asia/Seoul. `calendar.json`에서 오늘 주제 확인.
2. WebSearch로 사실 확인 → `kids/lessons/YYYY-MM-DD.json` 작성(스키마: `2026-11-09.json`).
3. 사진 찾기·저장(위 방법) → lesson의 `en.photo`/`ko.photo`.
4. `node kids/build_index.js`
5. `node kids/make_pdf.js kids/lessons/YYYY-MM-DD.json kids/pdf/YYYY-MM-DD.pdf` → `pdfinfo`로 **4쪽** 확인,
   `pdftoppm`으로 그려서 잘린 곳이 없는지 본다(넘치면 문장을 줄인다).
6. 커밋 후 push.
7. `node kids/make_email.js kids/lessons/YYYY-MM-DD.json` 출력 HTML을 Gmail `send_message` htmlBody로 발송.

네트워크: 사진에는 `commons.wikimedia.org`, `upload.wikimedia.org`, `thumb.wikimedia.org` 접속이 필요하다(클라우드 환경 `mlp-shadowing`에 허용됨).
