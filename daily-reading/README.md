# Daily English Reading

매일 아침 7시(KST), 실제 뉴스(The Korea Herald, CNBC, CNN)에서 고른 새 주제로
학습용 지문 15줄과 학습 PDF를 만들어 이메일로 보냅니다.

## 매일 하는 작업 (예약 작업이 이 순서대로 실행)
1. `WebSearch`(allowed_domains: koreaherald.com, cnbc.com, cnn.com)로 최근 1~2일 기사 중 흥미로운 주제 하나를 고른다.
   - `lessons/`에 이미 있는 주제와 겹치지 않게 하고, 분야를 돌아가며 고른다(테크·경제·과학·건강·문화·사회·국제·한국).
   - 시장 시세 같은 건조한 기사보다 이야기가 있는 기사를 고른다.
2. 기사 내용을 바탕으로 **15줄** 학습용 지문을 새로 쓴다(원문을 복사하지 않음). 수준은 Intermediate(중3~고1): 짧고 쉬운 문장, 어려운 어휘 최소화. 단어 8개, 숙어 5개, 핵심 문장 3개. PDF는 4쪽(최대 5쪽).
   - 각 줄은 의미 단위를 ` / `로 끊고, 주요 단어·숙어는 `**굵게**` 표시한다.
3. 아래 스키마로 `lessons/YYYY-MM-DD.json`을 쓴다. DAY 번호는 기존 lesson 수 + 1.
4. `node daily-reading/make_pdf.js lessons/YYYY-MM-DD.json <out>.pdf`
5. PDF를 첨부해 이메일 발송: 받는 사람 `sangwon.park@jbam.co.kr`,
   제목 `[Daily English] DAY n · <title>`, 본문에 오늘 제목·주제·원문 링크와 15줄 지문.
6. JSON을 커밋하고 이 브랜치에 push한다.

## JSON 스키마
`lessons/2026-11-09.json` 참고. 필드:
day, date, category, level, title, title_ko, source{outlet,title,url}, background_ko, warmup_q,
lines[15]{en,ko}, words[8]{word,ipa,pos,meaning,synonym,example}, idioms[5]{phrase,meaning,example},
key_sentences[3]{en,note}, questions[4]{q,options?,answer}, blanks[5]{sentence,answer}, output_task

## PDF 구성
학습 루틴(25분) → ① 배경지식 → ② 본문 → ③ 끊어 읽기·해석 → ④ 주요 단어 → ⑤ 숙어·표현
→ ⑥ 핵심 문장·문법 → ⑦ 확인 문제 → ⑧ 빈칸 → ⑨ 말하기·쓰기 → 정답
