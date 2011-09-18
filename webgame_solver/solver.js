/**
 * GDD 2011 webgame solver
 * http://gdd-2011-quiz-japan.appspot.com/problems?problem=webgame
 * @requires jQuery
 * @module webgame_solver
 */

var oColorIndex  = {};
var nClickCnt    = 0;
var oClickEv     = document.createEvent("MouseEvents");
oClickEv.initEvent("click", false, true);

$(".card").each( function(idx, el){
  var sId = el.id;
  var oEl = $("#"+sId);
  
  el.dispatchEvent(oClickEv);
  nClickCnt = nClickCnt + 1;
  
  var sBgCol = el.style.backgroundColor.replace(/[\(\),\s]/g,"");
  // oEl.after("<p>"+ sBgCol +"</p>");
  
  var sExisting = oColorIndex[sBgCol];
  if (sExisting) {
    document.getElementById(sExisting).dispatchEvent(oClickEv);
	nClickCnt = nClickCnt + 1;
	if (nClickCnt % 2) {
	  el.dispatchEvent(oClickEv);
	  nClickCnt = nClickCnt + 1;
	}
  } else if (!sExisting) {
	oColorIndex[sBgCol] = sId;
  }
});

