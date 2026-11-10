# CRE Radar – 한국 상업용부동산 데일리 브리핑

A4 폭(794px) 이메일과 A4 PDF를 같은 데이터(JSON)로 만듭니다.

```bash
sh cre-briefing/build.sh cre-briefing/data/YYYY-MM-DD.json /tmp/cre
# -> /tmp/cre/email.html  (메일 본문 = 01~06 전체, A4 폭 794px, 차트는 cid:att1. </tr> 마다 줄바꿈되어 있어 나눠 읽기 쉬움)
#    /tmp/cre/email.txt   (텍스트 대체본)
#    /tmp/cre/chart.png   (인라인 차트, 첨부 #1, inline:true)
#    /tmp/cre/CRE_Radar_YYYY-MM-DD.pdf (A4 PDF, 첨부 #0)
```

메일 발송 시 첨부 순서: `[PDF(첨부), chart.png(inline, cid:att1), chart2.png(inline, cid:att2)]` — 본문의 `cid:att1`이 차트를 가리킵니다.

## 섹션 순서 (중복 없이 한 번씩만)
1. **Today's Brief**: 톱 스토리 1개 + 핵심 포인트 4개 (각 포인트는 상세 섹션 번호 → 0X)
2. **Market Indicators**: 금리 타일 6개, 조달금리 vs 캡레이트 차트, 밸류에이션 3개
3. **Deals & Financing**: 거래·조달 표(규모·금리·단계) + 자산별 현재 선순위 수준
4. **Research Desk**: 자문사(CBRE·C&W·Savills·JLL·Colliers·Newmark·KnightFrank), 리서치(알스퀘어·젠스타메이트·야놀자리서치·밸류맵·부동산플래닛), 증권사 리포트, 상장리츠 IR/공시 — `research.reports[]`(house, kind, period, title, metrics[[라벨,값]], note, src, url, ref) + `research.chart`(하우스별 비교, 두 번째 인라인 이미지 cid:att2)
5. **News Digest** (구 Sector Briefing): 오피스·호텔·리테일·데이터센터·물류·리츠·개발 (03에 나온 딜은 반복하지 않음)
6. **Regulation**: 자본시장법 / 부동산투자회사법 / 금융규제 / 부동산 일반, 상태 배지(시행·시행 예정·공포·입법예고·검토·추진)
7. **Insight**: 분석 코멘트 3~4개

JSON 예시는 `data/2026-11-10.json`. 모든 항목에 `src`(매체)와 `url`(원문)을 넣습니다.
