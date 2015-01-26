define(['angular'], function (angular) {
  'use strict';
  // For development only:
  var baseUrl = 'http://play.fm.to.it/ReadFlows/';

  // Oauthpopup
  var oauthpopup = function(options) {
    options.windowName = options.windowName ||  'ConnectWithOAuth'; // should not include space for IE
    options.windowOptions = options.windowOptions || 'location=0,status=0,width=430,height=700';
    options.callback = options.callback || function(){ window.location.reload(); };
    var _oauthWindow = window.open(options.path, options.windowName, options.windowOptions),
        _oauthInterval = window.setInterval(function(){
      if (_oauthWindow.closed) {
        window.clearInterval(_oauthInterval);
        options.callback();
      }
    }, 500);
  };

  /**
   * @ngdoc function
   * @name ReadFlowsApp.controller:MainCtrl
   * @description
   * # MainCtrl
   * Controller of the ReadFlowsApp
   */
  angular.module('ReadFlowsApp.controllers.MainCtrl', [])
  .controller('MainCtrl', function ($scope, $cookies, $location, Pocketdata) {
    $scope.errorMsgHide = true;
    var auth = false;

    // Check for db and svg support with modernizr
    if(!(Modernizr.websqldatabase || Modernizr.indexeddb) || !Modernizr.svg) {
      if(DEBUG) console.log('No svg support in browser!');
      $scope.errorMsgHide = false;
      $scope.errorMsg = 'Your browser does not support the required features to run this app.<br />Please try with a recent version of <a href="http://getfirefox.com" target="_blank">Firefox</a> or <a href="https://www.google.com/chrome/" target="_blank">Chrome</a>.';
      $scope.leadTxt = '';
      $scope.btnText = '';
      $('p.lead').hide();
      return;
    }

    // Check authentication status
    if($cookies.accessToken) {
      $scope.leadTxt = '';
      $scope.btnText = 'Go to your visualization';
      auth = true;
    } else {
      $scope.leadTxt = 'Start now.';
      $scope.btnText = 'Connect to your Pocket account';
      auth = false;
    }

    // Assign function to button
    $scope.go = function () {
      if (auth) {
        // go to #/login
        $location.path('/login');
      } else {
        // get request token and then prompt for authorization and finally proceed to #/login
        Pocketdata.getRequestToken(function (err, requestToken) {   // Get request token
          if (err) {
            $scope.errorMsgHide = false;
            $scope.errorMsg = 'There was a problem retrieving a requestToken from PocketAPI. Please try again later.';
            return;
          }
          oauthpopup({
            path: 'https://getpocket.com/auth/authorize?request_token='+requestToken+'&redirect_uri='+baseUrl+'callback.html',
            callback: function oauthCallback () {
              if(DEBUG) console.log('Popup closed, proceed to authenticating.');
              $location.path('/login');           // go to /login and get accessToken
              if(!$scope.$$phase) $scope.$apply()
            }
          });
        })
      }

    }
  });

});
