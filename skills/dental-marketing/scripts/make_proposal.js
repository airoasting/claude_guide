const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
  HeadingLevel, PageNumber, PageBreak
} = require('docx');
const fs = require('fs');
const path = require('path');

// 출력 폴더: 1순위 CLI 인자(node make_proposal.js <폴더>), 2순위 OUT_DIR 환경변수,
// 기본값은 현재 작업 디렉터리(process.cwd()). 폴더가 없으면 생성한다.
const OUT_DIR = process.argv[2] || process.env.OUT_DIR || process.cwd();
fs.mkdirSync(OUT_DIR, { recursive: true });
const OUT_FILE = path.join(OUT_DIR, 'BrandLab_브랜드전략_제안서.docx');

// BrandLab 연락처: 한 곳에서만 정의하고 아래에서 참조한다(커스터마이징은 이 줄만 수정).
const BRANDLAB_EMAIL = 'paulyoo95@gmail.com';

const C = {
  navy: "1F4E79", blue: "2E75B6", green: "1E7145", gray: "666666",
  orange: "C55A11", purple: "7030A0",
  lightGray: "F2F2F2", hdrBg: "1F4E79",
  accent: "FFF2CC", accentBlue: "EEF4FF", accentGreen: "E8F5E9",
  white: "FFFFFF", divider: "DDEEFF",
};

const bdr = (color="CCCCCC") => ({ style: BorderStyle.SINGLE, size: 1, color });
const borders = { top: bdr(), bottom: bdr(), left: bdr(), right: bdr() };
const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

function h1(text) {
  return new Paragraph({
    spacing: { before: 360, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.navy, space: 4 } },
    children: [new TextRun({ text, font: "Arial", size: 36, bold: true, color: C.navy })]
  });
}
function h2(text) {
  return new Paragraph({
    spacing: { before: 240, after: 100 },
    children: [new TextRun({ text: "■ " + text, font: "Arial", size: 26, bold: true, color: C.blue })]
  });
}
function h3(text, color = C.green) {
  return new Paragraph({
    spacing: { before: 180, after: 80 },
    children: [new TextRun({ text: "▶ " + text, font: "Arial", size: 22, bold: true, color })]
  });
}
function para(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, font: "Arial", size: 20, color: "#1A1A1A", ...opts })]
  });
}
function bullet(text, bold = false) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    indent: { left: 360, hanging: 200 },
    children: [
      new TextRun({ text: "• ", font: "Arial", size: 20, color: C.blue, bold: true }),
      new TextRun({ text, font: "Arial", size: 20, bold, color: bold ? C.navy : "#1A1A1A" })
    ]
  });
}
function space() {
  return new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: " ", size: 16 })] });
}
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}
function highlight(text, fill = C.accent, textColor = C.navy) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    shading: { fill, type: ShadingType.CLEAR },
    border: { left: { style: BorderStyle.SINGLE, size: 14, color: C.blue, space: 8 } },
    indent: { left: 200 },
    children: [new TextRun({ text, font: "Arial", size: 20, bold: true, color: textColor })]
  });
}
function hdrCell(text, w, bg = C.hdrBg) {
  return new TableCell({
    borders, width: { size: w, type: WidthType.DXA },
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, font: "Arial", size: 18, bold: true, color: C.white })] })]
  });
}
function dataCell(text, w, bg = C.white, bold = false, color = "#1A1A1A", align = AlignmentType.LEFT) {
  return new TableCell({
    borders, width: { size: w, type: WidthType.DXA },
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [new Paragraph({ alignment: align, children: [new TextRun({ text: text || "-", font: "Arial", size: 18, bold, color })] })]
  });
}

// ── 패키지 가격표 ──
const W_pkg = [2400, 2600, 2200, 2000];
const priceTable = new Table({
  width: { size: 9200, type: WidthType.DXA }, columnWidths: W_pkg,
  rows: [
    new TableRow({ tableHeader: true, children: [
      hdrCell("패키지", W_pkg[0]), hdrCell("포함 서비스", W_pkg[1]),
      hdrCell("월 비용", W_pkg[2]), hdrCell("추천 대상", W_pkg[3])
    ]}),
    ...([
      ["(A) 채널 스타터", "네이버 플레이스 최적화 + 블로그 4건 + 인스타그램 4건 + 월간 성과 보고", "월 80만원", "디지털 채널 기반 구축 단계"],
      ["(B) 채널 그로스", "스타터 + YouTube 쇼츠 2건 + AI 리뷰 관리 + 키워드 SEO 전략", "월 200만원", "멀티채널 확장 단계"],
      ["(C) 브랜드 그로스", "그로스 + 원장 브랜딩 콘텐츠 + 체험단 운영 + 카카오 상담 자동화 + 광고 집행", "월 400만원", "브랜드+채널 통합 성장"],
      ["(D) 개원 런칭", "홈페이지 + 병원 BI 설계 + 전 채널 세팅 + 3개월 집중 런칭", "700~1,200만원", "신규 개원 치과"],
      ["(E) 브랜드 전략", "원장 퍼스널 브랜딩 + 병원 BI + AEO 최적화 + 수익 구조 진단", "500~1,000만원", "프리미엄 포지셔닝 목표"],
    ].map((row, i) => new TableRow({ children: [
      dataCell(row[0], W_pkg[0], i%2===0 ? C.accentBlue : C.white, true, C.navy),
      dataCell(row[1], W_pkg[1], i%2===0 ? C.accentBlue : C.white),
      dataCell(row[2], W_pkg[2], i%2===0 ? C.accentBlue : C.white, true, C.green, AlignmentType.CENTER),
      dataCell(row[3], W_pkg[3], i%2===0 ? C.accentBlue : C.white, false, C.gray),
    ]}))),
  ]
});

// ── 차별화 서비스 표 ──
const W_diff = [2800, 3600, 2800];
const diffTable = new Table({
  width: { size: 9200, type: WidthType.DXA }, columnWidths: W_diff,
  rows: [
    new TableRow({ tableHeader: true, children: [
      hdrCell("차별화 서비스", W_diff[0]), hdrCell("내용", W_diff[1]), hdrCell("효과 발현", W_diff[2])
    ]}),
    ...([
      ["원장·병원 브랜딩", "원장 인터뷰·칼럼·스토리 제작 + 병원 슬로건·BI 개발. 원장을 전문가 브랜드로 포지셔닝하여 가격 경쟁 없는 충성 환자 기반을 구축한다.", "3~6개월 내 SNS 팔로워 및 재내원율 상승"],
      ["AEO (AI 검색 최적화)", "ChatGPT·Perplexity·Google AI·네이버 Clova X에서 '강남 임플란트 추천' 등 질문 시 원장님 병원이 언급되도록 FAQ 구조화·스키마 마크업·E-E-A-T 콘텐츠를 최적화한다.", "6~12개월 후 AI 인용 가시화, 장기 안정 트래픽"],
      ["수익 구조 진단", "현재 주력 시술·비급여 가격 구조·재내원율을 분석하여 마케팅 투자 대비 수익이 가장 높은 채널과 시술을 우선 집중한다. 광고가 아닌 P&L 관점의 전략 설계.", "즉시~3개월 내 투자 효율 개선"],
    ].map((row, i) => new TableRow({ children: [
      dataCell(row[0], W_diff[0], i%2===0 ? "FFF8E1" : C.white, true, C.orange),
      dataCell(row[1], W_diff[1], i%2===0 ? "FFF8E1" : C.white),
      dataCell(row[2], W_diff[2], i%2===0 ? "FFF8E1" : C.white, false, C.green),
    ]}))),
  ]
});

// ── 실행 일정 표 ──
const W_road = [1800, 2200, 5200];
const roadmapTable = new Table({
  width: { size: 9200, type: WidthType.DXA }, columnWidths: W_road,
  rows: [
    new TableRow({ tableHeader: true, children: [
      hdrCell("단계", W_road[0]), hdrCell("기간", W_road[1]), hdrCell("주요 실행 내용", W_road[2])
    ]}),
    ...([
      ["1단계", "계약 후 2주", "병원 현황 진단 + 수익 구조 분석 + 네이버 플레이스 세팅 + SNS 계정 정비"],
      ["2단계", "1~3개월", "콘텐츠 제작 개시 + 블로그 SEO 키워드 세팅 + 리뷰 관리 시작 + 월간 성과 보고"],
      ["3단계", "3~6개월", "성과 데이터 기반 채널 최적화 + 원장 브랜딩 콘텐츠 개발 + 병원 BI 구체화"],
      ["4단계", "6개월+", "AEO 구축 + 체험단 운영 + 프리미엄 포지셔닝 완성 + 수익 구조 재점검"],
      ["Phase 2 (선택)", "12개월+", "외국인 환자 유치 기반 구축: 다국어 콘텐츠·글로벌 플랫폼 진출 전략 (희망 병원 한정)"],
    ].map((row, i) => new TableRow({ children: [
      dataCell(row[0], W_road[0], i%2===0 ? C.accentGreen : C.white, true, C.navy, AlignmentType.CENTER),
      dataCell(row[1], W_road[1], i%2===0 ? C.accentGreen : C.white, false, C.gray, AlignmentType.CENTER),
      dataCell(row[2], W_road[2], i%2===0 ? C.accentGreen : C.white),
    ]}))),
  ]
});

// ── 문서 조립 ──
const doc = new Document({
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.navy, space: 2 } },
          children: [
            new TextRun({ text: "BrandLab 브랜드 전략 제안서", font: "Arial", size: 18, bold: true, color: C.navy }),
            new TextRun({ text: "\t비밀 유지 | 2026년 5월", font: "Arial", size: 16, color: C.gray, italics: true }),
          ],
          tabStops: [{ type: "right", position: 9360 }],
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.navy, space: 2 } },
          children: [
            new TextRun({ text: "본 제안서의 내용은 수신자 외 제3자에게 공개하지 않는 것을 원칙으로 합니다.", font: "Arial", size: 14, color: C.gray, italics: true }),
            new TextRun({ text: "\t", font: "Arial", size: 14 }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: C.gray }),
          ],
          tabStops: [{ type: "right", position: 9360 }],
        })]
      })
    },
    children: [

      // ── 표지 ──
      space(), space(), space(), space(), space(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        shading: { fill: C.navy, type: ShadingType.CLEAR },
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: " ", font: "Arial", size: 8 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        shading: { fill: C.navy, type: ShadingType.CLEAR },
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: "BrandLab 브랜드 전략 제안서", font: "Arial", size: 52, bold: true, color: C.white })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        shading: { fill: C.navy, type: ShadingType.CLEAR },
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: "환자가 선택하는 병원을 만듭니다 — 브랜드 전략부터 수익 구조까지", font: "Arial", size: 24, color: "BDD7EE", italics: true })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        shading: { fill: C.navy, type: ShadingType.CLEAR },
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: " ", font: "Arial", size: 8 })]
      }),
      space(), space(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "2026년 5월", font: "Arial", size: 20, color: C.gray, italics: true })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: `BrandLab | 문의: ${BRANDLAB_EMAIL}`, font: "Arial", size: 18, color: C.gray })]
      }),
      pageBreak(),

      // ── 5분 안내 박스 ──
      new Paragraph({
        spacing: { before: 60, after: 60 },
        shading: { fill: C.accentGreen, type: ShadingType.CLEAR },
        border: { left: { style: BorderStyle.SINGLE, size: 14, color: C.green, space: 8 } },
        indent: { left: 200 },
        children: [new TextRun({ text: "5분 안에 파악하는 핵심: 1p 한 줄 요약 → 3p 패키지 가격 → 5p 왜 BrandLab인가 → 6p 상담 신청", font: "Arial", size: 18, color: C.green })]
      }),
      space(),

      // ── Executive Summary ──
      h1("한 줄 요약"),
      new Paragraph({
        spacing: { before: 60, after: 60 },
        shading: { fill: C.accentBlue, type: ShadingType.CLEAR },
        border: { left: { style: BorderStyle.SINGLE, size: 20, color: C.navy, space: 8 } },
        indent: { left: 200 },
        children: [
          new TextRun({ text: "광고대행사는 트래픽을 만듭니다. ", font: "Arial", size: 22, bold: true, color: C.navy }),
          new TextRun({ text: "BrandLab은 환자가 원장님 병원을 선택하는 이유를 만듭니다.", font: "Arial", size: 22, bold: true, color: C.blue }),
        ]
      }),
      space(),
      para("저희는 패션·라이프스타일 업계 20년 이상의 C-레벨 브랜드 전략 전문가로 구성되어 있습니다. 루이까또즈·지스타로우·원더플레이스 등 프리미엄 브랜드의 P&L을 직접 설계하고 흑자 전환시킨 경험을 의료 분야에 적용합니다. 단순 SNS 대행이 아닌, 병원의 브랜드 포지셔닝과 수익 구조를 함께 설계하는 전략 파트너입니다."),
      space(),
      highlight("핵심 차별점 3가지", C.accentBlue, C.navy),
      bullet("브랜드 전략 + 수익 구조 동시 설계: 광고비 효율이 아닌 P&L 관점에서 어떤 시술·채널에 집중해야 수익이 높아지는지를 함께 분석합니다.", true),
      bullet("패션·프리미엄 브랜딩 경험: 루이까또즈·지스타로우·바이파 등 글로벌 프리미엄 브랜드를 C-레벨에서 운영한 전략이 의료 브랜딩에 그대로 적용됩니다.", true),
      bullet("AEO(AI 검색 최적화) 선점: ChatGPT·네이버 AI에서 '이 지역 임플란트 추천'을 물었을 때 원장님 병원이 답으로 나오도록 지금부터 구조를 잡습니다.", true),
      pageBreak(),

      // ── 1. 현황 진단 ──
      h1("1. 원장님 병원이 처한 현실"),
      para("강남구·수지구 치과 30개소를 직접 조사한 결과, 디지털 마케팅에서 지역별로 뚜렷한 격차가 확인됩니다."),
      space(),
      h2("강남구 상위 치과의 성공 방정식: 원장님 병원에 그대로 적용합니다"),
      bullet("공통 성공 요인: 원장 브랜딩 + 채널 다양화. 단순 광고가 아닌 신뢰 콘텐츠로 충성 환자를 확보한 구조입니다."),
      bullet("루시드치과 적용 사례: 고유 시술명 '루시네이트' 브랜딩으로 키워드를 독점. 원장님 병원만의 시술명 브랜딩 전략을 설계해드립니다."),
      bullet("블랑쉬치과 적용 사례: 원장 직접 집필 칼럼으로 SEO + 신뢰도 동시 구축. 원장 브랜딩 패키지에서 동일 효과를 만듭니다."),
      bullet("에스플란트 적용 사례: 다국어 채널로 환자층 확대. 지역 특성에 맞춘 채널 전략으로 원장님 병원에 최적화합니다."),
      space(),
      h2("수지구: 경쟁이 낮고 지금 진입하면 빠르게 상위 노출 가능한 시장"),
      bullet("홈페이지 보유율 약 60%: 기본 디지털 인프라도 갖추지 않은 치과가 절반"),
      bullet("SNS 운영 치과: 전체의 20% 미만. 지금 시작하면 빠르게 상위 노출 가능"),
      bullet("'수지 임플란트', '동천역 치과교정' 등 지역 키워드 경쟁 강도가 강남의 10분의 1 수준"),
      space(),
      highlight("결론: 원장님 병원이 지금 놓치고 있는 온라인 환자를 저희가 찾아드립니다. 시작 6개월 후 채널별 성과 데이터로 직접 확인하실 수 있습니다."),
      pageBreak(),

      // ── 2. 제안 서비스 ──
      h1("2. 제안 서비스"),
      h2("기본 채널 관리"),
      bullet("네이버 플레이스 최적화: 키워드·사진·영업시간·리뷰 세팅으로 검색 상위 노출 유지"),
      bullet("네이버 블로그: 월 4~8건 전문 콘텐츠 제작. 의료법 준수 검수 포함"),
      bullet("인스타그램: 시술 전후사진·이벤트·원장 스토리 콘텐츠 월 4~8건"),
      bullet("AI 리뷰 관리: 네이버·구글 리뷰 모니터링 + 부정 리뷰 대응 초안 제공"),
      space(),
      h2("BrandLab 전용 서비스 (타 대행사 미제공)"),
      para("아래 세 가지 서비스는 BrandLab이 패션·프리미엄 브랜딩 경험을 의료에 접목한 고유 영역입니다. 단순 콘텐츠 대행이 아닌 병원의 브랜드 자산과 수익 구조를 함께 설계합니다."),
      space(),
      diffTable,
      pageBreak(),

      // ── 3. 패키지 및 가격 ──
      h1("3. 패키지 및 가격"),
      para("모든 패키지는 의료광고법 준수 콘텐츠 제작을 원칙으로 합니다. 과장 광고 없이 신뢰 기반 콘텐츠로 장기 충성 환자를 확보합니다."),
      space(),
      priceTable,
      space(),
      highlight("첫 달 무료 플레이스 진단 제공: 원장님 병원의 네이버 플레이스 현황을 무료로 점검해드립니다. 진단 후 계약 여부를 결정하셔도 됩니다.", C.accentGreen, C.green),
      space(),
      para("※ 가격 조정 기준: 콘텐츠 건수 증감(+/-20%) 또는 광고비 포함 여부에 따라 위 범위 내에서 조정됩니다. 범위를 벗어나는 견적은 제공하지 않습니다.", { color: C.gray, italics: true }),
      pageBreak(),

      // ── 4. 실행 일정 ──
      h1("4. 실행 일정"),
      para("계약 후 2주 내 첫 콘텐츠 발행을 목표로 합니다. 단계별로 성과를 측정하며 방향을 조정합니다. Phase 2는 외국인 환자 유치에 관심 있는 병원 한정으로 선택 제공합니다."),
      space(),
      roadmapTable,
      space(),
      highlight("매월 성과 보고서 제공: 채널별 노출·클릭·예약 전환 데이터를 월간 보고서로 제공합니다. 원장님이 직접 ROI를 확인하실 수 있습니다."),
      pageBreak(),

      // ── 5. 왜 BrandLab인가 ──
      h1("5. 왜 BrandLab인가"),
      h3("브랜드 전략 + P&L 동시 설계"),
      para("BrandLab 파트너들은 패션·라이프스타일 업계에서 브랜드 전략과 P&L 책임을 동시에 진 C-레벨 경력자입니다. 루이까또즈에서 EBIT 15억원 흑자 전환, 원더플레이스 중국에서 11개 매장·연 100억 매출 구축 등 실적이 있습니다. 마케팅 예산을 쓰는 방식이 아닌, 어떤 투자가 수익으로 돌아오는지를 먼저 설계합니다."),
      space(),
      h3("프리미엄 브랜딩 DNA"),
      para("루이까또즈·지스타로우·바이파(By Far) 등 글로벌 프리미엄 브랜드 운영 경험을 의료 브랜딩에 직접 적용합니다. 원장님을 '동네 치과'가 아닌 전문가 브랜드로 포지셔닝하여 가격 경쟁 없이 환자가 먼저 선택하는 구조를 만듭니다. 의료광고법을 준수하면서도 품격 있는 브랜드 콘텐츠가 가능한 이유입니다."),
      space(),
      h3("AEO·디지털 선점 기회"),
      para("조사 대상 치과 30개소 중 FAQ 구조화와 스키마 마크업을 갖춘 곳은 3곳(10%)에 불과합니다. 나머지 90%는 AI 검색 답변에서 인용되지 못하는 구조입니다. 지금 AEO를 시작하면 경쟁사 대비 구조적으로 유리한 위치에서 AI 검색 시대를 맞이합니다."),
      space(),
      h3("첫 달 성과 보장"),
      para("계약 후 첫 달 콘텐츠와 플레이스 세팅 결과를 검토하신 뒤, 기대에 미치지 못하면 해당 월 비용을 전액 환불해드립니다. 원장님이 직접 결과를 보고 판단하실 수 있습니다."),
      space(),

      // ── 6. 다음 단계 ──
      h1("6. 다음 단계"),
      new Paragraph({
        spacing: { before: 80, after: 80 },
        shading: { fill: C.navy, type: ShadingType.CLEAR },
        children: [new TextRun({ text: " ", size: 4 })]
      }),
      new Paragraph({
        spacing: { before: 60, after: 60 },
        shading: { fill: C.accentBlue, type: ShadingType.CLEAR },
        indent: { left: 200 },
        children: [new TextRun({ text: "원장님 병원의 현황을 무료로 진단해드립니다. 30분 상담으로 지금 어디서 기회를 놓치고 있는지 확인하세요.", font: "Arial", size: 22, bold: true, color: C.navy })]
      }),
      space(),
      bullet("1단계: 아래 연락처로 상담 신청 (이메일 또는 전화)"),
      bullet("2단계: 30분 무료 진단 미팅. 원장님 병원 현황 점검 및 맞춤 전략 제안"),
      bullet("3단계: 패키지 확정 후 계약, 2주 내 서비스 개시"),
      space(),
      new Paragraph({
        spacing: { before: 100, after: 100 },
        border: {
          top: { style: BorderStyle.SINGLE, size: 4, color: C.navy, space: 4 },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: C.navy, space: 4 },
        },
        children: [
          new TextRun({ text: `BrandLab   |   이메일: ${BRANDLAB_EMAIL}   |   `, font: "Arial", size: 20, bold: true, color: C.navy }),
          new TextRun({ text: "지금 바로 연락주시면 당일 답변드립니다.", font: "Arial", size: 20, color: C.navy }),
        ]
      }),
      space(),
      para("본 제안서에 궁금한 점이 있으시면 편하게 연락 주십시오. 원장님 병원의 상황에 맞는 맞춤 브랜드 전략을 함께 설계해드립니다.", { color: C.gray, italics: true }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(OUT_FILE, buffer);
  console.log('✅ BrandLab 제안서 저장 완료:', OUT_FILE);
}).catch(err => { console.error('❌ 오류:', err.message); });
