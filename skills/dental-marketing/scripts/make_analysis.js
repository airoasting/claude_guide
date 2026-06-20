const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ExternalHyperlink, Header, Footer, AlignmentType, PageOrientation,
  BorderStyle, WidthType, ShadingType, HeadingLevel, PageNumber,
  VerticalAlign, LevelFormat, PageBreak
} = require('docx');
const fs = require('fs');
const path = require('path');

// 출력 폴더: 1순위 CLI 인자(node make_analysis.js <폴더>), 2순위 OUT_DIR 환경변수,
// 기본값은 현재 작업 디렉터리(process.cwd()). 폴더가 없으면 생성한다.
const OUT_DIR = process.argv[2] || process.env.OUT_DIR || process.cwd();
fs.mkdirSync(OUT_DIR, { recursive: true });
const OUT_FILE = path.join(OUT_DIR, '치과_홍보대행_벤치마킹_분석보고서.docx');

// BrandLab 연락처: 한 곳에서만 정의하고 아래에서 참조한다(커스터마이징은 이 줄만 수정).
const BRANDLAB_EMAIL = 'paulyoo95@gmail.com';

const C = {
  navy:    "1F4E79", blue:    "2E75B6", green:   "1E7145", orange:  "C55A11",
  purple:  "7030A0", gray:    "666666", lightGray: "F2F2F2", hdrBg: "1F4E79",
  row1:    "DDEEFF", row2:    "E8F5E9", accent:  "FFF2CC", white:   "FFFFFF",
};

const bdr = (color="CCCCCC") => ({ style: BorderStyle.SINGLE, size: 1, color });
const borders = { top: bdr(), bottom: bdr(), left: bdr(), right: bdr() };

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.navy, space: 4 } }, children: [new TextRun({ text, font: "Arial", size: 36, bold: true, color: C.navy })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 }, children: [new TextRun({ text: "■ " + text, font: "Arial", size: 26, bold: true, color: C.blue })] });
}
function h3(text) {
  return new Paragraph({ spacing: { before: 200, after: 80 }, children: [new TextRun({ text: "▶ " + text, font: "Arial", size: 22, bold: true, color: C.green })] });
}
function para(text, opts = {}) {
  return new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text, font: "Arial", size: 20, color: "#1A1A1A", ...opts })] });
}
function bullet(text, bold = false) {
  return new Paragraph({ spacing: { before: 40, after: 40 }, indent: { left: 360, hanging: 200 }, children: [new TextRun({ text: "• ", font: "Arial", size: 20, color: C.blue, bold: true }), new TextRun({ text, font: "Arial", size: 20, bold, color: bold ? C.navy : "#1A1A1A" })] });
}
function subbullet(text) {
  return new Paragraph({ spacing: { before: 20, after: 20 }, indent: { left: 640, hanging: 200 }, children: [new TextRun({ text: "- ", font: "Arial", size: 18, color: C.gray }), new TextRun({ text, font: "Arial", size: 18, color: "#333333" })] });
}
function space(n = 1) {
  return new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: " ".repeat(n), size: 16 })] });
}
function pageBreak() { return new Paragraph({ children: [new PageBreak()] }); }
function hdrCell(text, w) {
  return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: C.hdrBg, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, font: "Arial", size: 18, bold: true, color: C.white })] })] });
}
const hex = (c) => (typeof c === 'string' ? c.replace(/^#/, '') : c); // docx fill/color는 '#' 없는 6자리 hex만 허용
function dataCell(text, w, bg = C.white, bold = false, color = "#1A1A1A") {
  return new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: { fill: hex(bg), type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: text || '-', font: "Arial", size: 18, bold, color: hex(color) })] })] });
}
function highlight(text, color = C.accent) {
  return new Paragraph({ spacing: { before: 80, after: 80 }, shading: { fill: color, type: ShadingType.CLEAR }, border: { left: { style: BorderStyle.SINGLE, size: 12, color: C.blue, space: 8 } }, indent: { left: 200 }, children: [new TextRun({ text, font: "Arial", size: 20, bold: true, color: C.navy })] });
}

const W1 = [2800, 1200, 1200, 1200, 1200, 1200, 1360];
const channelSummaryTable = new Table({
  width: { size: 10160, type: WidthType.DXA }, columnWidths: W1,
  rows: [
    new TableRow({ tableHeader: true, children: [hdrCell("병원명", W1[0]), hdrCell("홈페이지", W1[1]), hdrCell("네이버 블로그", W1[2]), hdrCell("네이버 플레이스", W1[3]), hdrCell("인스타그램", W1[4]), hdrCell("Facebook", W1[5]), hdrCell("YouTube/기타", W1[6])] }),
    ...[
      ["에스플란트치과병원", "✅", "❌", "❌", "✅ (586)", "❌", "✅ YouTube"],
      ["하루플란트치과", "✅", "❌", "❌", "✅ (902)", "❌", "❌"],
      ["플란치과의원 강남점", "✅", "❌", "❌", "❌", "❌", "카카오채널"],
      ["스마일디치과", "✅", "✅", "✅", "✅", "❌", "YouTube/카카오"],
      ["강남레옹치과", "✅", "❌", "네이버예약", "❌", "❌", "카카오채널"],
      ["강남세브란스치과병원", "✅", "❌", "❌", "❌", "❌", "❌"],
      ["강남역똑똑플란트치과", "✅", "❌", "❌", "❌", "❌", "❌"],
      ["뉴엔치과 강남점", "✅", "✅", "❌", "✅", "✅", "YouTube/카카오"],
      ["강남치유치과의원", "✅", "❌", "✅", "✅", "❌", "카카오채널"],
      ["강남젠틀치과", "✅", "❌", "❌", "❌", "❌", "❌"],
      ["루시드치과의원", "✅", "✅", "네이버예약", "✅ (12,000)", "❌", "카카오채널"],
      ["블랑쉬치과의원", "✅", "자체블로그", "❌", "✅ (2,596)", "❌", "❌"],
      ["아이디치과", "✅", "❌", "❌", "❌", "❌", "❌"],
      ["365베스트치과", "✅", "❌", "❌", "❌", "❌", "❌"],
      ["강남숙면치과", "✅", "❌", "❌", "❌", "❌", "❌"],
    ].map((row, i) => new TableRow({ children: [dataCell(row[0], W1[0], i%2===0?C.row1:"#EBF5FF",true), dataCell(row[1],W1[1],i%2===0?C.row1:"#EBF5FF"), dataCell(row[2],W1[2],i%2===0?C.row1:"#EBF5FF"), dataCell(row[3],W1[3],i%2===0?C.row1:"#EBF5FF"), dataCell(row[4],W1[4],i%2===0?C.row1:"#EBF5FF"), dataCell(row[5],W1[5],i%2===0?C.row1:"#EBF5FF"), dataCell(row[6],W1[6],i%2===0?C.row1:"#EBF5FF")] })),
    ...[
      ["수지예인치과의원","✅","❌","❌","❌","✅","❌"],
      ["보스톤서울치과","✅","❌","네이버예약","❌","❌","❌"],
      ["수지좋은치과의원","✅","❌","❌","❌","❌","❌"],
      ["단국대학교 죽전치과병원","✅","❌","❌","❌","❌","❌"],
      ["임플라인치과 용인점","✅","❌","❌","❌","✅","❌"],
      ["광교치과의원","✅ (모두)","❌","❌","❌","❌","❌"],
      ["선데이치과","✅","❌","❌","✅","✅","❌"],
      ["서울성복치과의원","✅","❌","❌","❌","❌","❌"],
    ].map((row, i) => new TableRow({ children: [dataCell(row[0],W1[0],i%2===0?C.row2:"#DCF0E3",true), dataCell(row[1],W1[1],i%2===0?C.row2:"#DCF0E3"), dataCell(row[2],W1[2],i%2===0?C.row2:"#DCF0E3"), dataCell(row[3],W1[3],i%2===0?C.row2:"#DCF0E3"), dataCell(row[4],W1[4],i%2===0?C.row2:"#DCF0E3"), dataCell(row[5],W1[5],i%2===0?C.row2:"#DCF0E3"), dataCell(row[6],W1[6],i%2===0?C.row2:"#DCF0E3")] })),
  ]
});

const W2 = [2200, 2700, 4860];
const strategyTable = new Table({
  width: { size: 9760, type: WidthType.DXA }, columnWidths: W2,
  rows: [
    new TableRow({ tableHeader: true, children: [hdrCell("홍보 유형", W2[0]), hdrCell("대표 병원 (강남)", W2[1]), hdrCell("핵심 특징 및 전략", W2[2])] }),
    ...[
      ["독자 브랜드 시술명","루시드(루시네이트), 스마일디(스마일랩핑), 레옹(뉴티스), 블랑쉬(무삭제 라미네이트)","고유 시술명 개발로 검색 키워드 독점. 환자가 기억하기 쉬운 브랜딩."],
      ["의료진 전문성 강조","에스플란트(서울대 박사 4인), 블랑쉬(서울대 동문 전문의)","학력·연구논문·수상경력 명시. '박사', '전문의' 키워드로 신뢰도 구축."],
      ["네이버 생태계 통합","스마일디, 루시드, 강남치유","네이버플레이스+블로그+예약을 연계. 검색→정보→예약까지 이탈 없이 전환."],
      ["체험단/리얼모델 마케팅","스마일디(리얼모델지원), 루시드(이벤트)","실제 환자를 모델로 선발. 진정성 있는 후기 콘텐츠 생산."],
      ["특화 진료 타겟팅","강남치유(일요일 진료), 선데이치과(주말진료)","직장인 타겟 '주말·야간 진료' 강조. 특정 수요층 집중 공략."],
      ["공포·불안 해소 포지셔닝","에스플란트, 강남숙면치과","'수면마취', '통증 없는 치료'로 치과 기피 환자 유인."],
      ["외국인 환자 특화","에스플란트(46개국, 영·러·중 통역)","외국어 홈페이지, 해외 리뷰, 외국인 유치 등록증 강조."],
      ["전문의 칼럼 콘텐츠","블랑쉬(자체 블로그 칼럼)","원장이 직접 쓴 교육성 콘텐츠로 검색 트래픽 유입 + 신뢰도 향상."],
      ["멀티채널 동시 운영","뉴엔치과(블로그+IG+FB+YouTube)","4개 채널 일관된 브랜드 메시지. 노출 극대화."],
    ].map((row, i) => new TableRow({ children: [dataCell(row[0],W2[0],i%2===0?C.accent:"FFFDE7",true,C.navy), dataCell(row[1],W2[1],i%2===0?C.lightGray:C.white), dataCell(row[2],W2[2],i%2===0?C.lightGray:C.white)] })),
  ]
});

const W3 = [2400, 2200, 2800, 2360];
const serviceTable = new Table({
  width: { size: 9760, type: WidthType.DXA }, columnWidths: W3,
  rows: [
    new TableRow({ tableHeader: true, children: [hdrCell("부가서비스", W3[0]), hdrCell("타겟 고객", W3[1]), hdrCell("서비스 내용", W3[2]), hdrCell("예상 수익 모델", W3[3])] }),
    ...[
      ["① AI 리뷰 관리 시스템","모든 치과","네이버·구글 리뷰를 AI가 모니터링, 부정적 리뷰 자동 감지 및 대응 초안 생성","월 구독료 (30~80만원/월)"],
      ["② 독자 시술명 브랜딩","차별화 원하는 원장","병원 강점 분석 → 고유 시술명·로고·스토리 개발. 상표 출원 대행","프로젝트 피 (200~500만원)"],
      ["③ 네이버 플레이스 최적화","신규 개원 치과","플레이스 등록·키워드 세팅·사진 촬영·블로그 연계. 상위 노출 유지 관리","초기 세팅 + 월 관리비"],
      ["④ 환자 체험단 운영 대행","심미 전문 치과","리얼 모델 모집·선발·콘텐츠 촬영·SNS 배포까지 일괄 운영","프로젝트 피 + 성과 수수료"],
      ["⑤ 외국인 환자 유치 패키지","강남·고급 치과","영문 홈페이지·구글 광고·외국인 리뷰 관리·의료 관광 플랫폼 등록","패키지 피 + 유치 수수료"],
      ["⑥ 월별 콘텐츠 구독 패키지","SNS 부재 치과","인스타·블로그 월 4~8건 콘텐츠 제작(전후사진, 칼럼, 이벤트). 의료법 검수 포함","월 구독료 (80~200만원/월)"],
      ["⑦ 지역 맞춤형 SEO 블로그","수지구 치과","'수지 임플란트', '동천동 치과교정' 등 지역 키워드 블로그 상위 노출 전략","월 관리비 (50~100만원/월)"],
      ["⑧ 카카오/네이버 상담 자동화","상담 전환율 개선 목표","AI 챗봇으로 초기 상담·예약·FAQ 자동 처리. 야간 문의 이탈 방지","초기 구축비 + 월 유지비"],
      ["⑨ 정기 성과 리포팅","데이터 중심 원장","채널별 노출·클릭·예약 전환 데이터를 월간 보고서로 제공. ROI 측정","패키지 포함 or 별도 구독"],
      ["⑩ 개원·리뉴얼 런칭 패키지","신규·리뉴얼 치과","홈페이지·플레이스·SNS 동시 세팅. 개원 이벤트 기획·광고 집행 일괄 대행","패키지 피 (500만~1,500만원)"],
    ].map((row, i) => new TableRow({ children: [dataCell(row[0],W3[0],i%2===0?"EEF4FF":C.white,true,C.navy), dataCell(row[1],W3[1],i%2===0?"EEF4FF":C.white), dataCell(row[2],W3[2],i%2===0?"EEF4FF":C.white), dataCell(row[3],W3[3],i%2===0?"EEF4FF":C.white,false,C.green)] })),
  ]
});

const doc = new Document({
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
    headers: { default: new Header({ children: [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.navy, space: 2 } }, children: [new TextRun({ text: "BrandLab 치과 홍보 벤치마킹 분석 보고서", font: "Arial", size: 18, bold: true, color: C.navy }), new TextRun({ text: "\t강남구·수지구 30개 병원 조사 | 2026년 5월", font: "Arial", size: 16, color: C.gray })], tabStops: [{ type: "right", position: 9360 }] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.navy, space: 2 } }, children: [new TextRun({ text: "BrandLab — 환자가 선택하는 병원을 만듭니다", font: "Arial", size: 16, color: C.gray }), new TextRun({ text: "\t", font: "Arial", size: 16 }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: C.gray })], tabStops: [{ type: "right", position: 9360 }] })] }) },
    children: [
      space(4),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: "BrandLab 치과 홍보", font: "Arial", size: 64, bold: true, color: C.navy })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "벤치마킹 분석 보고서", font: "Arial", size: 52, bold: true, color: C.blue })] }),
      space(2),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, border: { top: { style: BorderStyle.SINGLE, size: 6, color: C.blue, space: 4 }, bottom: { style: BorderStyle.SINGLE, size: 6, color: C.blue, space: 4 } }, children: [new TextRun({ text: "서울 강남구 · 경기도 용인시 수지구 치과 30개소 홍보 채널 조사", font: "Arial", size: 24, color: C.blue })] }),
      space(3),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "조사일: 2026년 5월  |  조사 병원: 강남구 15개 + 수지구 15개", font: "Arial", size: 20, color: C.gray, italics: true })] }),
      pageBreak(),
      h1("1. 조사 개요"),
      para("본 보고서는 BrandLab의 신규 클라이언트 발굴 및 영업 전략 수립을 위한 벤치마킹 목적으로 작성되었습니다. 서울 강남구와 경기도 용인시 수지구에서 온라인 홍보를 활발히 전개하는 치과 30개소를 선정하여 홍보 채널 현황, 콘텐츠 전략, 키워드 포지셔닝 등을 분석하였습니다."),
      space(),
      h2("조사 대상 및 범위"),
      bullet("조사 지역: 서울 강남구(강남·서초 인접 포함) 15곳 / 경기도 용인시 수지구 15곳"),
      bullet("조사 채널: 홈페이지, 네이버 블로그, 네이버 플레이스, 인스타그램, 페이스북, 유튜브, 카카오채널"),
      bullet("조사 방법: 각 병원 공식 홈페이지 직접 방문, 검색 엔진 조사, SNS 프로필 분석"),
      bullet("조사 기간: 2026년 5월"),
      space(),
      h1("2. 홍보 채널 운영 현황"),
      h2("채널별 운영 현황 요약"),
      para("아래 표는 조사한 주요 병원의 홍보 채널 운영 여부를 정리한 것입니다. (✅ 운영 중 / ❌ 미운영)"),
      space(),
      channelSummaryTable,
      space(),
      h2("주요 발견사항"),
      highlight("강남구 치과: 홈페이지 100%, 인스타그램 약 40%, 네이버 블로그 약 27%"),
      highlight("수지구 치과: 홈페이지 약 60%, SNS 활동 전반적으로 미흡 — BrandLab 진입 기회"),
      space(),
      bullet("인스타그램을 운영하는 강남 치과 중 루시드(12,000명), 블랑쉬(2,596명), 하루플란트(902명) 순으로 팔로워 보유"),
      bullet("수지구 치과는 전반적으로 디지털 마케팅 투자가 부족하여 BrandLab 진입 기회가 높음"),
      bullet("네이버 생태계(플레이스+블로그+예약) 통합 운영 치과가 예약 전환율이 높은 것으로 파악됨"),
      pageBreak(),
      h1("3. 벤치마킹 전략 분석"),
      para("조사한 30개 치과의 홍보 패턴을 분석한 결과, 다음 9가지 핵심 전략 유형이 도출되었습니다."),
      space(),
      strategyTable,
      space(),
      h2("강남구 TOP 사례 심층 분석"),
      h3("스마일디치과 — 멀티채널 + 체험단 마케팅의 교과서"),
      bullet("리얼모델지원 프로그램: 일반인을 치료 모델로 선발하여 시술비 지원 → 진정성 있는 후기 콘텐츠 자동 생산"),
      bullet("'스마일랩핑' 독자 시술명 개발로 검색 시 경쟁 없는 키워드 독점"),
      subbullet("BrandLab 적용: 체험단 프로그램 + 독자 시술명은 중소 치과에도 즉시 적용 가능한 고효율 전략"),
      space(),
      h3("루시드치과 — 시술명 브랜딩 + SNS 집중 투자"),
      bullet("'루시네이트'라는 고유 시술명으로 라미네이트 시장 내 독자 포지션 구축"),
      bullet("인스타그램 팔로워 12,000명 — 강남 치과 중 최상위권"),
      subbullet("BrandLab 적용: 고유 시술명 + 정기 이벤트 + 의료 플랫폼 연계는 신환 유치의 핵심 조합"),
      space(),
      h3("블랑쉬치과 — 전문성 기반 콘텐츠 마케팅"),
      bullet("원장이 직접 작성한 전문의 칼럼 운영 — 실수요 키워드 공략"),
      bullet("'7년 연속 만족도 100%', '서울대 동문 전문의' 등 객관적 수치로 신뢰도 구축"),
      subbullet("BrandLab 적용: 원장의 전문성을 콘텐츠화하는 것이 장기적 SEO와 신뢰도 형성에 가장 효과적"),
      pageBreak(),
      h1("4. 수지구 치과 현황 및 기회 분석"),
      highlight("수지구는 강남구 대비 디지털 홍보 투자가 현저히 낮아 → BrandLab의 1차 공략 시장으로 적합"),
      space(),
      h2("수지구 현황"),
      bullet("홈페이지 보유율: 약 60% (강남구 100% 대비 낮음)"),
      bullet("SNS 운영 치과: 선데이치과(IG+FB), 수지예인치과(FB), 임플라인치과(FB) 정도"),
      bullet("경쟁 강도: 낮음 — 상위 노출이 강남구보다 용이"),
      space(),
      h2("수지구 특화 기회"),
      bullet("신분당선 역세권 지역 키워드 SEO: 경쟁이 낮아 빠른 상위 노출 가능"),
      bullet("'수지 임플란트', '동천역 치과교정', '죽전 치아미백' 등 구체적 지역+시술 키워드 선점 기회"),
      bullet("개원 연도가 오래된 치과를 대상으로 BrandLab 디지털 전환 컨설팅 패키지 제안 가능"),
      pageBreak(),
      h1("5. BrandLab 서비스 제안"),
      para("조사 결과를 바탕으로, 기존 대행사와 차별화할 수 있는 BrandLab의 핵심 서비스를 제안합니다."),
      space(),
      serviceTable,
      space(),
      h2("BrandLab 패키지 구성"),
      highlight("(A) 채널 스타터 (월 80만원): 네이버 플레이스 최적화 + 블로그 4건 + 인스타그램 4건 + 월간 성과 보고"),
      highlight("(B) 채널 그로스 (월 200만원): 스타터 + YouTube 쇼츠 2건 + AI 리뷰 관리 + 키워드 SEO 전략"),
      highlight("(C) 브랜드 그로스 (월 400만원): 그로스 + 원장 브랜딩 콘텐츠 + 체험단 운영 + 카카오 자동화"),
      highlight("(D) 개원 런칭 (700만~1,200만원): 홈페이지 + 병원 BI 설계 + 전 채널 세팅 + 3개월 집중 런칭"),
      highlight("(E) 브랜드 전략 (500만~1,000만원): 원장 퍼스널 브랜딩 + 병원 BI + AEO + 수익 구조 진단"),
      pageBreak(),
      h1("6. 결론 및 실행 방안"),
      h2("핵심 시사점 요약"),
      bullet("네이버 생태계(플레이스·블로그·예약) 통합 관리가 예약 전환에 가장 직결됨 — BrandLab 필수 제공 서비스"),
      bullet("독자 시술명·브랜딩 개발은 높은 부가가치를 창출하며 병원 충성도를 높이는 핵심 서비스"),
      bullet("수지구는 디지털 홍보 공백 지역 — 단기간 내 레퍼런스 확보와 시장 선점 가능"),
      bullet("P&L 관점의 수익 구조 진단이 BrandLab만의 차별화 포인트 — 단순 대행사와 구분되는 전략 파트너"),
      space(),
      h2("BrandLab 실행 로드맵"),
      bullet("1단계 (1~2개월): 파일럿 클라이언트(사촌동생 치과) 무료 진단 → 레퍼런스 구축"),
      bullet("2단계 (3~6개월): 수지구 치과 5~10곳 채널 스타터 패키지 판매 → 성공 사례 축적"),
      bullet("3단계 (6~12개월): 원장 브랜딩·수익 구조 진단 서비스 론칭 → 고객 단가 상향"),
      bullet("4단계 (12개월+): 글로벌 브랜딩 서비스 확장 → 외국인 환자 유치 기반 구축"),
      space(),
      para(`본 보고서는 BrandLab의 신규 클라이언트 발굴 전략 수립을 위한 기초 자료입니다. 문의: ${BRANDLAB_EMAIL}`, { color: C.gray, italics: true }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(OUT_FILE, buffer);
  console.log('✅ 분석 보고서 저장 완료:', OUT_FILE);
}).catch(err => { console.error('❌ 오류:', err.message); });
