'use strict';

// TODO: Find a better name for the viz
// TODO: Find an icon

require.config({
  baseUrl: 'scripts',
  paths: {
    'pocket-api': 'pocket-api',
    'oauthpopup': 'oauthpopup',
  }
});

require(['pocket-api', 'oauthpopup'], function(pocket){
  // Get a token and assign behaviour to button
  pocket.getRequestToken(function(err, data) {
    $('#authBtn').click(function(evt){
      evt.preventDefault;
      var token = data.code;
      console.log('Click!');
      $.oauthpopup({
          path: 'https://getpocket.com/auth/authorize?request_token='+data.code+'&redirect_uri=http://play.fm.to.it/ReadsViz/close.html',
          callback: function()
          {
              console.log('User has authenticated');
              //do callback stuff
          }
      });
      //window.open('https://getpocket.com/auth/authorize?request_token='+data.code+'&redirect_uri='+window.location, "popupWindow", "width=600,height=600,scrollbars=yes");
    })
  });
});
