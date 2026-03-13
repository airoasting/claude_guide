// ─── 날씨 Mock ────────────────────────────────────────────
export const MOCK_WEATHER = {
  city: '서울',
  temp: 22,
  desc: '맑음',
  emoji: '☀️',
  humidity: 45,
  wind: 3.2,
};

// ─── 시장 지표 Mock ───────────────────────────────────────
const mkHistory = (base, range) =>
  Array.from({ length: 7 }, (_, i) => ({
    day: i,
    value: +(base + (Math.random() - 0.5) * range * 2).toFixed(2),
  }));

export const MOCK_MARKETS = [
  {
    id: 'usd',
    name: 'USD/KRW',
    value: 1378,
    change: 0.32,
    history: mkHistory(1378, 15),
    format: 'krw',
    region: 'kr',
  },
  {
    id: 'eur',
    name: 'EUR/KRW',
    value: 1487,
    change: -0.18,
    history: mkHistory(1487, 18),
    format: 'krw',
    region: 'kr',
  },
  {
    id: 'kospi',
    name: 'KOSPI',
    value: 2687.4,
    change: 0.54,
    history: mkHistory(2687, 30),
    format: 'index',
    region: 'kr',
  },
  {
    id: 'sp500',
    name: 'S&P 500',
    value: 5243.0,
    change: -0.21,
    history: mkHistory(5243, 50),
    format: 'index',
    region: 'us',
  },
  {
    id: 'btc',
    name: 'BTC/USD',
    value: 97250,
    change: 1.84,
    history: mkHistory(97250, 2000),
    format: 'usd',
    region: 'us',
  },
];

// ─── 뉴스 Mock (6 산업 × 10건) ────────────────────────────
const makeNews = (items) =>
  items.map((n, i) => ({ id: `n${i + 1}`, ...n, source_url: null }));

export const MOCK_NEWS = {
  'IT·테크': makeNews([
    { headline: '구글, AI 에이전트 플랫폼 전면 개편 발표', summary: '구글이 AI 에이전트 생태계를 통합한 새로운 플랫폼을 공개했습니다.', why_it_matters: '플랫폼 종속 리스크가 본격화될 수 있습니다.' },
    { headline: '애플, 온디바이스 AI 전용 칩 공개 예고', summary: '애플이 차세대 AI 추론 최적화 칩을 개발 중이라고 밝혔습니다.', why_it_matters: '클라우드 의존도를 낮춘 온디바이스 AI 경쟁이 가열됩니다.' },
    { headline: '미국 AI 규제법 상원 통과, 기업 대응 촉구', summary: '美 상원이 AI 투명성·안전 요구 법안을 통과시켰습니다.', why_it_matters: '글로벌 AI 규제 확산이 사업 계획에 영향을 줄 수 있습니다.' },
    { headline: 'MS Copilot, 기업용 워크플로우 전면 통합', summary: '마이크로소프트가 Copilot을 Teams·Office 전반에 확장했습니다.', why_it_matters: 'B2B SaaS 시장에서 AI 기반 생산성 도구 경쟁이 심화됩니다.' },
    { headline: 'OpenAI, 멀티에이전트 SDK 공개', summary: 'OpenAI가 멀티에이전트 시스템 구축 SDK를 오픈소스로 배포했습니다.', why_it_matters: '자체 AI 에이전트 개발 가속화의 기회입니다.' },
    { headline: 'NVIDIA, AI 추론 최적화 GPU 로드맵 공개', summary: '엔비디아가 2026년 추론 특화 GPU 라인업을 발표했습니다.', why_it_matters: '인프라 투자 계획 재검토가 필요할 수 있습니다.' },
    { headline: '메타, 오픈소스 LLM Llama 4 출시', summary: '메타가 성능을 대폭 향상한 Llama 4를 무료 공개했습니다.', why_it_matters: '자체 AI 모델 도입 비용 절감 기회가 생깁니다.' },
    { headline: 'AWS, 아시아-퍼시픽 데이터센터 확장 발표', summary: 'AWS가 한국을 포함한 APAC 리전에 대규모 투자를 발표했습니다.', why_it_matters: '클라우드 비용 및 레이턴시 개선 기회가 있습니다.' },
    { headline: '글로벌 사이버보안 침해 사고 급증, 기업 대응 시급', summary: '2026년 상반기 사이버 침해 사고가 전년 대비 38% 증가했습니다.', why_it_matters: '보안 투자와 사고 대응 체계 점검이 시급합니다.' },
    { headline: '엔터프라이즈 AI 도입률, 글로벌 평균 67% 돌파', summary: '글로벌 대기업의 AI 도입률이 처음으로 67%를 넘겼습니다.', why_it_matters: 'AI 미도입 기업의 경쟁력 격차가 빠르게 벌어지고 있습니다.' },
  ]),
  '제조·산업': makeNews([
    { headline: '현대차, AI 기반 품질검사 시스템 전 공장 확대', summary: '현대자동차가 AI 비전 검사 시스템을 전 생산 라인에 배포했습니다.', why_it_matters: '제조 품질 관리의 AI 전환이 업계 표준이 되고 있습니다.' },
    { headline: '독일 Industry 5.0, 인간-로봇 협업 표준 발표', summary: '독일이 인간 중심 Industry 5.0 프레임워크 표준을 공개했습니다.', why_it_matters: '글로벌 제조 혁신 방향에 맞춰 전략을 재검토할 필요가 있습니다.' },
    { headline: 'TSMC, 3나노 공정 생산 본격화', summary: 'TSMC가 3나노 공정 양산을 본격 시작해 반도체 공급이 확대됩니다.', why_it_matters: '첨단 부품 확보 전략에 영향을 미칠 수 있습니다.' },
    { headline: '두산, 디지털트윈으로 생산성 23% 향상 사례 공개', summary: '두산이 디지털트윈 도입으로 생산성을 23% 향상했다고 발표했습니다.', why_it_matters: '스마트팩토리 투자 ROI 검토의 좋은 벤치마크 사례입니다.' },
    { headline: '포스코, AI 예지보전 시스템 상용화 성공', summary: '포스코가 AI 기반 설비 고장 예측 시스템을 전면 도입했습니다.', why_it_matters: '유지보수 비용 절감과 가동률 향상에 직접적 시사점이 있습니다.' },
    { headline: '글로벌 공급망 재편, 니어쇼어링 가속화', summary: '미-중 무역 갈등으로 기업들의 생산 거점 재편이 빨라지고 있습니다.', why_it_matters: '공급망 리스크 분산 전략을 재점검할 시점입니다.' },
    { headline: '에너지 비용 급등, 제조업체 수익성 압박', summary: '전력·가스 가격 상승으로 제조업 원가 부담이 커지고 있습니다.', why_it_matters: '에너지 효율화 투자의 긴급성이 높아지고 있습니다.' },
    { headline: '로봇 자동화 도입 기업, 인력 재배치 성공률 61%', summary: '자동화 도입 기업의 절반 이상이 기존 인력을 고부가 업무로 전환했습니다.', why_it_matters: '자동화와 인력 전략을 함께 설계할 필요가 있습니다.' },
    { headline: '탄소중립 의무화, 제조사 공급망 ESG 요구 증가', summary: '글로벌 바이어가 공급업체에 탄소중립 인증을 요구하기 시작했습니다.', why_it_matters: 'ESG 대응 없이는 수출 경쟁력을 유지하기 어렵습니다.' },
    { headline: '산업용 IoT 디바이스, 2026년 240억 대 돌파 전망', summary: '산업용 IoT 연결 기기 수가 올해 240억 대를 넘길 것으로 예상됩니다.', why_it_matters: '데이터 수집 인프라 확충의 적기입니다.' },
  ]),
  '금융·투자': makeNews([
    { headline: 'Fed, 기준금리 동결…연내 인하 시사', summary: '미 연준이 기준금리를 동결하며 올해 1~2회 인하 가능성을 시사했습니다.', why_it_matters: '금리 환경 변화에 맞춰 자금 조달 전략을 재점검해야 합니다.' },
    { headline: 'AI ETF 시장 급성장, 국내 자금 유입 가속', summary: 'AI 관련 ETF에 국내 투자자 자금이 대거 유입되고 있습니다.', why_it_matters: '기술 투자 포트폴리오 재조정을 검토할 시점입니다.' },
    { headline: '디지털자산 제도화법, 국회 본회의 통과', summary: '가상자산 규제 체계를 명확히 하는 법안이 통과되었습니다.', why_it_matters: '블록체인 및 디지털자산 관련 사업 계획에 영향을 줄 수 있습니다.' },
    { headline: '토스뱅크, AI 신용평가 모델 전면 도입', summary: '토스뱅크가 AI 기반 대안 신용평가로 대출 심사를 전환했습니다.', why_it_matters: '핀테크 경쟁 심화에 따른 금융 서비스 혁신이 필요합니다.' },
    { headline: 'JP모건, AI 트레이딩 시스템으로 알파 창출', summary: 'JP모건이 AI 퀀트 트레이딩으로 시장 대비 초과 수익을 공개했습니다.', why_it_matters: '투자 의사결정에 AI 도입을 검토할 수 있습니다.' },
    { headline: '기업 CFO, AI 재무 분석 도구 도입 64% 급증', summary: '글로벌 CFO들의 AI 재무 분석 도구 도입률이 급증했습니다.', why_it_matters: 'CFO 조직의 AI 전환 속도를 점검해볼 필요가 있습니다.' },
    { headline: '환율 변동성 확대, 헤지 전략 중요성 부각', summary: '달러 강세 기조 지속으로 원화 환율 변동성이 커지고 있습니다.', why_it_matters: '환 헤지 비율 및 전략 재검토가 시급합니다.' },
    { headline: '벤처 투자 시장, AI·바이오 집중 현상 심화', summary: '국내 VC 투자의 70% 이상이 AI와 바이오에 집중되고 있습니다.', why_it_matters: '사업 영역이 AI·바이오와 연관되는지 전략적으로 검토할 수 있습니다.' },
    { headline: '글로벌 부채 수준 사상 최고, 리스크 주의보', summary: '국제 통화기금(IMF)이 글로벌 부채 수준에 대한 경고를 발표했습니다.', why_it_matters: '거시경제 리스크 모니터링 강화가 필요합니다.' },
    { headline: 'ESG 투자 기준 강화, 공시 의무화 확산', summary: '주요 거래소들이 ESG 공시를 의무화하고 있습니다.', why_it_matters: '지속가능경영 보고서 체계를 조기에 구축해야 합니다.' },
  ]),
  '유통·소비재': makeNews([
    { headline: '쿠팡, AI 개인화 추천 도입으로 구매 전환율 31% 향상', summary: '쿠팡이 AI 추천 엔진을 전면 개편해 뚜렷한 성과를 거뒀습니다.', why_it_matters: '커머스 채널의 AI 개인화 투자가 핵심 경쟁력이 됩니다.' },
    { headline: 'MZ세대 가치 소비 트렌드 심화, 브랜드 재정의 필요', summary: 'MZ세대가 가격보다 브랜드 가치·ESG를 우선시하는 경향이 강해졌습니다.', why_it_matters: '브랜드 포지셔닝과 마케팅 메시지를 재점검할 필요가 있습니다.' },
    { headline: '무인매장 시장 3조 원 돌파, 확산 가속', summary: '국내 무인 편의점·매장 시장이 3조 원을 넘어섰습니다.', why_it_matters: '오프라인 채널 운영 비용 절감 기회를 검토할 수 있습니다.' },
    { headline: '네이버, AI 커머스 어시스턴트 전면 출시', summary: '네이버가 쇼핑 특화 AI 어시스턴트를 전면 도입했습니다.', why_it_matters: '네이버 채널 의존도가 높은 경우 전략 수정이 필요합니다.' },
    { headline: '아마존, AI 물류 최적화로 배송 비용 19% 절감', summary: '아마존이 AI 기반 물류 라우팅으로 대규모 비용을 절감했습니다.', why_it_matters: '물류·배송 비용 절감에 AI 도입을 검토할 시점입니다.' },
    { headline: '온라인-오프라인 경계 소멸, 옴니채널 필수화', summary: '소비자 구매 여정이 온·오프라인을 자유롭게 넘나드는 시대가 됐습니다.', why_it_matters: '채널 통합 전략과 고객 데이터 연계가 시급합니다.' },
    { headline: '글로벌 명품 시장 성장 둔화, 프리미엄 전략 재고', summary: '명품 소비 성장세가 꺾이며 프리미엄 시장 전략 재편이 필요합니다.', why_it_matters: '고가 제품 포트폴리오의 가격·포지셔닝 전략을 재검토해야 합니다.' },
    { headline: '식품 물가 상승, 원가 부담 가중', summary: '원자재·식품 가격 상승이 유통·식품 기업 마진을 압박합니다.', why_it_matters: '가격 정책과 원가 절감 방안을 조기에 마련해야 합니다.' },
    { headline: '빠른 배송 경쟁, 새벽배송 넘어 당일 배송 표준화', summary: '이커머스 배송 속도 경쟁이 당일 배송을 기본으로 요구합니다.', why_it_matters: '물류 인프라 투자와 파트너십을 점검해야 합니다.' },
    { headline: '구독 경제 피로감 증가, 혜택 차별화 필수', summary: '소비자들의 구독 서비스 해지율이 높아지며 혜택 차별화가 필요합니다.', why_it_matters: '구독 모델 운영 중이라면 리텐션 전략을 강화해야 합니다.' },
  ]),
  '바이오·헬스케어': makeNews([
    { headline: '삼성바이오로직스, AI 신약 개발 플랫폼 가동', summary: '삼성바이오가 AI 신약 후보 물질 탐색 플랫폼을 본격 운영합니다.', why_it_matters: '바이오·헬스케어 분야 AI 경쟁이 본격화됩니다.' },
    { headline: '원격의료 전면 허용 법안 국회 통과', summary: '비대면 진료를 전면 허용하는 법안이 최종 통과됐습니다.', why_it_matters: '디지털 헬스케어 시장 진입 기회가 열렸습니다.' },
    { headline: 'GLP-1 비만 치료제 시장 100조 원 돌파 전망', summary: '글로벌 비만 치료제 시장이 올해 100조 원을 넘을 것으로 예상됩니다.', why_it_matters: '헬스케어 투자·파트너십 기회를 검토할 수 있습니다.' },
    { headline: '알파폴드3, 단백질-약물 상호작용 예측 획기적 개선', summary: '딥마인드가 알파폴드3의 약물 결합 예측 기능을 대폭 향상했습니다.', why_it_matters: '신약 개발 투자 대비 기간이 크게 단축될 전망입니다.' },
    { headline: 'AI 진단 보조 시스템, FDA 승인 연속 획득', summary: 'AI 기반 의료 진단 도구들이 잇따라 FDA 승인을 받고 있습니다.', why_it_matters: '의료 AI 상용화 속도가 빨라지고 있습니다.' },
    { headline: '유전체 분석 비용 100달러 이하로 하락', summary: '차세대 유전체 분석 비용이 100달러 미만으로 떨어졌습니다.', why_it_matters: '개인 맞춤 의료 서비스 확장 기회가 생깁니다.' },
    { headline: '디지털 치료제 보험 급여, 국내 첫 사례 등재', summary: '국내에서 처음으로 디지털 치료제가 건강보험에 등재됐습니다.', why_it_matters: '디지털 헬스케어 사업 진출 타이밍을 검토해야 합니다.' },
    { headline: '의료 AI 오진 리스크 부각, 책임 규정 논의 가열', summary: 'AI 진단 오류로 인한 법적 책임 규정 마련 논의가 활발합니다.', why_it_matters: '의료 AI 도입 시 리스크 관리 체계를 함께 설계해야 합니다.' },
    { headline: '바이오시밀러 시장 급성장, 제네릭 전략 필수', summary: '글로벌 바이오시밀러 시장이 빠르게 성장하고 있습니다.', why_it_matters: '헬스케어 사업 포트폴리오에 바이오시밀러 전략을 검토할 수 있습니다.' },
    { headline: '정밀의료 기반 암 치료, 생존율 40% 향상 사례 발표', summary: '유전체 기반 맞춤 항암 치료로 생존율이 크게 향상됐습니다.', why_it_matters: '정밀의료 관련 투자 및 파트너십 기회를 검토할 수 있습니다.' },
  ]),
  '전체': makeNews([
    { headline: 'AI 에이전트 업무 자동화율 50% 돌파', summary: '글로벌 기업에서 AI 에이전트가 업무의 절반을 자동화했다는 조사가 발표됐습니다.', why_it_matters: '조직 구조와 업무 프로세스 재설계가 시급한 시점입니다.' },
    { headline: '미-중 무역 갈등 재점화, 관세 인상 조치', summary: '미국이 중국산 첨단 기술 제품에 추가 관세를 부과했습니다.', why_it_matters: '글로벌 공급망과 수출입 전략에 즉각적인 영향이 예상됩니다.' },
    { headline: 'ESG 공시 의무화 첫 해, 기업 준비 격차 두드러져', summary: '올해부터 시행되는 ESG 공시에 기업 간 준비 수준 차이가 크게 나타납니다.', why_it_matters: 'ESG 보고 체계가 미비하면 투자자 신뢰 저하로 이어질 수 있습니다.' },
    { headline: 'AI 인재전쟁 최고조, 연봉 3억 이상 AI 엔지니어 속출', summary: 'AI 핵심 인재 확보 경쟁이 치열해지며 처우가 급등하고 있습니다.', why_it_matters: 'AI 인재 확보 및 유지 전략을 조기에 수립해야 합니다.' },
    { headline: '양자컴퓨팅 상용화 원년, 금융·보안 업계 긴장', summary: '주요 기업이 양자 우위를 달성하며 보안 체계 변화를 예고했습니다.', why_it_matters: '암호화 및 보안 인프라 업그레이드를 중장기 계획에 포함해야 합니다.' },
    { headline: '글로벌 경기 둔화 우려 속 한국 수출 선방', summary: '글로벌 경기 불확실성 속에서도 한국 수출이 견조한 흐름을 보입니다.', why_it_matters: '수출 의존 사업의 리스크와 기회를 함께 점검해야 합니다.' },
    { headline: '데이터 주권 강화, 국가별 로컬라이제이션 요구 증가', summary: '유럽·동남아를 중심으로 데이터 현지 저장 의무가 확산됩니다.', why_it_matters: '글로벌 서비스 운영 시 데이터 거버넌스를 재검토해야 합니다.' },
    { headline: '기업 보드, AI 거버넌스 위원회 설치 급증', summary: '이사회 수준의 AI 거버넌스 위원회 설치가 글로벌 추세가 됐습니다.', why_it_matters: 'AI 리스크 관리 체계를 경영 최고위 수준에서 논의해야 합니다.' },
    { headline: '친환경 사업 전환 속도전, 그린워싱 규제 강화', summary: '친환경 전환 압력과 함께 그린워싱에 대한 제재도 강화됩니다.', why_it_matters: '지속가능성 전략이 실질적 성과로 뒷받침되어야 합니다.' },
    { headline: '긱 이코노미 규제 강화, 플랫폼 노동 보호법 확산', summary: '세계적으로 플랫폼 노동자 보호를 위한 규제가 강화됩니다.', why_it_matters: '플랫폼·외주 인력 활용 모델을 재검토해야 할 수 있습니다.' },
  ]),
};

// ─── 명언 Mock ────────────────────────────────────────────
export const MOCK_QUOTES = [
  { quote: '측정할 수 없는 것은 관리할 수 없다.', author: '피터 드러커', insight: '오늘 가장 중요한 지표가 제대로 측정되고 있는지 확인하세요.' },
  { quote: '나쁜 소식은 빨리 전달되어야 한다.', author: '앤디 그로브', insight: '문제가 있다면 오늘 바로 보고 체계를 점검하세요.' },
  { quote: '위대한 일을 하는 유일한 방법은 자신이 하는 일을 사랑하는 것이다.', author: '스티브 잡스', insight: '팀이 일에서 의미를 찾고 있는지 오늘 한 번 확인해보세요.' },
  { quote: '규칙 1: 절대 돈을 잃지 마라. 규칙 2: 규칙 1을 잊지 마라.', author: '워렌 버핏', insight: '오늘 가장 큰 리스크 요인을 하나 골라 대응책을 마련하세요.' },
  { quote: '빠르게 움직이고 기존의 것을 파괴하라.', author: '마크 저커버그', insight: '조직 내 가장 느린 의사결정 프로세스를 오늘 개선해보세요.' },
  { quote: '문화는 전략을 아침으로 먹는다.', author: '사티아 나델라', insight: '오늘 팀의 문화를 강화하는 한 가지 행동을 실천하세요.' },
  { quote: '고객 집착은 경쟁자 집착보다 항상 더 중요하다.', author: '제프 베이조스', insight: '오늘 고객 목소리를 직접 들을 기회를 만들어보세요.' },
  { quote: '완벽한 규칙보다 좋은 판단력이 중요하다.', author: '리드 헤이스팅스', insight: '팀에게 자율과 책임을 함께 부여하는 환경을 만들고 있는지 점검하세요.' },
  { quote: '단순함이 궁극의 정교함이다.', author: '레오나르도 다 빈치', insight: '오늘 회의나 보고서에서 불필요한 복잡성을 제거해보세요.' },
  { quote: '오늘의 결정이 내일의 회사를 만든다.', author: '익명', insight: '오늘 가장 중요한 결정 하나에 충분한 시간을 투자하세요.' },
];

// ─── 일정 Mock ────────────────────────────────────────────
export const MOCK_EVENTS = [
  { id: 'm1', title: 'Q1 실적 리뷰 미팅', time: '09:00', endTime: '10:00', location: '회의실 A', isMeeting: true, attendeeCount: 5, meetLink: null, status: 'confirmed', isAllDay: false },
  { id: 'm2', title: '신규 파트너십 미팅', time: '10:30', endTime: '11:30', location: '강남 외부', isMeeting: true, attendeeCount: 3, meetLink: null, status: 'confirmed', isAllDay: false },
  { id: 'm3', title: 'AI 도입 TF 킥오프', time: '14:00', endTime: '15:00', location: '회의실 B', isMeeting: true, attendeeCount: 8, meetLink: null, status: 'confirmed', isAllDay: false },
  { id: 'm4', title: '주간 경영회의', time: '16:00', endTime: '17:00', location: '대회의실', isMeeting: true, attendeeCount: 12, meetLink: null, status: 'confirmed', isAllDay: false },
  { id: 'm5', title: '개인 리뷰 시간', time: '17:30', endTime: '18:00', location: null, isMeeting: false, attendeeCount: 0, meetLink: null, status: 'confirmed', isAllDay: false },
];

// ─── 산업 목록 ────────────────────────────────────────────
export const INDUSTRIES = ['IT·테크', '제조·산업', '금융·투자', '유통·소비재', '바이오·헬스케어', '전체'];
