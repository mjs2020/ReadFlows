// Credit: http://www.sitepoint.com/oauth-popup-window/
define(['jquery'], function($) {
  $.oauthpopup = function(options) {
      options.windowName = options.windowName ||  'ConnectWithOAuth'; // should not include space for IE
      options.windowOptions = options.windowOptions || 'location=0,status=0,width=430,height=700';
      options.callback = options.callback || function(){ window.location.reload(); };
      var that = this;
      // console.log(options.path);
      that._oauthWindow = window.open(options.path, options.windowName, options.windowOptions);
      that._oauthInterval = window.setInterval(function(){
          if (that._oauthWindow.closed) {
              window.clearInterval(that._oauthInterval);
              options.callback();
          }
      }, 500);
  };
});
