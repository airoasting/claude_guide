# quote-light 상세 레퍼런스

SKILL.md 본문에서 자주 필요하지 않은 상세 정보를 모아둔 파일. 입력 JSON 전체 스키마,
엑셀 양식 구조, 공급자 정보 고정 방법, 트러블슈팅을 다룬다.

## 입력 JSON 전체 스키마

`scripts/fill_quote.py`가 읽는 입력 형식이다. `customer.company`와 항목 1개(제품명·수량·단가)만
있으면 동작한다. 나머지는 모두 옵션이며, 빈 값은 그냥 비워둔다.

```json
{
    "customer": {
        "company":        "string",     // 법인명 (필수)
        "address":        "string",     // 주소
        "contact_person": "string",     // 담당자
        "phone":          "string",     // 연락처
        "email":          "string",     // 이메일
        "quote_number":   "string",     // 견적번호 (없으면 비움)
        "issue_date":     "YYYY-MM-DD",  // 발행일 (없으면 시트의 TODAY())
        "validity":       "string",     // 유효기간 (기본: 발행일로부터 30일)
        "department":     "string"      // 담당부서
    },
    "supplier": {                        // 공급자 (1.견적서 시트, 객체 자체가 옵션)
        "company":             "string", // 기본 "(주)샘플"
        "registration_number": "string",
        "ceo":                 "string",
        "address":             "string",
        "department":          "string",
        "phone":               "string"
    },
    "items": [                           // 제품 항목 (최대 5개, 초과분은 잘림)
        {
            "product":    "string",      // 제품명 (자유 입력)
            "quantity":   100,           // 수량
            "unit_price": 35000,         // 단가 (원)
            "note":       "string"       // 비고
        }
    ]
}
```

`supplier`를 생략하면 견적서 시트의 공급자 박스는 법인명 "(주)샘플", 나머지 빈칸으로 남는다.

## 엑셀 양식 구조

두 개 시트로 구성된다. 사용자는 `0.입력` 시트만 채우면 `1.견적서` 시트가 수식으로 자동 채워진다.

### 0.입력 시트
- 고객사 정보(5~7행): 법인명, 담당자, 발행일, 주소, 연락처, 유효기간, 견적번호, 이메일, 담당부서
- 견적 항목(11~15행, 최대 5개):
  - A=순번(자동), B:E=제품명(병합·직접입력), F=수량, G=단가
  - H=공급가액(자동 `수량 × 단가`), I:K=비고(병합)
- 합계(17행): `H17 = SUM(H11:H15)`, VAT 별도

### 1.견적서 시트
`0.입력` 시트를 참조해 자동 채워지는 출력용 견적서. 우측 "공급자" 박스는 법인명만 "(주)샘플"로
하드코딩된 자리표시자다. 실사용 전 본인 회사 정보로 교체한다(아래 참고).

수식 기반이므로 openpyxl이 저장한 직후엔 계산값이 비어 있고, Excel/LibreOffice에서 열면
자동 재계산된다. 미리 계산된 값이 필요하면 트러블슈팅 항목 참고.

## 공급자 정보 고정 방법

### 방법 A — 입력에 supplier 넣기(개별 견적서)
`fill_quote.py` 입력 JSON에 `supplier` 객체를 추가하면 그 견적서에만 반영된다.

### 방법 B — 템플릿 재생성(영구 변경)
`scripts/create_template.py`의 `build_quote_sheet` 함수 안 `info_rows` 변수에서
우측 값(다섯 번째 항목)을 본인 회사 정보로 바꾼 뒤 재생성한다.

```bash
python3 scripts/create_template.py assets/quote_template.xlsx
```

### 방법 C — 생성된 파일에서 직접 수정(개별 견적서)
견적서 시트의 H5~H10 셀을 Excel에서 직접 편집.

## 디자인/행 수 변경

표 디자인이나 최대 항목 수(현재 5개)를 바꾸려면 `create_template.py`를 편집하고 재생성한 뒤,
`fill_quote.py`의 `MAX_ITEMS` 상수도 같이 맞춘다. 두 시트의 항목 행 범위를 함께 늘려야 한다.

## 트러블슈팅

### 수식 결과가 빈칸으로 보임(Excel에서)
openpyxl 파일은 수식만 저장하고 계산값은 저장하지 않는다. Excel/LibreOffice에서 열면 정상
재계산된다. 대부분의 경우 그대로 전달해도 문제없다. 미리 계산된 값이 꼭 필요하면:

```bash
# Claude.ai (해당 스크립트가 있을 때)
python3 /mnt/skills/public/xlsx/scripts/recalc.py output.xlsx

# Claude Code 등 위 스크립트가 없는 환경 — LibreOffice가 있으면 headless 재계산
libreoffice --headless --convert-to xlsx --outdir <폴더> output.xlsx
```

둘 다 없으면 재계산은 건너뛰고, 사용자에게 "Excel에서 열면 합계가 자동 계산된다"고 안내한다.

### 한글 깨짐
폰트는 "맑은 고딕"으로 지정됨. Mac에서는 "AppleGothic" 등으로 자동 대체되지만 표시 문제 없음.

### 템플릿이 없거나 손상됨
`fill_quote.py`는 `assets/quote_template.xlsx`가 없거나 열리지 않으면 `create_template.py`를
자동 실행해 재생성한 뒤 이어서 채운다. 보통은 별도 조치가 필요 없다. 자동 재생성까지 실패하면
(`❌ 템플릿 재생성 실패`) 수동으로 한 번 생성한 뒤 다시 실행한다:

```bash
python3 scripts/create_template.py assets/quote_template.xlsx
```

### 수량·단가가 숫자가 아니거나 발행일 형식이 다름
`fill_quote.py`가 수량·단가를 숫자로 바꾸지 못하면(예: "협의", "별도") 경고(`⚠️`)를 출력하고
그 셀을 비운다. `"35,000"`, `"35000원"` 같은 표기는 자동 정리해 숫자로 넣는다. 발행일이
`YYYY-MM-DD`가 아니면 경고 후 입력값을 문자열 그대로 넣으므로, 날짜 정렬·표기가 필요하면
`0.입력` 시트 B7을 직접 수정한다.
