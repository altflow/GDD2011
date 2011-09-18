/**
 * GDD 2011 sliding puzzle solver
 * http://gdd-2011-quiz-japan.appspot.com/problems?problem=slidingpuzzle
 *
 * reading problem file data and output results in text format
 * 
 * @requires node.js
 */

var fs     = require("fs");
var crypto = require("crypto");

//var sInFile    = "./gdd_test.txt"; // for test
var sInFile = "./gdd_slidepuzzle.txt"; // actual file
var sOutFile   = "./gdd2011_slide_results.txt";
var oRemaining = {};

fs.readFile(sInFile, processFile);

/**
 * processFile
 * reading file and call appropreate solver function
 * @param {object} err error object
 * @param {object} contents
 * @return {void}
 */
function processFile(err, contents) {
	console.log("processing file");
	
	if (err) {
		console.log("read error");
		console.log(err);
		return;
	}
	
	var aAnswer    = [];
	var aLines     = contents.toString().split(/\n/);
	var aTemp      = aLines.shift().split(/\s/);
	var nBoardNum  = aLines.shift();
	var nLineNum   = aLines.length;

	oRemaining = {"L": aTemp[0], "R": aTemp[1], "U": aTemp[2], "D": aTemp[3]};
	
	if (nLineNum != nBoardNum) {
		console.log("Number of Boards is different from lines.");
		console.log("BoardNum: " + nBoardNum);
		console.log("Lines: " + nLineNum);
		return;
	}
	
	// counter for analyze
	// simple 8
	var Cnt8 = 0;
	// w/o wall
	var CntS = 0;
	
	for (var i=0; i<nLineNum; i++) {
		var aProblem = aLines[i].split(/,/);
		if (aProblem.length < 3) {
			break;
		}
		
		var nColums  = aProblem[0];
		var nRows    = aProblem[1];
		var sData    = aProblem[2];
		var bHasWall = sData.match(/=/);
		
		if ( (nColums*nRows) < 21 && !bHasWall) {
			console.log("No." + (i+1) + ": Simple, small Puzzle");
			Cnt8 = Cnt8 + 1;
			
			aAnswer.push( solveSimple(nColums, nRows, sData) );
			//aAnswer.push("");
			
		} else if (!bHasWall) {
			console.log("No." + (i+1) + ": Puzzle w/o Wall");
			CntS = CntS + 1;
			//aAnswer.push( solveSimple(nColums, nRows, sData) );
			aAnswer.push("");
			
		} else {
			console.log("No." + (i+1) + ": Puzzle w/ Wall");
			aAnswer.push("");
		}
	}
	
	console.log("\n Simple Small: " + Cnt8);
	console.log("Puzzle w/o Wall: " + CntS);
	
	fs.writeFile(sOutFile, aAnswer.join("\n"));
}

/**
 * solveSimple
 * puzzle (w/o wall) solver
 * @param {number} Columns
 * @param {number} Rows
 * @param {string} Data
 * @return {string} Answer
 */
function solveSimple(nColums, nRows, sData) {
	console.log("Simple puzzle");
	var sResults      = getFinalState(sData);
	var aFwQueue      = [];
	var aBwQueue      = [];
	var oFwStates     = {};
	var oBwStates     = {};
	var nQIdx         = 0;
	var sFwCrntState  = "";
	var sBwCrntState  = "";
	var sFwGoalState  = "";
	var sBwGoalState  = "";
	var sMatchedState = "";
	var aAnswer       = [];
	
	console.log("Results: " + sResults);
	
	aFwQueue.push(sData);
	oFwStates[md5(sData)] = { "state": sData, "prevStateHash": "", "moved": "" };
	sFwGoalState          = sResults;
	
	aBwQueue.push(sResults);
	oBwStates[md5(sResults)] = { "state": sResults, "prevStateHash": "", "moved": "" };
	sBwGoalState             = sData;
	
	search:
	while(true) {
		sFwCrntState = aFwQueue[nQIdx];
		sBwCrntState = aBwQueue[nQIdx];
		//console.log(nQIdx + ":" + sFwCrntState + ", " + sBwCrntState);
		
		if (sFwCrntState || sBwCrntState) {
			if (sFwCrntState) {
				// search forward
				var aFwNextStates = possibleState(sFwCrntState, nColums, nRows);
				aFwNextStates     = getMinStates(aFwNextStates, sFwGoalState, nColums, nRows);
				
				for (var j=0, nLen=aFwNextStates.length; j<nLen; j++) {
					var sFwNextState = aFwNextStates[j].state;
					// if next state doesn't exist in FwQueue (oFwStates), insert in Queue
					if (!oFwStates[md5(sFwNextState)]) {
						aFwQueue.push(sFwNextState);
						oFwStates[md5(sFwNextState)] = {
							"state": sFwNextState,
							"prevStateHash": md5(sFwCrntState),
							"moved": aFwNextStates[j].moved
						};
					}
					// if next state exists in BwQueue (oBwStates), puzzle solved
					if (oBwStates[md5(sFwNextState)]) {
						console.log("puzzle solved. num of state: " + (nQIdx*2));
						sMatchedState = sFwNextState;
						break search;
					}
				}
			}
			if (sBwCrntState) {
				// search backward
				var aBwNextStates = possibleState(sBwCrntState, nColums, nRows);
				aBwNextStates     = getMinStates(aBwNextStates, sBwGoalState, nColums, nRows);
				
				for (var k=0, nLen=aBwNextStates.length; k<nLen; k++) {
					var sBwNextState = aBwNextStates[k].state;
					// if next state isn't exist in Queue (oStates), insert in Queue
					if (!oBwStates[md5(sBwNextState)]) {
						aBwQueue.push(sBwNextState);
						oBwStates[md5(sBwNextState)] = {
							"state": sBwNextState,
							"prevStateHash": md5(sBwCrntState),
							"moved": aBwNextStates[k].moved
						};
					}
					// if next state exists in FwQueue (oFwStates), puzzle solved
					if (oFwStates[md5(sBwNextState)]) {
						console.log("puzzle solved. num of state: " + (nQIdx*2));
						sMatchedState = sBwNextState;
						break search;
					}
				}
			}
		} else {
			console.log(nQIdx + ", cannot solve the problem..");
			
			// fs.writeFile("./fw_queue.txt", aFwQueue.join("\n"));
		    // fs.writeFile("./fw_state_obj.txt", JSON.stringify(oFwStates, null, "  "));
		    // fs.writeFile("./bw_queue.txt", aBwQueue.join("\n"));
		    // fs.writeFile("./bw_state_obj.txt", JSON.stringify(oBwStates, null, "  "));
			
			return aAnswer.join("");
		}
		nQIdx = nQIdx + 1;
		//console.log("loop: " + nQIdx);
		
		if (nQIdx > 60000) {
			console.log("give up...");
			return aAnswer.join("");
		}
		
	}
	
	aFwQueue = []; // init. is this reduce memory?
	aBwQueue = []; // init. is this reduce memory?
	
	// generate answer
	console.log("generating answer...");
	// console.log(sMatchedState);
	
	// generate from FwStates
	var sStateHash = md5(sMatchedState);
	while(true) {
		var sDirection = oFwStates[sStateHash] ? oFwStates[sStateHash].moved : "";
		if (sDirection) {
			aAnswer.unshift(sDirection);
			sStateHash = oFwStates[sStateHash].prevStateHash;
		} else {
			break;
		}
	}
	
	// generate from BwStates
	sStateHash = md5(sMatchedState);
	while(true) {
		var sDirection = oBwStates[sStateHash] ? oBwStates[sStateHash].moved : "";
		if (sDirection) {
			aAnswer.push(revertDirection(sDirection));
			sStateHash = oBwStates[sStateHash].prevStateHash;
		} else {
			break;
		}
	}
	
	oFwStates = {}; // init. is this reduce memory?
	oBwStates = {}; // init. is this reduce memory?
	
	console.log(aAnswer.join(""));
	return aAnswer.join("");
}

/**
 * getMinStates
 * returns state that is the most close to goal first
 * @param {array} States array consist of state and moved direction
 *                (example) [{"state":"1230", "moved":"D"}, {....}]
 * @param {string} Goal
 * @param {number} Columns
 * @param {number} Rows
 * @return {array} MinStates (example) [{"state":"1230", "moved":"D"}]
 */
function getMinStates(aStates, sGoal, nColumns, nRows) {
	var nStLen     = sGoal.length;
	var oPos       = new Position(nColumns, nRows);
	var oMinDist   = {"dist": 999, "stIdxs": []};
	var aMinStates = [];
	
	for (var i=0, nLen=aStates.length; i<nLen; i++) {
		var aTmpState = aStates[i]["state"].split("");
		var nDistance = 0;
		
		for (var j=0; j<nStLen; j++) {
			var nGIdx  = sGoal.indexOf( aTmpState[j] );
			var nXDist = Math.abs(oPos.x(j) - oPos.x(nGIdx));
			var nYDist = Math.abs(oPos.x(j) - oPos.y(nGIdx));
			nDistance = nDistance + nXDist + nYDist;
		}
		
		if (nDistance < oMinDist.dist) {
			oMinDist.dist   = nDistance;
			oMinDist.stIdxs = [];
			oMinDist.stIdxs.push(i);
		} else if (nDistance == oMinDist.dist) {
			oMinDist.stIdxs.push(i);
		}
	}
	///console.log( JSON.stringify(oMinDist, null, "    ") );
	//console.log(aStates[oMinDist.stIdx]);
	
	for (var k=0, nILen=oMinDist.stIdxs.length; k<nILen; k++) {
		aMinStates.push( aStates[oMinDist.stIdxs[k]] );
	}
	
	arycheck:
	for (var i=0, nLen=aStates.length; i<nLen; i++) {
		for (var j=0, l=oMinDist.stIdxs.length; j<l; j++) {
			if (i == oMinDist.stIdxs[j]) {
				continue arycheck;
			}
		}
		aMinStates.push( aStates[i] );
	}
	//console.log(aMinStates);
	return aMinStates;
}

/**
 * revertDirection
 * returns opposite direction
 * @param {string} Direction
 * @returns {string} Opposite
 */
function revertDirection(sDirection) {
	var oOpposite = { "L":"R", "R":"L", "U":"D", "D":"U" };
	return oOpposite[sDirection];
}

/**
 * getFinalState
 * returns final state of the problem
 * @param {string} Data problem data
 * @return {string} FinalState
 */
function getFinalState(sData) {
	var aFinalState = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
	var aData   = sData.split("");
	
	var nLen = aData.length;
	for (var i=0; i<nLen; i++) {
		aData[i] = aFinalState[i];
	}
	aData[nLen-1] = 0;
	
	return aData.join("");
}

/**
 * possibleState
 * returns possible state. it should be like
 * [{"state":"1230", "moved": "U"}, {"state":"2130", "moved": "D"},...]
 * @param {string} State
 * @param {number} Columns
 * @param {number} Rows
 * @return {array} States Array of JSON objects consists of state & moved direction
 */
function possibleState(sState, nColumns, nRows) {
	var oPos      = new Position(nColumns, nRows);
	var aStates   = [];
	var nSpaceIdx = sState.indexOf(0);
	var nSpaceX   = oPos.x(nSpaceIdx);
	var nSpaceY   = oPos.y(nSpaceIdx);
	
	var nLeft  = nSpaceX -1;
	var nRight = nSpaceX +1;
	var nUp    = nSpaceY -1;
	var nDown  = nSpaceY +1;
	
	/**
	 * swap position in state
	 * @param {number} Index1
	 * @param {number} Index2
	 * @return {string} NewState
	 */
	function swapPosition(nIndex1, nIndex2) {
		var sStr1 = sState.charAt(nIndex1);
		var sStr2 = sState.charAt(nIndex2);
		var aTmp = sState.split("");
		aTmp[nIndex1] = sStr2;
		aTmp[nIndex2] = sStr1;
		return aTmp.join("");
	}
	
	if (nLeft >= 0) {
		aStates.push(
			{
				"state": swapPosition(nSpaceIdx, oPos.index(nLeft, nSpaceY)),
				"moved": "L"
			}
		);
	}
	
	if (nRight < nColumns) {
		aStates.push(
			{
				"state": swapPosition(nSpaceIdx, oPos.index(nRight, nSpaceY)),
				"moved": "R"
			}
		);
	}
	
	if (nUp >= 0) {
		aStates.push(
			{
				"state": swapPosition(nSpaceIdx, oPos.index(nSpaceX, nUp)),
				"moved": "U"
			}
		);
	}
	
	if (nDown < nRows) {
		aStates.push(
			{
				"state": swapPosition(nSpaceIdx, oPos.index(nSpaceX, nDown)),
				"moved": "D"
			}
		);
	}
	
	return aStates;
}

/**
 * md5
 * returns md5 hex string
 * @param {sting} String
 * @return {string} md5 digest
 */
function md5(sString) {
	return crypto.createHash("md5").update(sString).digest("hex");
}

/**
 * Position
 * @class Position
 * @param {number} Columns of problem
 * @param {number} Rows of problem
 * @return {function}
 */
function Position(nColumns, nRows) {
	return {
		/**
		 * x
		 * returns position x
		 * @method x
		 * @param {number} Index
		 * @return {number} X position
		 */
		x: function(nIndex) {
			return nIndex % nColumns;
		},
		/**
		 * y
		 * returns position y
		 * @method y
		 * @param {number} Index
		 * @return {number} X position
		 */
		y: function(nIndex) {
			return Math.floor(nIndex / nColumns);
		},
		/**
		 * index
		 * returns index for 1 dim array from poistion x, y
		 * @method index
		 * @param {number} X
		 * @param {number} Y
		 * @return {number} Index
		 */
		index: function(nX, nY) {
			return nColumns * nY + nX;
		}
	};
}



