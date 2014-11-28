define([''], function() {

  var pocket = {
    config : {
      pocketUrl: {
        request : "https://getpocket.com/v3/oauth/request",
        authorize : 'https://getpocket.com/v3/oauth/authorize',
        get: 'https://getpocket.com/v3/get',
        add: 'https://getpocket.com/v3/add',
        modify: 'https://getpocket.com/v3/send'
      },
      headers: {
          "content-type": "application/x-www-form-urlencoded",
          "X-Accept": "application/json"
      }
    },


    getRequestToken : function(callback) {
      $.ajax({
        url: 'http://play.fm.to.it/ReadsViz/getToken.php',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
          callback(null, response);
        },
        error: function (xhr, status) {
          callback(status, null);
        }
      });
    },



  };

  return pocket;
});
