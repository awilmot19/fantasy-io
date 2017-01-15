currentWeek = 8;

$(document).ready(function () {
  var defDatabase = [];

  for (var tempWeek = 1; tempWeek <= currentWeek; tempWeek++) {

    $.ajax({
      type: 'GET',
      url: 'http://api.fantasy.nfl.com/v1/players/stats?statType=weekStats&season=2016&week=' + tempWeek + '&position=DEF&format=json',
      async: false,
      success: function(data) {
        console.log(data["players"][0]["name"] + ", " + data["players"][0]["stats"])
      },
      error: function() {
        console.log("Nah bra");
      }
    });

  }

});
