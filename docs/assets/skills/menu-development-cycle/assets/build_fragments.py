#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_fragments.py — 스테이지별 HTML 조각(fragment) 생성기
각 스테이지를 fragments/stage_X-Y.html 로 독립 저장한다.
Claude(스킬 실행 시)는 이 조각들의 {{...}} 자리표시자를 실제 내용으로 채운 뒤
merge.py 로 _shell.html 과 합쳐 단일 결과 HTML을 만든다.
"""
import os

OUT = os.path.join(os.path.dirname(__file__), "fragments")
os.makedirs(OUT, exist_ok=True)

PHASES = {
    1: ("기획 단계", "시장 수요·브랜드 방향에 맞는 신메뉴 컨셉 설정", "var(--stage1)", "1"),
    2: ("개발 단계", "시제품 구현 · 원가/수율/위생 검증", "var(--stage2)", "2"),
    3: ("검토 단계", "경영진 시연(관능 정량평가) · 도입 결정 게이트", "var(--stage3)", "3"),
    4: ("표준화 단계", "레시피 규격화(CCP 포함) · 매장 배포용 문서화", "var(--stage4)", "4"),
    5: ("도입 단계", "매장 교육(위생 포함) · 전 매장 메뉴 반영", "var(--stage5)", "5"),
    6: ("출시 후 점검 단계", "실판매·품질·고객 반응 점검 및 유지/개선/단종 판정", "var(--stage6)", "6"),
}

# 스테이지 정의: (번호, 이름, [페르소나 5인+], 페이즈, gate?, sensory?)
# 주의: 1-1, 2-1 은 v3에서 사용자 주도 인터랙티브 조각으로 직접 작성됨(자동 생성 제외).
STAGES = [
    ("2-2", "원가·수율 검토", ["메뉴개발팀장","메뉴개발팀원","물류팀장","재무·원가담당","품질안전관리자"], 2, False, False),
    ("3-1", "경영진 시연·평가", ["메뉴개발팀장","마케팅팀장","기획팀장","성장운영본부장","대표","고객"], 3, False, True),
    ("3-2", "도입 결정 게이트", ["메뉴개발팀장","마케팅팀장","기획팀장","성장운영본부장","대표","재무·원가담당"], 3, True, False),
    ("4-1", "레시피 표준화", ["메뉴개발팀장","메뉴개발팀원","현장 조리장","물류팀장","품질안전관리자"], 4, False, False),
    ("4-2", "조리 매뉴얼 문서화", ["메뉴개발팀장","메뉴개발팀원","현장 조리장","운영본부장","품질안전관리자"], 4, False, False),
    ("5-1", "매장 교육", ["메뉴개발팀장","현장 조리장","운영본부장","영업팀장","품질안전관리자"], 5, False, False),
    ("5-2", "메뉴 도입·전환", ["메뉴개발팀장","영업팀장","현장 조리장","운영본부장","성장운영본부장"], 5, False, False),
    ("6-1", "출시 후 점검", ["메뉴개발팀장","영업팀장","마케팅팀장","운영본부장","품질안전관리자","고객"], 6, True, False),
]

# 스테이지별 ✓ 체크리스트 (라벨, 필수★ 여부). crit=위생/핵심 항목
CHECKLISTS = {
    "1-1": [("트렌드·경쟁사 자료 Tier 분류 3건+",0),("타깃·식사시간대 정의",0),("목표 판매가·원가율 수치 설정",1),
            ("카니발리제이션 검토 기록",0),("핵심 식재료 매입 연계 확인",0),("식재료 리스크 가설 1건+",0),("컨셉 후보별 포지셔닝 문장",0)],
    "2-1": [("1차 레시피 숫자 계량 기록",1),("자체 시식(맛·식감·향·외관)",0),("조리 시간·난이도 측정",0),
            ("n차 보완 이력",0),("매장 재현 가능성 검토",0),("알레르기 유발 원료 1차 식별",1),("핵심 위해요소 발생지점 점검",1),("손맛·화력 의존 공정 치환",0)],
    "2-2": [("BOM(전 재료·분량·실조사 단가)",1),("가식부 수율 반영 실사용량",1),("원가율 산정·목표 충족",1),
            ("판매가/구성 변경 시뮬레이션",0),("포장재·소모품 원가 반영",1),("목표 마진·손익분기 판매량",1),("보관조건·소비기한 로스율 가정",1),("운영비 별도 분리 명시",0)],
    "3-1": [("실매장 제공 형태 시연",0),("조리~제공 소요시간 측정",0),("원가·판매가·마진 자료 동반",0),
            ("관능 정량 시트 작성(평균)",1),("경영진 의견·결정 기록",0),("보완 항목 우선순위 정리",0)],
    "3-2": [("관능 평균 합격선 이상",1),("원가율·마진 목표 충족",1),("운영 적합성 확인",1),
            ("위생·표시 치명결함 없음",1),("판정 결과·사유 명문화",1)],
    "4-1": [("전 재료 g·ml·개수 명시",1),("1인분/세트 분량·중량 규격",1),("조리순서 단계 분해",0),
            ("포션 도구·용기 규격 지정",0),("배치·전처리 기준 포함",0),("CCP 가열 중심온도·시간 명시",1),("보관온도·소비기한·재가열 기준",1),("교차오염 방지 동선·기구 분리",1)],
    "4-2": [("조리 매뉴얼(순서·계량·주의)",0),("BOM·원가표(발주 연계)",0),("핵심 공정 주의사항·품질기준",0),
            ("사진·영상 가이드 안내",0),("알레르기 표시(메뉴판·POS)",1),("CCP 점검표·온도 기록지 양식",1),("서식·단위 통일",0)],
    "5-1": [("매장 일정 협의·교육 시행",0),("표준 레시피대로 시연",0),("직원 실습·피드백",0),
            ("FAQ(질문·실수) 정리",0),("위생·알레르기·CCP 교육 포함",1),("매장 자체 재현 합격 확인",1),("교육 이수 명단·일자 기록",0)],
    "5-2": [("메뉴판·POS·키오스크 등록",0),("메뉴판·POS 알레르기 표시 반영",1),("매뉴얼·BOM 매장 배포",0),
            ("매장 공지(일자·가격·구성) 일원화",0),("발주·재고 연계 확인",0),("초기 판매 점검 계획 수립",0)],
    "6-1": [("실판매량·매출 비중 집계(목표 대비)",1),("품질 편차·클레임·반품 점검",1),("고객 피드백 회수·요약",0),
            ("원가율·로스 실측 vs 계획 비교",1),("위생·표시 운영실태 점검",1),("유지/개선/단종 판정·사유",1),("사이클 학습점 1건+ 정리",0)],
}

# 4-1/4-2 결론 없는 스테이지(게이트/문서)도 conclusion 포함, gate는 별도

def crit_box(stage):
    return f"""    <div class="criteria-grid">
      <div class="crit-box"><div class="crit-label">목적</div><div class="crit-val">{{{{{stage} 목적}}}}</div></div>
      <div class="crit-box"><div class="crit-label">트리거</div><div class="crit-val">{{{{{stage} 트리거}}}}</div></div>
      <div class="crit-box"><div class="crit-label">핵심액션</div><div class="crit-val">{{{{{stage} 핵심액션}}}}</div></div>
      <div class="crit-box"><div class="crit-label">완료기준</div><div class="crit-val">{{{{{stage} 완료기준}}}}</div></div>
    </div>"""

def checklist_box(stage):
    items = CHECKLISTS[stage]
    lis = []
    for label, crit in items:
        cls = " crit" if crit else ""
        lis.append(f"""        <li class="{('crit' if crit else '').strip()}"><span class="ck on">✓</span><span class="label">{label}</span></li>""")
    body = "\n".join(lis)
    return f"""    <div class="stage-check">
      <h5>✓ 완료 점검표 <span style="font-weight:400;color:var(--muted)">(★=필수/위생·핵심)</span></h5>
      <ul>
{body}
      </ul>
    </div>"""

def sensory_box():
    rows = ["맛(간·감칠맛·균형)","식감·텍스처","향","외관·플레이팅","가격 수용도","재구매 의향"]
    tr = "\n".join([f"""        <tr><td>{r}</td><td class="sc">{{{{점수}}}}/5</td><td>{{{{코멘트}}}}</td></tr>""" for r in rows])
    return f"""    <div class="sensory-box">
      <h5>🥄 관능 평가 정량 시트 (5점 척도 · 1 매우미흡 ~ 5 매우우수)</h5>
      <table class="sensory">
        <thead><tr><th>평가 항목</th><th>점수</th><th>코멘트</th></tr></thead>
        <tbody>
{tr}
        </tbody>
      </table>
      <div style="margin-top:8px;font-size:13px;font-weight:700;color:var(--info)">평균 점수: {{{{관능 평균}}}}/5</div>
    </div>"""

def personas_block(stage, personas):
    rid = f"r{stage}-1"
    cards = "\n".join([f"""          <div class="persona-card"><div class="persona-name">{p}</div><div class="persona-text">{{{{{p} 발언}}}}</div></div>""" for p in personas])
    rows = "\n".join([f"""              <tr><td>{p}</td><td class="score-num pass">{{{{점수}}}}</td><td>{{{{근거}}}}</td></tr>""" for p in personas])
    verdict = "전원 9.5점 이상 합격" + ("" if stage not in ("3-2","6-1") else " · 판정 확정")
    return f"""    <div class="disc-section">
      <h4>페르소나 토의 (참여 {len(personas)}인)</h4>
      <div class="round-tabs">
        <div class="round-tab active pass" onclick="switchRound(this,'{rid}')">Round 1</div>
        <!-- 라운드 추가 시: <div class="round-tab pass" onclick="switchRound(this,'r{stage}-2')">Round 2</div> -->
      </div>
      <div id="{rid}" class="round-content active">
        <div class="persona-comments">
{cards}
        </div>
        <div class="score-table-wrap">
          <table class="score-tbl"><thead><tr><th>페르소나</th><th>점수</th><th>주요 근거</th></tr></thead>
            <tbody>
{rows}
            </tbody>
          </table>
          <div class="round-verdict"><span class="verdict-icon">✅</span><span>{verdict}</span></div>
        </div>
      </div>
    </div>"""

def gate_box():
    return """    <!-- 판정: intro(도입/유지) · revise(보완/개선) · discard(폐기/단종) 중 택1 -->
    <div class="gate-box intro">
      <div class="gate-icon">✅</div>
      <div>
        <div class="gate-label">{{판정 결과}}</div>
        <div class="gate-reason">{{판정 사유}}</div>
      </div>
    </div>"""

def conclusion_box(stage):
    return f"""    <div class="conclusion-box">
      <div class="label">주요 결론</div>
      <ul><li>{{{{{stage} 결론 1}}}}</li><li>{{{{{stage} 결론 2}}}}</li><li>{{{{{stage} 결론 3}}}}</li></ul>
    </div>"""

def make_fragment(stage, name, personas, phase, is_gate, has_sensory):
    badge = '<span class="stage-score-badge score-pass">{{'+stage+' 최고점}}점 · 합격</span>' if not is_gate \
            else '<span class="stage-score-badge score-pass">🟢 {{판정 결과}}</span>'
    parts = []
    parts.append(f"""<!-- ====== STAGE {stage} {name} (fragment) ====== -->
<div class="stage-card" id="stage-{stage}">
  <div class="stage-card-header" onclick="toggleStage(this)">
    <div class="stage-info">
      <span class="stage-num">{stage}</span>
      <div>
        <div class="stage-name">{name}</div>
        <div class="stage-meta">{' · '.join(personas)}</div>
      </div>
    </div>
    <div class="stage-right">
      {badge}
      <span class="chevron">▾</span>
    </div>
  </div>
  <div class="stage-body">""")
    if is_gate:
        parts.append(gate_box())
    parts.append(crit_box(stage))
    parts.append(checklist_box(stage))
    if has_sensory:
        parts.append(sensory_box())
    parts.append(personas_block(stage, personas))
    parts.append(conclusion_box(stage))
    parts.append("""  </div><!-- /stage-body -->
</div><!-- /stage-card -->""")
    return "\n".join(parts) + "\n"

# 페이즈 헤더 조각도 별도 저장(병합 편의)
def phase_header(phase):
    title, sub, color, num = PHASES[phase]
    return f"""<!-- ====== PHASE {phase} HEADER ====== -->
<div class="phase-header">
  <div class="phase-dot" style="background:{color}">{num}</div>
  <div>
    <div class="phase-title">{title}</div>
    <div class="phase-subtitle">{sub}</div>
  </div>
</div>
"""

for phase in PHASES:
    with open(os.path.join(OUT, f"phase_{phase}.html"), "w", encoding="utf-8") as f:
        f.write(phase_header(phase))

for stage, name, personas, phase, is_gate, has_sensory in STAGES:
    with open(os.path.join(OUT, f"stage_{stage}.html"), "w", encoding="utf-8") as f:
        f.write(make_fragment(stage, name, personas, phase, is_gate, has_sensory))

print("fragments written:", sorted(os.listdir(OUT)))
