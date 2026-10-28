/**
 * ==========================================================================
 * [모아워크 MOAWORK] 구글 스프레드시트 연동 및 웹앱 대시보드 통합 스크립트
 * 
 * [주요 기능]
 * 1. doPost(e) : 홈페이지에서 '무료상담 신청서' 접수 시 시트에 자동 저장
 * 2. doGet(e)  : 
 *    - 웹 브라우저로 접속 시: 실시간 '상담 관리자 대시보드' 웹 화면 표시 (PC/모바일 공용)
 *    - 관리자 프로그램(admin.html) 연동 시: JSON / JSONP 데이터 실시간 제공
 * ==========================================================================
 */

// --------------------------------------------------------------------------
// [1] 무료상담 신청서 접수 데이터 저장 (doPost)
// --------------------------------------------------------------------------
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    // 시트가 완전히 비어있거나 헤더가 없는 경우 자동으로 1행 헤더 생성
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['접수일시', '대표자명/브랜드명', '연락처', '이메일', '희망서비스', '제품소개 및 문의내용']);
      var headerRange = sheet.getRange(1, 1, 1, 6);
      headerRange.setBackground('#ae3115'); // 모아워크 시그니처 테라코타 색상
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }
    
    // 전송된 데이터 파싱 (JSON 형태 또는 Form 파라미터 형태 지원)
    var data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = e.parameter || {};
      }
    } else {
      data = e.parameter || {};
    }
    
    // 한국 표준시(KST) 기준 현재 날짜/시간 생성
    var timestamp = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    var brandName = data.brandName || "";
    var contactPhone = data.contactPhone || "";
    var contactEmail = data.contactEmail || "";
    var services = data.services || "선택 없음";
    var inquiryMessage = data.inquiryMessage || "내용 없음";
    
    // 스프레드시트의 맨 아래 행에 새 상담 데이터 추가
    sheet.appendRow([
      timestamp,
      brandName,
      contactPhone,
      contactEmail,
      services,
      inquiryMessage
    ]);
    
    // 성공 응답 반환
    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      message: "상담 신청이 성공적으로 저장되었습니다."
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// --------------------------------------------------------------------------
// [2] 웹앱 대시보드 화면 및 데이터 조회 (doGet)
// --------------------------------------------------------------------------
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    var data = sheet.getDataRange().getValues();
    
    // 스프레드시트 데이터를 객체 목록으로 변환 (1행 헤더 제외)
    var rows = [];
    if (data.length > 1) {
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (!row[0] && !row[1] && !row[2]) continue; // 빈 행 제외
        
        var dateStr = row[0] instanceof Date 
          ? Utilities.formatDate(row[0], "Asia/Seoul", "yyyy-MM-dd HH:mm:ss") 
          : String(row[0] || "");
          
        rows.push({
          id: i,
          timestamp: dateStr,
          brandName: String(row[1] || ""),
          contactPhone: String(row[2] || ""),
          contactEmail: String(row[3] || ""),
          services: String(row[4] || ""),
          inquiryMessage: String(row[5] || "")
        });
      }
    }
    
    // 최신 접수 순서로 역순 정렬 (최신글이 맨 위로)
    rows.reverse();
    
    // (A) JSONP 요청 처리 (admin.html에서 script 태그로 로드 시)
    if (e && e.parameter && e.parameter.callback) {
      var callback = e.parameter.callback;
      var jsonpData = JSON.stringify({ result: "success", data: rows });
      return ContentService.createTextOutput(callback + "(" + jsonpData + ");")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    // (B) 순수 JSON API 요청 처리 (?format=json 파라미터가 있을 때)
    if (e && e.parameter && e.parameter.format === 'json') {
      return ContentService.createTextOutput(JSON.stringify({
        result: "success",
        count: rows.length,
        data: rows
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // (C) 웹 브라우저에서 바로가기로 직접 접속했을 때: 실시간 웹앱 대시보드 화면 표시!
    var htmlContent = buildDashboardHtml(rows);
    return HtmlService.createHtmlOutput(htmlContent)
      .setTitle("모아워크 상담 관리 대시보드")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
      
  } catch (error) {
    return ContentService.createTextOutput("오류가 발생했습니다: " + error.toString());
  }
}

// --------------------------------------------------------------------------
// [3] 브라우저 접속 시 띄워주는 프리미엄 대시보드 HTML 생성기
// --------------------------------------------------------------------------
function buildDashboardHtml(rows) {
  var rowsJson = JSON.stringify(rows);
  
  return '<!DOCTYPE html>' +
  '<html lang="ko">' +
  '<head>' +
  '  <meta charset="UTF-8">' +
  '  <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
  '  <title>모아워크 상담 접수 관리 대시보드</title>' +
  '  <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />' +
  '  <style>' +
  '    * { box-sizing: border-box; margin: 0; padding: 0; }' +
  '    body { font-family: Pretendard, sans-serif; background: #FAF8F5; color: #111C2D; padding: 20px; line-height: 1.5; }' +
  '    .container { max-width: 1200px; margin: 0 auto; }' +
  '    .header { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 20px 28px; border-radius: 20px; border: 1px solid #EDE7DF; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(43,38,35,0.04); }' +
  '    .header h1 { font-size: 22px; color: #AE3115; display: flex; align-items: center; gap: 10px; }' +
  '    .header .btn-refresh { background: #AE3115; color: #fff; border: none; padding: 10px 18px; border-radius: 12px; font-weight: 600; cursor: pointer; text-decoration: none; font-size: 14px; }' +
  '    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 20px; }' +
  '    .stat-card { background: #fff; padding: 20px; border-radius: 18px; border: 1px solid #EDE7DF; }' +
  '    .stat-label { font-size: 13px; color: #8D716A; font-weight: 600; }' +
  '    .stat-value { font-size: 28px; font-weight: 700; color: #111C2D; margin-top: 4px; }' +
  '    .table-container { background: #fff; border-radius: 20px; border: 1px solid #EDE7DF; overflow-x: auto; box-shadow: 0 4px 16px rgba(43,38,35,0.04); }' +
  '    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }' +
  '    th { background: #F6F3EE; color: #59413C; font-weight: 700; padding: 14px 18px; border-bottom: 1px solid #EDE7DF; white-space: nowrap; }' +
  '    td { padding: 14px 18px; border-bottom: 1px solid #F1ECE6; vertical-align: top; }' +
  '    tr:hover { background: #FCFAF8; }' +
  '    .badge { display: inline-block; background: #FFDAD2; color: #AE3115; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; }' +
  '    .phone-link { color: #006C50; text-decoration: none; font-weight: 600; }' +
  '    .empty { padding: 60px 20px; text-align: center; color: #8D716A; font-size: 16px; }' +
  '  </style>' +
  '</head>' +
  '<body>' +
  '  <div class="container">' +
  '    <div class="header">' +
  '      <h1>📊 모아워크 실시간 상담 대시보드</h1>' +
  '      <button class="btn-refresh" onclick="location.reload()">🔄 새로고침</button>' +
  '    </div>' +
  '    <div class="stats-grid">' +
  '      <div class="stat-card">' +
  '        <div class="stat-label">총 접수 건수</div>' +
  '        <div class="stat-value" id="totalCount">' + rows.length + '건</div>' +
  '      </div>' +
  '      <div class="stat-card">' +
  '        <div class="stat-label">시스템 상태</div>' +
  '        <div class="stat-value" style="color:#006C50; font-size:22px;">🟢 정상 연동중</div>' +
  '      </div>' +
  '    </div>' +
  '    <div class="table-container">' +
  '      <table>' +
  '        <thead>' +
  '          <tr>' +
  '            <th style="width:160px;">접수일시</th>' +
  '            <th style="width:160px;">대표자명 / 브랜드명</th>' +
  '            <th style="width:140px;">연락처</th>' +
  '            <th style="width:160px;">이메일</th>' +
  '            <th style="width:160px;">희망 서비스</th>' +
  '            <th>문의 내용</th>' +
  '          </tr>' +
  '        </thead>' +
  '        <tbody id="tableBody">' +
             (rows.length === 0 ? '<tr><td colspan="6" class="empty">아직 접수된 상담 신청이 없습니다.</td></tr>' : '') +
  '        </tbody>' +
  '      </table>' +
  '    </div>' +
  '  </div>' +
  '  <script>' +
  '    var dataList = ' + rowsJson + ';' +
  '    var tbody = document.getElementById("tableBody");' +
  '    if (dataList.length > 0) {' +
  '      tbody.innerHTML = dataList.map(function(item) {' +
  '        return "<tr>" +' +
  '          "<td>" + (item.timestamp || "-") + "</td>" +' +
  '          "<td><strong>" + (item.brandName || "-") + "</strong></td>" +' +
  '          "<td><a class=\'phone-link\' href=\'tel:" + item.contactPhone + "\'>📞 " + (item.contactPhone || "-") + "</a></td>" +' +
  '          "<td>" + (item.contactEmail || "-") + "</td>" +' +
  '          "<td><span class=\'badge\'>" + (item.services || "선택없음") + "</span></td>" +' +
  '          "<td style=\'white-space:pre-wrap;\'>" + (item.inquiryMessage || "-") + "</td>" +' +
  '        "</tr>";' +
  '      }).join("");' +
  '    }' +
  '  <\/script>' +
  '</body>' +
  '</html>';
}
