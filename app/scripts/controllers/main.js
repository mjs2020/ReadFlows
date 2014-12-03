define(['angular', 'pocket-api', 'jquery', 'jquery-cookie', 'oauthpopup'], function (angular, pocket, $) {
  'use strict';

  /**
   * @ngdoc function
   * @name pocketvizApp.controller:MainCtrl
   * @description
   * # MainCtrl
   * Controller of the pocketvizApp
   */
  angular.module('pocketvizApp.controllers.MainCtrl', [])
  .controller('MainCtrl', function ($scope) {
    // Check authentication status
    if($.cookie('requestToken')) {
      window.location.hash = "/login";                // go to /login and get accessToken
      return;
    }
    if ($.cookie('accessToken')) {
      window.location.hash = "/viz";                  // go to /viz and get accessToken
      return;
    }

    // Assign function to button
    $scope.startAuth = function () {
      pocket.getRequestToken(function (err, data) {  // Get request token
        // TODO handle error
        var requestToken = data.code;
        $.oauthpopup({
          path: 'https://getpocket.com/auth/authorize?request_token='+requestToken+'&redirect_uri=http://play.fm.to.it/ReadsViz/close.html',
          callback: function oauthCallback () {
            console.log('Popup closed, proceed to authenticating.');
            window.location.hash = "/login";          // go to /login and get accessToken
          }
        });
      })
    }
  });
});
