const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ExternalHyperlink, Header, Footer, AlignmentType, PageOrientation,
  BorderStyle, WidthType, ShadingType, HeadingLevel, PageNumber,
  PageBreak, VerticalAlign
} = require('docx');
const fs = require('fs');
const path = require('path');

// 출력 폴더: 1순위 CLI 인자(node make_link_table.js <폴더>), 2순위 OUT_DIR 환경변수,
// 기본값은 현재 작업 디렉터리(process.cwd()). 폴더가 없으면 생성한다.
const OUT_DIR = process.argv[2] || process.env.OUT_DIR || process.cwd();
fs.mkdirSync(OUT_DIR, { recursive: true });
const OUT_FILE = path.join(OUT_DIR, '치과_홍보채널_조사표.docx');

// ─── 색상 상수 ────────────────────────────────────────────────────
const C = {
  headerBg: "1F4E79",   // 헤더 배경 (진한 파란색)
  gangnamBg: "DDEEFF",  // 강남구 행 연한 파랑
  sujiBg:    "E8F5E9",  // 수지구 행 연한 초록
  subHeaderBg: "2E75B6",// 소제목 배경
  white: "FFFFFF",
  dark:  "1A1A1A",
  gray:  "888888",
  link:  "1155CC",
};

// ─── 공통 테두리 ────────────────────────────────────────────────
const b = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: b, bottom: b, left: b, right: b };

const COLS = [400, 2300, 1600, 3200, 3800, 3738];
const TABLE_W = COLS.reduce((a, b) => a + b, 0);

function linkPara(label, url, size = 16) {
  if (!url || url === '-') {
    return new Paragraph({ children: [new TextRun({ text: '-', size, color: C.gray })] });
  }
  return new Paragraph({
    children: [new ExternalHyperlink({ link: url, children: [new TextRun({ text: label || url, size, color: C.link, underline: {} })] })]
  });
}
function textPara(text, opts = {}) {
  return new Paragraph({ children: [new TextRun({ text: text || '-', ...opts })] });
}
function cell(children, colIdx, bgColor, vAlign = VerticalAlign.CENTER) {
  return new TableCell({
    borders, width: { size: COLS[colIdx], type: WidthType.DXA },
    shading: { fill: bgColor, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: vAlign,
    children: Array.isArray(children) ? children : [children],
  });
}
function headerCell(text, colIdx) {
  return cell(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, size: 18, bold: true, color: C.white, font: "Arial" })] }), colIdx, C.headerBg);
}
function sectionRow(label, bgColor) {
  return new TableRow({ children: [new TableCell({ borders, columnSpan: 6, width: { size: TABLE_W, type: WidthType.DXA }, shading: { fill: bgColor, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: label, size: 20, bold: true, color: C.white, font: "Arial" })] })] })] });
}

// ─── 병원 데이터 ──────────────────────────────────────────────────
// ⚠️ 아래 gangnam(15곳) + suji(15곳) = 총 30개 병원은 강남구·수지구
//    조사 결과를 담은 "샘플 데이터"다. 다른 지역/과목으로 재사용할 때는
//    이 두 배열을 교체한다. 안전한 교체 방법(Python 전체 재작성 등)과
//    지역·과목 변경 절차는 references/customization.md(§A·§B·§E) 참고.
//    같은 병원 데이터가 make_analysis.js의 channelSummaryTable에도 있으니
//    함께 갱신한다.
const gangnam = [
  { num: "1", name: "에스플란트치과병원", area: "강남구 청담동", home: "https://splant.co.kr/", blog: null, sns: [{ label: "Instagram", url: "https://www.instagram.com/s_plant_dental/" }, { label: "YouTube", url: "https://www.youtube.com/channel/UCtnjkONAuDhjDGbN2YAXcLA" }] },
  { num: "2", name: "하루플란트치과", area: "서초구 (강남 인접)", home: "https://haruplant.co.kr/", blog: null, sns: [{ label: "Instagram", url: "https://www.instagram.com/haruplant_dental/" }] },
  { num: "3", name: "플란치과의원 강남점", area: "강남구 신사동", home: "https://implan.co.kr/", blog: null, sns: [{ label: "카카오채널", url: "https://pf.kakao.com/_eqFxis" }] },
  { num: "4", name: "스마일디치과", area: "강남구", home: "https://smiled.co.kr/", blog: "https://blog.naver.com/paradise060708", place: "https://naver.me/G8shChaU", sns: [{ label: "Instagram", url: "https://www.instagram.com/smiled_dent/" }, { label: "네이버예약", url: "https://booking.naver.com/booking/13/bizes/193854" }] },
  { num: "5", name: "강남레옹치과", area: "강남구", home: "https://www.gangnamdental.co.kr/", blog: null, sns: [{ label: "네이버예약", url: "https://booking.naver.com/booking/13/bizes/1082010" }, { label: "카카오채널", url: "https://pf.kakao.com/_uEPAM" }] },
  { num: "6", name: "강남세브란스치과병원", area: "강남구", home: "https://gs.severance.healthcare/gs-dent/index.do", blog: null, sns: [] },
  { num: "7", name: "강남역똑똑플란트치과", area: "강남구", home: "https://knockknockplant.co.kr/", blog: null, sns: [] },
  { num: "8", name: "뉴엔치과 강남점", area: "서초구 (강남 인접)", home: "https://www.newndental.com", blog: "https://blog.naver.com/dispute5405", sns: [{ label: "Instagram", url: "https://www.instagram.com/new_n_dental/" }, { label: "Facebook", url: "https://www.facebook.com/100094752944334/" }, { label: "YouTube", url: "https://www.youtube.com/@newndental" }] },
  { num: "9", name: "강남치유치과의원", area: "강남구 역삼동", home: "https://chiudental.co.kr/", blog: null, place: "https://map.naver.com/p/entry/place/1522806176", sns: [{ label: "Instagram", url: "https://www.instagram.com/chiudentalclinic_liz.ii00" }, { label: "카카오채널", url: "https://pf.kakao.com/_xjqDnn" }] },
  { num: "10", name: "강남젠틀치과", area: "서초구 (강남 인접)", home: "http://gangnamgentle.com/", blog: null, sns: [] },
  { num: "11", name: "루시드치과의원", area: "강남구 논현동", home: "https://www.teethlucid.com/", blog: "https://blog.naver.com/teethlucid", sns: [{ label: "Instagram", url: "https://www.instagram.com/lucid_dental_clinic/" }, { label: "네이버예약", url: "https://m.booking.naver.com/booking/13/bizes/875966" }, { label: "카카오채널", url: "https://pf.kakao.com/_nxnSxkxj" }] },
  { num: "12", name: "블랑쉬치과의원", area: "강남구 논현역", home: "https://www.blanche.kr/", blog: "https://www.blanche.kr/blog/", sns: [{ label: "Instagram", url: "https://www.instagram.com/blanche__dental/" }] },
  { num: "13", name: "아이디치과", area: "강남구", home: "https://www.iddental.co.kr/", blog: null, sns: [] },
  { num: "14", name: "365베스트치과", area: "강남구", home: "https://365bestdentalclinic.com/", blog: null, sns: [] },
  { num: "15", name: "강남숙면치과", area: "강남구 압구정", home: "https://xn--939a4q91gw0ntsjqps.com/", blog: null, sns: [] },
];
const suji = [
  { num: "16", name: "수지예인치과의원", area: "수지구 풍덕천동", home: "https://yedent.co.kr/", blog: null, sns: [{ label: "Facebook", url: "https://www.facebook.com/sujiyedental" }] },
  { num: "17", name: "보스톤서울치과", area: "수지구", home: "http://bsdental.kr/", blog: null, sns: [{ label: "네이버예약", url: "https://m.booking.naver.com/booking/13/bizes/996406" }] },
  { num: "18", name: "수지좋은치과의원", area: "수지구 풍덕천동", home: "http://sujidental.com/", blog: null, sns: [] },
  { num: "19", name: "단국대학교 죽전치과병원", area: "수지구 죽전동", home: "https://dkdh.dankook.ac.kr/", blog: null, sns: [] },
  { num: "20", name: "임플라인치과 용인점", area: "수지구", home: "http://implineyi.com/", blog: null, sns: [{ label: "Facebook", url: "https://www.facebook.com/implinegn/" }] },
  { num: "21", name: "광교치과의원", area: "수지구 상현동", home: "https://kwangkyou.modoo.at/", blog: null, sns: [] },
  { num: "22", name: "NYU아름다운치과교정과", area: "수지구 풍덕천동", home: null, blog: null, sns: [] },
  { num: "23", name: "아림구강내과치과의원", area: "수지구 동천동", home: null, blog: null, sns: [] },
  { num: "24", name: "휴플러스치과의원", area: "수지구 성복동", home: null, blog: null, sns: [] },
  { num: "25", name: "서울성복치과의원", area: "수지구 성복동", home: "http://sbdent.co.kr/", blog: null, sns: [] },
  { num: "26", name: "온누리치과의원", area: "수지구 성복동", home: null, blog: null, sns: [] },
  { num: "27", name: "봄누리치과의원", area: "수지구 상현동", home: null, blog: null, sns: [] },
  { num: "28", name: "트리플에이치과의원", area: "수지구 죽전동", home: null, blog: null, sns: [] },
  { num: "29", name: "수지이다치과의원", area: "수지구 성복동", home: null, blog: null, sns: [] },
  { num: "30", name: "선데이치과", area: "수지구 동천동", home: "http://www.sundaydent.com/", blog: null, sns: [{ label: "Instagram", url: "https://www.instagram.com/sundaydental/" }, { label: "Facebook", url: "https://www.facebook.com/sundaydental2016/" }] },
];

function makeDataRow(clinic, bgColor) {
  const blogChildren = [];
  if (clinic.blog) blogChildren.push(linkPara("네이버 블로그", clinic.blog));
  if (clinic.place) blogChildren.push(linkPara("네이버 플레이스", clinic.place));
  if (blogChildren.length === 0) blogChildren.push(textPara('-', { size: 16, color: C.gray }));
  const snsChildren = clinic.sns && clinic.sns.length > 0 ? clinic.sns.map(s => linkPara(s.label, s.url)) : [textPara('-', { size: 16, color: C.gray })];
  return new TableRow({ children: [
    cell(textPara(clinic.num, { size: 16, bold: true, alignment: AlignmentType.CENTER }), 0, bgColor),
    cell(textPara(clinic.name, { size: 16, bold: true, color: C.dark }), 1, bgColor),
    cell(textPara(clinic.area, { size: 15, color: "444444" }), 2, bgColor),
    cell(clinic.home ? linkPara("홈페이지 바로가기", clinic.home) : textPara('미확인', { size: 16, color: C.gray }), 3, bgColor),
    cell(blogChildren, 4, bgColor),
    cell(snsChildren, 5, bgColor),
  ]});
}

const headerRow = new TableRow({ tableHeader: true, children: [headerCell("번호", 0), headerCell("병원명", 1), headerCell("지역", 2), headerCell("홈페이지", 3), headerCell("네이버 블로그 / 플레이스", 4), headerCell("인스타그램 / 기타 SNS", 5)] });
const table = new Table({ width: { size: TABLE_W, type: WidthType.DXA }, columnWidths: COLS, rows: [headerRow, sectionRow("▶ 서울 강남구 · 강남 인접 지역 (15개 병원)", C.subHeaderBg), ...gangnam.map(c => makeDataRow(c, C.gangnamBg)), sectionRow("▶ 경기도 용인시 수지구 (15개 병원)", "2E7D4F"), ...suji.map(c => makeDataRow(c, C.sujiBg))] });

const doc = new Document({
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840, orientation: PageOrientation.LANDSCAPE }, margin: { top: 864, right: 864, bottom: 864, left: 864 } } },
    headers: { default: new Header({ children: [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.headerBg, space: 1 } }, children: [new TextRun({ text: "서울 강남구 · 용인 수지구 치과 홍보 채널 조사", size: 18, color: C.headerBg, bold: true }), new TextRun({ text: "\t조사일: 2026년 5월", size: 16, color: C.gray })], tabStops: [{ type: "right", position: 15038 }] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.headerBg, space: 1 } }, children: [new TextRun({ text: "BrandLab 치과 홍보 채널 벤치마킹", size: 16, color: C.gray }), new TextRun({ text: "\t", size: 16 }), new TextRun({ text: "Page ", size: 16, color: C.gray }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: C.gray })], tabStops: [{ type: "right", position: 15038 }] })] }) },
    children: [
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "서울 강남구 · 용인 수지구 치과 홍보 채널 조사", font: "Arial", size: 36, bold: true, color: C.headerBg })] }),
      new Paragraph({ children: [new TextRun({ text: "강남구 15곳 + 수지구 15곳 | 총 30개 병원 | 2026년 5월 조사", size: 20, color: C.gray, italics: true })] }),
      new Paragraph({ children: [new TextRun({ text: " ", size: 20 })] }),
      new Paragraph({ children: [new TextRun({ text: "※ 조사 항목: 홈페이지, 네이버 블로그, 네이버 플레이스, 인스타그램, 페이스북, 유튜브, 카카오채널 등", size: 18, color: "333333" })] }),
      new Paragraph({ children: [new TextRun({ text: "※ '미확인'은 홈페이지 또는 SNS 채널을 현재 운영하지 않거나 공개되지 않은 경우입니다.", size: 18, color: "333333" })] }),
      new Paragraph({ children: [new TextRun({ text: " ", size: 20 })] }),
      table,
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(OUT_FILE, buffer);
  console.log('✅ 저장 완료:', OUT_FILE);
}).catch(err => { console.error('❌ 오류:', err.message); });
