# 분당 아파트 실거래 리포트

국토교통부 실거래가 CSV를 분석해 분당구 아파트 매매 요약 리포트를 PDF로 만든다.

## 무엇을 하나

data 폴더에 받아 둔 실거래가 CSV를 읽어, 동별 평당가 변동률과 이 달의 주목 거래, 점수 대비 저평가 단지를 계산한다. 결과를 1~2페이지 한글 PDF로 조판한다.

## 언제 쓰나

- 분당구 매매 흐름을 주간·월간으로 정리해야 할 때
- "분당 보고서 작성해줘", "이번 주 거래 요약해줘", "분당 PDF 보고서 만들어줘" 같은 요청

## 입력

- `data/아파트(매매)_실거래가_*.csv` (국토부 rt.molit.go.kr에서 내려받기, 인코딩 자동 감지)
- 선택: `scores_override.json` 단지별 점수 보정

## 실행

```bash
python scripts/pdf_report.py
```

옵션: `--data`, `--output`, `--min-deals`, `--top-n`. 한글 폰트는 macOS·Windows·Linux에서 자동 탐지한다.

## 산출물

`output/분당 아파트 매매_요약보고서_YYYYMMDD.pdf`. KPI 카드, 동별 변동률 막대, 주목 거래와 저평가 단지 표를 담는다.

## 구성

- `scripts/pdf_report.py` PDF 생성 엔트리포인트 (reportlab)
- `scripts/analyze.py` 분석 파이프라인 (평당가·변동률·단지 점수)
- `requirements.txt` 의존성 (reportlab, pandas)

## 이런 건 하지 않는다

- 단순 평균·건수 같은 CSV 통계만 묻는 질의
- 대시보드·웹 화면 같은 PDF가 아닌 결과물
- 분당 외 지역 분석

---

## 라이선스

MIT License · © 2026 AI ROASTING
