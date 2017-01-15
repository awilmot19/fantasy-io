var inputJSON, oppJSON, outputJSON;
var year = '2016';
var week = '7';
var upcomingWeek = '8';

$(document).ready(function() {
  getMatchupPlayers('def');
  // getAllPlayers('7', 'RB');
  //getOpps('8', 'RB');
  // updatePlayers(inputJSON, oppJSON, outputJSON, 'RB');
  //updateDefRanks(upcomingWeek);
  getScoringLeaders('def');
});

function updateDefRanks(weekChosen) {
  $.ajax({
    type: 'GET',
    url: 'http://api.fantasy.nfl.com/v1/players/stats?statType=seasonStats&season=2016&week=' + weekChosen + '&position=DEF&format=json',
    async: false,
    success: function(data) {
      var defenceTeams = data["players"];
      defenceTeams.sort(function(a, b) {
        a["stats"]["1"] = Number(a["stats"]["1"] || 0);
        b["stats"]["1"] = Number(b["stats"]["1"] || 0);
        return (b["seasonPts"])/(b["stats"]["1"]) - (a["seasonPts"])/(a["stats"]["1"]);
      });
      var defJSON = outputJSON;
      var currentTeam;
      $.each(defJSON, function(i, team) {
        for (var i = 0; i < defenceTeams.length; i++) {
          if (defenceTeams[i]["name"] === team["name"]) {
            currentTeam = defenceTeams[i];
            team["rank"] = ordinateNum(i+1);
            console.log(team["name"] + ", " + team["rank"]);
          }
        }
      });
      var url = 'data:text/json;charset=utf8,' + encodeURIComponent(JSON.stringify(defJSON));
      window.open(url, '_blank');
      window.focus();
    },
    error: function() {
      console.log("Nah bra");
    }
  });
}

function getMatchupPlayers(position) {
  $.ajax({
    type: 'GET',
    url: '/assets/json/' + position + '.json',
    async: false,
    success: function(data) {
      outputJSON = data;
    },
    error: function() {
      console.log("This is butt");
    }
  });
}

function getAllPlayers(weekChosen, position) {
  $.ajax({
    type: 'GET',
    url: 'http://api.fantasy.nfl.com/v1/players/stats?statType=seasonStats&season=2016&week=' + weekChosen + '&position=' + position + '&format=json',
    async: false,
    success: function(data) {
      inputJSON = data;
      console.log("It works");
    },
    error: function() {
      console.log("Nah bra");
    }
  });
}

function getOpps(chosenWeek, position) {
  $.ajax({
    type: 'GET',
    url: 'http://api.fantasy.nfl.com/v1/players/scoringleaders?season=2016&week=' + chosenWeek + '&position=' + position + '&sort=projectedPts&count=100&format=json',
    //url: 'http://api.fantasy.nfl.com/v1/players/scoringleaders?season=2016&week=8&position=QB&sort=projectedPts&count=30&format=json',
    async: false,
    success: function(data) {
      oppJSON = data;
    },
    error: function() {
      console.log("Nah bra");
    }
  });
}


// 45. Defence Sacks
// 46. Interceptions
// 47. Fumble Recoveries
// 49. Safeties
// 50. Recovery TD
// 53. Return TD
// 54. Pts VS

qbStatLoc = ["5", "14"];
rbStatLoc = ["14", "21"];
wrStatLoc = ["21", "20"];
teStatLoc = ["21", "20"];
defStatLoc = ["45", "99"];

function updatePlayers(inJSON, opponents, outJSON, position) {
  //console.log(inJSON, outJSON);
  var statLoc;
  switch(position) {
    case 'QB':
      statLoc = qbStatLoc;
      break;
    case 'RB':
      statLoc = rbStatLoc;
      break;
    case 'WR':
      statLoc = wrStatLoc;
      break;
    case 'TE':
      statLoc = teStatLoc;
      break;
    case 'DEF':
      statLoc = defStatLoc;
      break;
    default:
      statLoc = rbStatLoc;
      break;
  }
  var allPlayers = inJSON["players"];
  var outPlayer, inPlayer;
  var QBdata = [];
  var opponentList = opponents["positions"][position];
  //console.log(allPlayers);
  $.each(outJSON, function(i, player) {
    //console.log(player);
    for (var i = 0; i < allPlayers.length; i++) {
      if (allPlayers[i]["name"] === player["name"]) {
        outPlayer = player;
        inPlayer = allPlayers[i]["stats"];
        outPlayer["gamesPlayed"] = inPlayer["1"];
        outPlayer["stats"][0]["statVal"] = ((inPlayer[statLoc[0]])/(inPlayer["1"])).toFixed(1);
        outPlayer["stats"][1]["statVal"] = ((inPlayer[statLoc[1]])/(inPlayer["1"])).toFixed(1);
        if (statLoc[0] === "45") {
          outPlayer["stats"][1]["statVal"] = ((addValues(inPlayer["46"], inPlayer["47"]))/(inPlayer["1"])).toFixed(1);
          outPlayer["stats"][2]["statVal"] = ((addValues(inPlayer["50"], inPlayer["53"]))/(inPlayer["1"])).toFixed(1);
        }
        else if (statLoc[0] === '5') {
          outPlayer["stats"][2]["statVal"] = addValues(inPlayer["6"], inPlayer["15"]) + "/" + addValues(inPlayer["7"], inPlayer["30"]);
        }
        else {
          outPlayer["stats"][2]["statVal"] = ((addValues(inPlayer["15"], inPlayer["22"]))/(inPlayer["1"])).toFixed(1);
        }
        outPlayer["stats"][4]["statVal"] = (addValues(allPlayers[i]["seasonPts"], inPlayer["20"])/(inPlayer["1"])).toFixed(2);
        if (position === 'K') {
          outPlayer["stats"][0]["statVal"] = (addValues(addValues(inPlayer["35"], inPlayer["36"]), inPlayer["37"])/(inPlayer["1"])).toFixed(1);
          outPlayer["stats"][1]["statVal"] = (addValues(inPlayer["38"], inPlayer["39"])/(inPlayer["1"])).toFixed(1);
          outPlayer["stats"][2]["statVal"] = (inPlayer["33"]/(inPlayer["1"])).toFixed(1);
          outPlayer["stats"][4]["statVal"] = (( (makeNumber(inPlayer["33"]) - makeNumber(inPlayer["34"])) + ((makeNumber(inPlayer["35"]) + makeNumber(inPlayer["36"]) + makeNumber(inPlayer["37"])) * 3) + (makeNumber(inPlayer["38"]) * 4) + (makeNumber(inPlayer["39"]) * 5) )/(inPlayer["1"])).toFixed(2);
        }
        //console.log(outPlayer);
        for (var j = 0; j < opponentList.length; j++) {
          if (allPlayers[i]["id"] === opponentList[j]["id"]) {
            outPlayer["stats"][5]["statVal"] = getOppImage(opponentList[j]["opponentTeamAbbr"]);
          }
        }
        QBdata.push(outPlayer);
      }
    }
  });
  var url = 'data:text/json;charset=utf8,' + encodeURIComponent(JSON.stringify(QBdata));
  window.open(url, '_blank');
  window.focus();
}

// 1. Games Played !!
// 2. Pass Attempts !!
// 3. Pass Completions !!
// 4. Pass Incompletions !!
// 5. Pass Yards !!
// 6. Passing Touchdowns !!
// 7. Interceptions !!
// 8. Sacks !!
// 13. Rush Attempts !!
// 14. Rush Yards !!
// 15. Rushing TDs !!
// 20. Receptions !!
// 21. Receiving Yards !!
// 22. Receiving TDs !!
// 30. Fumbles Lost !!
// 31. Fumbles !!
// 33. Extra Points Made
// 34. Extra Points Missed
// 35. FG 0-19
// 36. FG 20-29
// 37. FG 30-39
// 38. FG 40-49
// 39. FG 50+
// 45. Defence Sacks
// 46. Interceptions
// 47. Fumble Recoveries
// 49. Safeties
// 50. Recovery TD
// 53. Return TD
// 54. Pts VS


function getOppImage(oppAbbr) {
  if (oppAbbr[0] === '@') {
    oppAbbr = oppAbbr.substring(1, oppAbbr.length);
  }
  return "/images/teams/" + oppAbbr + ".png";
}

function makeNumber(a) {
  a = Number(a || 0);
  return a;
}

function addValues(a, b) {
  a = Number(a || 0);
  b = Number(b || 0);
  return a+b;
}

function subValues(a, b) {
  a = Number(a || 0);
  b = Number(b || 0);
  return a-b;
}

function multValues(a, b) {
  a = Number(a || 0);
  b = Number(b || 0);
  return a*b;
}

// var rwilson = {"id":"2532975","esbid":"WIL777781","gsisPlayerId":"00-0029263","name":"Russell Wilson","position":"QB","teamAbbr":"SEA","stats":{"1":"1","2":"37","3":"24","4":"13","5":"225","8":"1","13":"1","14":"-2","20":"1","21":"-1","31":"2","75":"1"},"seasonPts":81.56,"seasonProjectedPts":284.06,"weekPts":8.7,"weekProjectedPts":15.04}
//
// console.log(rwilson["name"]);
// var statTest = rwilson["stats"]["9"];
// if (statTest) {
//   console.log(statTest);
// }
// else {
//   console.log("0");
// }

// 1. Games Played !!
// 2. Pass Attempts !!
// 3. Pass Completions !!
// 4. Pass Incompletions !!
// 5. Pass Yards !!
// 6. Passing Touchdowns !!
// 7. Interceptions !!
// 8. Sacks !!
// 13. Rush Attempts !!
// 14. Rush Yards !!
// 15. Rushing TDs !!
// 20. Receptions !!
// 21. Receiving Yards !!
// 22. Receiving TDs !!
// 30. Fumbles Lost !!
// 31. Fumbles !!

var statLeaders;

function getScoringLeaders(position) {
  $.ajax({
    type: 'GET',
    url: '/assets/json/' + position + 'Stats.json',
    async: false,
    success: function(data) {
      statLeaders = data["players"];
      for (var r = 0; r < statLeaders.length; r++) {
        if (Number(statLeaders[r]["stats"]["1"]) < 3) {
          statLeaders.splice(r,1);
          r--;
        }
      }
      for (var statLoc = 0; statLoc < qbStatLoc.length; statLoc++) {
        statLeaders.sort(function(a, b) {
          a["stats"][qbStatLoc[statLoc]] = Number(a["stats"][qbStatLoc[statLoc]] || 0);
          b["stats"][qbStatLoc[statLoc]] = Number(b["stats"][qbStatLoc[statLoc]] || 0);
          return (b["stats"][qbStatLoc[statLoc]])/(b["stats"]["1"]) - (a["stats"][qbStatLoc[statLoc]])/(a["stats"]["1"]);
        });
        var i = 0;
        //console.log(outputJSON);
        $.each(statLeaders, function(i, player) {
          for (var j = 0; j < outputJSON.length; j++) {
            if (outputJSON[j]["name"] === player["name"]) {
              outputJSON[j]["stats"][statLoc]["rank"] = ordinateNum(i+1);
              console.log(outputJSON[j]["name"] + " " + outputJSON[j]["stats"][statLoc]["rank"]);
            }
          }
          i++;
        });
      }
      if (position === 'qb') {
        statLeaders.sort(function(a, b) {
          a["stats"]["6"] = Number(a["stats"]["6"] || 0);
          b["stats"]["6"] = Number(b["stats"]["6"] || 0);
          a["stats"]["7"] = Number(a["stats"]["7"] || 0);
          b["stats"]["7"] = Number(b["stats"]["7"] || 0);
          a["stats"]["15"] = Number(a["stats"]["15"] || 0);
          b["stats"]["15"] = Number(b["stats"]["15"] || 0);
          a["stats"]["30"] = Number(a["stats"]["30"] || 0);
          b["stats"]["30"] = Number(b["stats"]["30"] || 0);
          return (b["stats"]["6"] + b["stats"]["15"])/(b["stats"]["7"] + b["stats"]["30"]) - (a["stats"]["6"] + a["stats"]["15"])/(a["stats"]["7"] + a["stats"]["30"]);
        });
        i = 0;
        $.each(statLeaders, function(i, player) {
          //console.log(player["name"] + " " + (player["stats"]["6"] + player["stats"]["15"])/(player["stats"]["7"] + player["stats"]["30"]));
          for (var j = 0; j < outputJSON.length; j++) {
            if (outputJSON[j]["name"] === player["name"]) {
              outputJSON[j]["stats"]["2"]["rank"] = ordinateNum(i+1);
              console.log(outputJSON[j]["name"] + " " + outputJSON[j]["stats"][2]["rank"]);
            }
          }
          i++;
        });
      }
      statLeaders.sort(function(a, b) {
        a["seasonPts"] = Number(a["seasonPts"] || 0);
        b["seasonPts"] = Number(b["seasonPts"] || 0);
        return (b["seasonPts"])/(b["stats"]["1"]) - (a["seasonPts"])/(a["stats"]["1"]);
      });
      var i = 0;
      //console.log(outputJSON);
      $.each(statLeaders, function(i, player) {
        for (var j = 0; j < outputJSON.length; j++) {
          if (outputJSON[j]["name"] === player["name"]) {
            outputJSON[j]["stats"][4]["rank"] = ordinateNum(i+1);
            console.log(outputJSON[j]["name"] + " " + outputJSON[j]["stats"][4]["rank"]);
          }
        }
        i++;
      });
      var url = 'data:text/json;charset=utf8,' + encodeURIComponent(JSON.stringify(outputJSON));
      window.open(url, '_blank');
      window.focus();
    },
    error: function() {
      console.log("Nice try");
    }
  });
}

function ordinateNum(val) {
  if (val == 11 || val == 12 || val == 13) {
    return val.toString() + 'th';
  }
  else if ((val % 10) === 1) {
    return val.toString() + 'st';
  }
  else if ((val % 10) === 2) {
    return val.toString() + 'nd';
  }
  else if ((val % 10) === 3) {
    return val.toString() + 'rd';
  }
  else {
    return val.toString() + 'th';
  }
}
