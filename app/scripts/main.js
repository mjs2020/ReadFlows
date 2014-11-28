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
    if(err) {
      console.log('Failed to retrieve request token');
      $('#authBtn').removeClass('btn-primary').addClass('btn-danger').html('Error retriving request token')
    } else {
      var requestToken = data.code;
      $('#authBtn').click(function(evt){
        evt.preventDefault;
        $.oauthpopup({
            path: 'https://getpocket.com/auth/authorize?request_token='+requestToken+'&redirect_uri=http://play.fm.to.it/ReadsViz/close.html',
            callback: function() {
                console.log('User has authenticated');
                pocket.getAccessToken(requestToken, function(err, data2){
                  if(err) {

                  } else {
                    //data2.username is the username
                    //data2.access_token
                    console.log(data2);
                    pocket.getReadsList(data2.access_token, function(err, data3){
                      if (err) {

                      } else {
                        console.log(data3);
                      }
                    })
                  }
                });
            }
        });
      })
    }
  });
});
