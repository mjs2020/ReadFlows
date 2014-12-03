define(['jquery', 'lodash', 'jquery-cookie'], function($, _) {

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
          console.log('ERR16 Failed to get requestToken');
          callback(status, null);
        }
      });
    },

    getAccessToken : function(requestToken, callback) {
      $.ajax({
        url: baseUrl+'proxy.php?a=getAccessToken&code='+requestToken,
        success: function (response) {
          $.removeCookie('requestToken');                                   // remove cookie requestToken
          $.cookie('accessToken', response.access_token, { expires: 30, path: '/' });    // set cookie accessToken
          callback(null, response);
        },
        error: function (xhr, status) {
          console.log('ERR31 Failed to get accessToken');
          callback(status, null);
        }
      });
    },

    getReadsList : function(accessToken, callback) {
      var url = baseUrl+'proxy.php?a=getReadsList&accessToken='+accessToken,
          lastUpdate = localStorage.getItem('pocketviz.lastUpdate'),
          localData = JSON.parse(localStorage.getItem('pocketviz.readsList'));
      // If we already have data stored in localStorage just fetch updates by appending since parameter to the request
      if (lastUpdate) url = url+'&since='+lastUpdate;

      $.ajax({
        url: url,
        success: function (response) {
          if (lastUpdate) {
            localData = _.extend(localData, response.list);
            console.log('Fetched an update. '+_.size(response.list)+' new reads being added. New total number of items: '+_.size(localData));
            localData = JSON.stringify(localData);
          } else {
            localData = JSON.stringify(response.list);
            console.log('Fetched full reading list. '+_.size(response.list)+' reads stored.');
          }
          localStorage.setItem('pocketviz.readsList', localData);
          localStorage.setItem('pocketviz.lastUpdate', response.since);
          callback(null);
        },
        error: function (xhr, status) {
          // TODO handle error?
          console.log('ERR58 Failed to get list of reads');
          callback(status);
        }
      });
    },


  };

  return pocket;
});
