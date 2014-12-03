define(['jquery', 'jquery-cookie'], function($) {

  // For development only:
  var baseUrl = 'http://play.fm.to.it/pocketviz/';

  var pocket = {

    getRequestToken : function(callback) {
      $.ajax({
        url: baseUrl+'proxy.php?a=getRequestToken',
        success: function (response) {
          $.cookie('requestToken', response.code, { expires: 1, path: '/' });    // set cookie requestToken
          callback(null, response);
        },
        error: function (xhr, status) {
          console.log('Failed to get requestToken');
          callback(status, null);
        }
      });
    },

    getAccessToken : function(requestToken, callback) {
      $.ajax({
        url: baseUrl+'proxy.php?a=getAccessToken&code='+requestToken,
        success: function (response) {
          $.removeCookie('requestToken');                                   // remove cookie requestToken
          $.cookie('accessToken', response, { expires: 30, path: '/' });    // set cookie accessToken
          callback(null, response);
        },
        error: function (xhr, status) {
          console.log('Failed to get accessToken');
          callback(status, null);
        }
      });
    },

    getReadsList : function(accessToken, callback) {
      var url = baseUrl+'proxy.php?a=getReadsList&accessToken='+accessToken;

      var readsData = JSON.parse(localStorage.getItem('readsData'));        // check what's in localStorage
      if (readsData) {                                                      // get the biggest timestamp in localstorage
        var lastTimestamp = readsData.reduceRight(function (max, test, i, a) {
          // TODO check naming of time_added
          if (max < test.time_added) {
            return test.time_added;
          } else {
            return max;
          }
        }, 0)
        url = url+'&since='+lastTimestamp;                                  // append timestamp to url
      }

      $.ajax({
        url: url,
        success: function (response) {
          if (readsData) {
            localStorage.setItem('readsData', JSON.stringify(readsData.concat(response))) // concat and store
          } else {
            localStorage.setItem('readsData', JSON.stringify(response));      // store the result in localstorage
          }
          callback(null);
        },
        error: function (xhr, status) {
          console.log('Failed to get list of reads');
          callback(status);
        }
      });
    },


  };

  return pocket;
});
