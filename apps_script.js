/**
  * GDD 2011 Dev Quiz apps_script
  * http://gdd-2011-quiz-japan.appspot.com/problems?problem=apps_script
  */
var oSS = SpreadsheetApp.getActiveSpreadsheet();

function gddDevQuiz() {
  var oSheet1 = oSS.getSheets()[0];

  // sample
  //var sUrl = "http://gdd-2011-quiz-japan.appspot.com/apps_script/sample";

  var sUrl = "http://gdd-2011-quiz-japan.appspot.com/apps_script/data?param=-7142761082889067344";
  var oResponse     = UrlFetchApp.fetch(sUrl);
  var nHttpStatus  = oResponse.getResponseCode();
  var sContentText = oResponse.getContentText();
  var aData             = Utilities.jsonParse(sContentText);

  oSheet1.setName(aData[0].city_name);

  if (nHttpStatus == 200) {
    if (aData) {
      createSheetFromData(aData);
    }
  } else {
    Browser.msgBox("Status: " + nHttpStatus);
  }

}

function createSheetFromData(aData) {
  if (!aData) {
    Browser.msgBox("no data");
    return;
  }
  for (var i=0, len=aData.length; i<len; i++) {
    var sSheetName = aData[i].city_name;
    var oSheet = oSS.getSheetByName(sSheetName) || oSS.insertSheet();
    oSheet.setName(sSheetName);
    oSheet.clear();
    
    var aPwData = aData[i].data;
    var nPwLen  = aPwData.length;
    var aPw = [];
    for (var j=0; j<nPwLen; j++) {
      var aVal = [aPwData[j].capacity, aPwData[j].usage];
      aPw.push(aVal);
    }
    var oRange   = oSheet.getRange(1, 1, nPwLen, 2);
    oRange.setValues(aPw);
    
    oSS.getActiveRange().offset(0,2,nPwLen).setFormulaR1C1("=TO_PERCENT(R[0]C[-1]/R[0]C[-2])");
  }
}
