/* doc_toolbar.js — 신메뉴 기획서·경쟁사 분석표 등 독립 문서용 저장/인쇄 기능
   외부 라이브러리 없이 동작:
   - 엑셀(.xls): 문서 내 table들을 Excel이 여는 HTML 스프레드시트로 저장
   - 워드(.doc): 문서 본문(.doc-page)을 Word가 여는 HTML 문서로 저장
   - PDF/인쇄: window.print() (브라우저 인쇄 대화상자에서 'PDF로 저장' 선택)
   사용법: 문서 HTML에 <div id="docToolbar"></div> 와 본문 .doc-sheet(또는 .doc-page) 포함 후 이 스크립트 로드.
*/
(function(){
  function fileName(ext){
    var t=(document.title||"document").replace(/[\\/:*?"<>|]/g,"_").trim();
    var d=new Date().toISOString().slice(0,10);
    return t+"_"+d+"."+ext;
  }
  function download(content, name, mime){
    var blob=new Blob([content],{type:mime});
    var url=URL.createObjectURL(blob);
    var a=document.createElement("a");
    a.href=url; a.download=name; document.body.appendChild(a); a.click();
    setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(url);},100);
  }
  function cellText(c){
    // 입력 필드가 있으면 그 값을, 없으면 텍스트를 사용 (인터랙티브 표 대응)
    var inp=c.querySelector("input,textarea,select");
    var t = inp ? (inp.value||"") : c.innerText;
    return t.replace(/&/g,"&amp;").replace(/</g,"&lt;");
  }
  // 엑셀: 문서 내 모든 table을 시트로 (단순화: 모든 table을 하나의 시트에 순서대로)
  function toExcel(){
    var tables=document.querySelectorAll(".doc-sheet table, .doc-page table, .wrap table");
    if(!tables.length){ alert("표가 없어 엑셀로 저장할 수 없습니다."); return; }
    var rows="";
    tables.forEach(function(tb){
      tb.querySelectorAll("tr").forEach(function(tr){
        rows+="<tr>";
        tr.querySelectorAll("th,td").forEach(function(c){
          var span=c.colSpan>1?(' colspan="'+c.colSpan+'"'):"";
          rows+="<td"+span+">"+cellText(c)+"</td>";
        });
        rows+="</tr>";
      });
      rows+="<tr><td></td></tr>"; // 표 사이 빈 줄
    });
    var html='<html xmlns:o="urn:schemas-microsoft-com:office:office" '+
      'xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">'+
      '<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>'+
      '<x:ExcelWorksheet><x:Name>문서</x:Name><x:WorksheetOptions><x:DisplayGridlines/>'+
      '</x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->'+
      '<style>td{border:1px solid #999;padding:4px 8px;mso-number-format:"\\@";}</style></head>'+
      '<body><table>'+rows+'</table></body></html>';
    download('\ufeff'+html, fileName("xls"), "application/vnd.ms-excel;charset=utf-8");
  }
  // 워드: 본문 전체를 .doc로
  function toWord(){
    var body=document.querySelector(".doc-body")||document.querySelector(".wrap")||document.body;
    var css=Array.prototype.map.call(document.querySelectorAll("style"),function(s){return s.innerHTML;}).join("\n");
    var html='<html xmlns:o="urn:schemas-microsoft-com:office:office" '+
      'xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">'+
      '<head><meta charset="UTF-8"><style>'+css+
      '@page{size:A4;margin:2cm;} body{font-family:"맑은 고딕","Malgun Gothic",sans-serif;}'+
      '.doc-toolbar{display:none!important;}</style></head><body>'+body.innerHTML+'</body></html>';
    download('\ufeff'+html, fileName("doc"), "application/msword;charset=utf-8");
  }
  function buildToolbar(){
    var host=document.getElementById("docToolbar");
    if(!host) return;
    if(!host.className) host.className="doc-toolbar";
    host.innerHTML=
      '<button class="dt-btn" data-act="xls">⬇ 엑셀(.xls)</button>'+
      '<button class="dt-btn" data-act="doc">⬇ 워드(.doc)</button>'+
      '<button class="dt-btn primary" data-act="print">🖨 PDF·인쇄</button>';
    host.addEventListener("click",function(e){
      var b=e.target.closest("[data-act]"); if(!b) return;
      var a=b.dataset.act;
      if(a==="xls") toExcel();
      else if(a==="doc") toWord();
      else if(a==="print") window.print();
    });
  }
  if(document.readyState!=="loading") buildToolbar();
  else document.addEventListener("DOMContentLoaded", buildToolbar);
})();
