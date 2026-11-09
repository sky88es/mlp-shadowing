# Daily English Reading

매일 아침 7시(KST), 실제 뉴스(The Korea Herald, CNBC, CNN)에서 고른 새 주제로
학습용 지문 15줄과 학습 PDF를 만들어 이메일로 보냅니다.

## 매일 하는 작업 (예약 작업이 이 순서대로 실행)
1. `WebSearch`(allowed_domains: koreaherald.com, cnbc.com, cnn.com, mode: extended)로 최근 2~3일 기사 중 **재미있고 이야기가 있는** 주제 하나를 고른다.
   - 목표는 "읽는 게 즐거운 아침". 딱딱한 정치·선거·주가 시황·전쟁·사건사고는 피한다.
   - 아래 분야를 요일별로 돌린다(같은 분야 연속 금지, `lessons/`의 최근 7개 category를 확인해 겹치지 않게):
     | 요일 | 분야 예시 (매체는 아래 순환 규칙을 따름) |
     |---|---|
     | 월 | 테크·가젯·AI (신기한 신제품, 로봇, 앱 트렌드) |
     | 화 | 음식·여행 (세계 음식 트렌드, 여행지, 호텔·항공 이야기) |
     | 수 | K-컬처·엔터 (K-pop, 드라마, 영화, 웹툰, 한국 생활) |
     | 목 | 과학·우주·동물 (신기한 연구, 동물 이야기, 우주 탐사) |
     | 금 | 돈·커리어·라이프 (재테크 팁, 직장 생활, 소비 트렌드, 유명 CEO 이야기) |
     | 토 | 스포츠·건강 (경기 뒷이야기, 운동·수면·식단 연구) |
     | 일 | 문화·트렌드·사람 (SNS 트렌드, 독특한 사람들 이야기, 브랜드 이야기) |
   - 매체는 매일 번갈아 쓴다: 직전 lesson의 source.outlet 다음 순서로 **CNBC → CNN → The Korea Herald → CNBC …** (같은 매체 연속 금지).
     그날 순서의 매체에 그날 분야의 재미있는 기사가 없으면 분야를 바꾸더라도 매체 순서는 지킨다.
   - 제목은 호기심이 생기게 쓴다(예: "Why Do Koreans Love Convenience Stores?"). warm-up 질문도 재미있게.
2. 기사 내용을 바탕으로 **15줄** 학습용 지문을 새로 쓴다(원문을 복사하지 않음). 수준은 Intermediate(중3~고1): 짧고 쉬운 문장, 어려운 어휘 최소화. 단어 8개, 숙어 5개, 핵심 문장 3개. PDF는 4쪽(최대 5쪽).
   - 각 줄은 의미 단위를 ` / `로 끊고, 주요 단어·숙어는 `**굵게**` 표시한다.
3. 아래 스키마로 `lessons/YYYY-MM-DD.json`을 쓴다. DAY 번호는 기존 lesson 수 + 1.
4. `node daily-reading/make_pdf.js daily-reading/lessons/YYYY-MM-DD.json daily-reading/pdf/YYYY-MM-DD.pdf` → 4쪽(최대 5쪽)인지 `pdfinfo`로 확인.
5. JSON과 PDF를 커밋하고 `ccr-7681b3cb-dx280m` 브랜치에 push한다.
6. 이메일 발송 (받는 사람 `sangwon.park@jbam.co.kr`, 제목 `[Daily English] DAY n · <title>`):
   - Brevo 키가 환경에 저장돼 있으면: `daily-reading/send_email.sh <json> <pdf>` → PDF 첨부 발송.
   - 아니면: `node daily-reading/make_email.js <json>` 출력(HTML, 학습 내용 전체 포함)을 그대로 Gmail `send_message`의 htmlBody로 발송.
     본문에 PDF 링크 포함: https://raw.githubusercontent.com/sky88es/mlp-shadowing/ccr-7681b3cb-dx280m/daily-reading/pdf/YYYY-MM-DD.pdf

## JSON 스키마
`lessons/2026-11-08.json` 참고. 필드:
day, date, category, level, title, title_ko, source{outlet,title,url}, background_ko, warmup_q,
lines[15]{en,ko}, words[8]{word,ipa,pos,meaning,synonym,example}, idioms[5]{phrase,meaning,example},
key_sentences[3]{en,note}, questions[4]{q,options?,answer}, blanks[5]{sentence,answer}, output_task

## PDF 구성
학습 루틴(25분) → ① 배경지식 → ② 본문 → ③ 끊어 읽기·해석 → ④ 주요 단어 → ⑤ 숙어·표현
→ ⑥ 핵심 문장·문법 → ⑦ 확인 문제 → ⑧ 빈칸 → ⑨ 말하기·쓰기 → 정답

---

# Daily 국문 읽기 (영어와 함께 매일 발송)

생각할 거리를 주는 한국어 글 한 편. 영어 메일을 보낸 직후 별도 메일로 보낸다.

## 요일별 분야
| 요일 | 분야 | 내용 |
|---|---|---|
| 월 | 시 한 편 | 저작권 만료 근현대 시 **전문**(윤동주·김소월·한용운·이육사·정지용·백석(1996 사망 → 보호중, 제외) 등 1962년 이전 사망 시인만) + 해설 |
| 화 | 서평 | 좋은 책 한 권을 골라 직접 쓴 서평(1,200~1,600자). 인용은 짧게 1~2문장만. |
| 수 | 고전 한 구절 | 논어·맹자·장자·도덕경·명심보감·채근담·소크라테스·세네카·마르쿠스 아우렐리우스 등의 한 구절(번역은 직접) + 해설 |
| 목 | 에세이 | 일·관계·시간·습관·행복 등 생각할 주제로 직접 쓴 짧은 에세이(1,200~1,600자) |
| 금 | 인물 이야기 | 한 사람의 선택과 태도를 다룬 이야기(사실 기반, 1,200~1,600자) |
| 토 | 소설 한 장면 | 저작권 만료 한국 근대소설(김유정·현진건·이효석·나도향·이상 등)의 한 장면 발췌 + 해설 |
| 일 | 한 주 돌아보기 | 이번 주 영어·국문 주제를 엮은 짧은 글 + 일주일을 돌아보는 질문 |

- 저작권: 생존 작가나 1963년 이후 사망 작가의 시·소설 전문은 싣지 않는다. 서평·에세이·해설은 직접 쓴다.
- 사실(연도, 생애 등)은 확실한 것만 쓰고, 불확실하면 빼거나 WebSearch로 확인한다.
- 톤: 차분하고 따뜻하게. 정답을 주기보다 질문을 남긴다.

## 매일 작업
1. `daily-reading/kr/lessons/YYYY-MM-DD.json` 작성 (스키마: `kr/lessons/2026-11-09.json` 참고)
   필드: day, date, category, title, work, intro, text_type("poem"|"prose"), text_heading, text, text_source, notes(문단은 빈 줄로 구분), words[3~6]{word,meaning}, questions[3], quote
2. `node daily-reading/kr/make_pdf_kr.js <json> daily-reading/kr/pdf/YYYY-MM-DD.pdf` → 2~4쪽 확인
3. 커밋·push 후 `node daily-reading/kr/make_email_kr.js <json>` 출력을 Gmail htmlBody로 발송.
   제목 `[Daily 국문] DAY n · <title>`, 받는 사람 `sangwon.park@jbam.co.kr`.
