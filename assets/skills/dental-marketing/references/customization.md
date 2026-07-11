# 커스터마이징 가이드 — 지역·과목·가격·연락처 변경

세 스크립트(`make_link_table.js`, `make_analysis.js`, `make_proposal.js`)는 데이터가 코드 안에 들어 있다. 변경 시 아래를 따른다.

---

## 0. 한국어 텍스트를 안전하게 고치는 법 (먼저 읽기)

스크립트 안의 한국어 문자열을 고칠 때 **Edit 도구는 쓰지 않는다.** Edit는 UTF-8 멀티바이트(한글) 경계를 잘못 잡아 파일을 깨뜨릴 수 있다. 대신 **Python으로 읽고 → 치환하고 → utf-8로 다시 쓴다.** 아래 두 가지 방법 중 하나를 쓴다.

### 방법 1 — 문자열 한두 개만 바꿀 때 (read → replace → write)

```python
# fix_str.py — 파일 하나에서 정확히 일치하는 문자열을 치환한다.
from pathlib import Path

PATH = "scripts/make_proposal.js"   # 대상 파일
OLD  = "강남구·수지구 치과 30개소"      # 바꿀 원문 (정확히 일치해야 함)
NEW  = "마포구·분당구 치과 30개소"      # 새 문자열

p = Path(PATH)
text = p.read_text(encoding="utf-8")          # 1) utf-8로 읽기
assert text.count(OLD) > 0, f"원문 '{OLD}' 없음 — 철자/공백 확인"
text = text.replace(OLD, NEW)                  # 2) 치환
p.write_text(text, encoding="utf-8")          # 3) utf-8로 다시 쓰기
print(f"치환 완료: '{OLD}' → '{NEW}'  ({PATH})")
```

여러 문자열을 한 번에 바꾸려면 `(OLD, NEW)` 쌍을 리스트로 돌린다:

```python
from pathlib import Path
PATH = "scripts/make_proposal.js"
REPLACEMENTS = [
    ("강남구·수지구", "마포구·분당구"),
    ("paulyoo95@gmail.com", "new-contact@example.com"),  # 또는 D절 BRANDLAB_EMAIL 한 줄만 수정
]
p = Path(PATH)
text = p.read_text(encoding="utf-8")
for old, new in REPLACEMENTS:
    assert old in text, f"원문 '{old}' 없음"
    text = text.replace(old, new)
p.write_text(text, encoding="utf-8")
print("모든 치환 완료")
```

### 방법 2 — 배열/표 전체를 갈아끼울 때 (파일 전체 재작성)

병원 데이터 배열이나 가격표처럼 블록 전체를 교체할 때는 새 내용으로 **파일 전체를 utf-8로 다시 쓴다.**

```python
from pathlib import Path
new_source = r'''...새 .js 전체 내용...'''   # 따옴표 충돌 피하려면 raw 삼중따옴표
Path("scripts/make_link_table.js").write_text(new_source, encoding="utf-8")
```

### 고친 뒤 반드시 검증

```bash
node scripts/make_proposal.js /tmp/out   # 오류 없이 docx가 생기는지 확인
```

`SyntaxError`나 깨진 글자(▒, �)가 보이면 직전 정상 버전으로 롤백하고 방법 1/2를 다시 적용한다.

---

## A. 조사 지역 변경

세 파일에서(모든 텍스트 수정은 §0의 Python 방법으로):
1. 병원 데이터 배열 교체 (§E 참고 — 이 데이터가 핵심)
2. 지역명 텍스트 수정 (헤더·보고서 제목·분석 내용)
3. 지역별 기회 분석 섹션 텍스트 수정

예시:
```
강남구 → 마포구    검색: "마포구 치과 홈페이지 추천 목록"
수지구 → 분당구    검색: "분당 치과 네이버플레이스 순위"
```

---

## B. 의료 과목 변경

치과 외 한의원·피부과·성형외과 등에도 적용 가능하다.

| 과목 | SKILL.md / 스크립트 키워드 교체 | 주요 플랫폼 추가 |
|------|-------------------------------|-------------|
| 피부과 | 치과 → 피부과, 레이저, 보톡스 | 강남언니, 인스타그램 |
| 한의원 | 치과 → 한의원, 한방, 침 | 모두닥, 네이버 블로그 |
| 성형외과 | 치과 → 성형외과, 코성형 | 바비톡, 강남언니 |

---

## C. 가격 변경

`make_proposal.js`의 `priceTable` 배열에서 가격 텍스트만 수정한다:
```javascript
["(A) 채널 스타터", "...", "월 80만원", "..."],
["(B) 채널 그로스", "...", "월 200만원", "..."],
["(C) 브랜드 그로스", "...", "월 400만원", "..."],
// → 월 금액을 원하는 금액으로 변경
```

---

## D. 연락처 변경

연락처 이메일은 각 스크립트 상단의 **`BRANDLAB_EMAIL` 상수 한 줄**에서만 정의되고, 본문은 그 상수를 참조한다. 따라서 **그 한 줄만 고치면** 표지·CTA·보고서 푸터까지 한 번에 바뀐다.

- `make_proposal.js` 상단: `const BRANDLAB_EMAIL = 'paulyoo95@gmail.com';`
- `make_analysis.js` 상단: `const BRANDLAB_EMAIL = 'paulyoo95@gmail.com';`
- `make_link_table.js`는 이메일을 출력하지 않는다(수정 불필요).

(`make_link_table.js`/`make_analysis.js`에는 이메일이 더 이상 본문에 하드코딩되어 있지 않으므로 본문을 뒤질 필요가 없다.) §0의 Python 방법으로 위 두 줄만 치환하면 된다. 현재 기본값: `paulyoo95@gmail.com`

---

## E. 병원 데이터(샘플 30곳) 교체

`make_link_table.js`의 `gangnam`(15곳)·`suji`(15곳) 배열과 `make_analysis.js`의 `channelSummaryTable` 행 데이터는 **강남구·수지구 조사 결과를 담은 샘플 데이터**다. 다른 지역으로 재사용하려면 이 데이터를 새 병원 목록으로 갈아끼운다.

- **두 파일을 함께** 갱신한다. 같은 병원 집합이 `make_link_table.js`(링크 표)와 `make_analysis.js`(채널 현황 표) 양쪽에 들어 있다.
- 한 병원 객체 형태(`make_link_table.js`):
  ```javascript
  { num: "1", name: "병원명", area: "지역", home: "https://...", blog: null,
    place: "https://...", sns: [{ label: "Instagram", url: "https://..." }] }
  ```
  - 링크가 없으면 `home`/`blog`/`place`는 `null`, `sns`는 `[]`로 둔다(표에 "미확인"/"-"으로 표기됨).
- `make_analysis.js`의 채널 표는 `["병원명","✅","❌",...]` 문자열 행 배열이다(✅ 운영 / ❌ 미운영).
- 배열 전체 교체는 §0 **방법 2(파일 전체 재작성)** 로 하는 것이 안전하다. 교체 후 헤더·제목의 지역명(§A 2·3)도 함께 고친다.
- 병원 수를 30곳이 아닌 다른 수로 바꾸면 SKILL.md·`document-specs.md`의 "30개" 표기도 함께 맞춘다.
