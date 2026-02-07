function doPost(e) {
  var params = JSON.parse(e.postData.contents);
  var action = params.action;
  var name = params.name;
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Stats") || ss.insertSheet("Stats");
  
  // Setup headers if new sheet
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Player Name", "Wins", "Losses", "Draws", "Last Updated"]);
    sheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#f3f3f3");
  }
  
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === name) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (action === "record") {
    var isWin = params.isWin;
    var isDraw = params.isDraw;
    
    if (rowIndex === -1) {
      sheet.appendRow([name, isWin ? 1 : 0, (!isWin && !isDraw) ? 1 : 0, isDraw ? 1 : 0, new Date()]);
    } else {
      var wins = data[rowIndex-1][1];
      var losses = data[rowIndex-1][2];
      var draws = data[rowIndex-1][3];
      
      if (isWin) wins++;
      else if (isDraw) draws++;
      else losses++;
      
      sheet.getRange(rowIndex, 2).setValue(wins);
      sheet.getRange(rowIndex, 3).setValue(losses);
      sheet.getRange(rowIndex, 4).setValue(draws);
      sheet.getRange(rowIndex, 5).setValue(new Date());
    }
    return ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "get") {
    var stats = { wins: 0, losses: 0, draws: 0 };
    if (rowIndex !== -1) {
      stats.wins = data[rowIndex-1][1];
      stats.losses = data[rowIndex-1][2];
      stats.draws = data[rowIndex-1][3];
    }
    return ContentService.createTextOutput(JSON.stringify(stats)).setMimeType(ContentService.MimeType.JSON);
  }
}
