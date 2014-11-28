define([''], function() {

  var pocket = {

    getRequestToken : function(callback) {
      $.ajax({
        url: 'proxy.php?a=getRequestToken',
        success: function (response) {
          callback(null, response);
        },
        error: function (xhr, status) {
          callback(status, null);
        }
      });
    },

    getAccessToken : function(requestToken, callback) {
      $.ajax({
        url: 'proxy.php?a=getAccessToken&code='+requestToken,
        success: function (response) {
          callback(null, response);
        },
        error: function (xhr, status) {
          callback(status, null);
        }
      });
    },

    getReadsList : function(accessToken, callback) {
      $.ajax({
        url: 'proxy.php?a=getReadsList&accessToken='+accessToken,
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
