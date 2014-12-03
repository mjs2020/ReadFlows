define(['angular', 'pocket-api', 'jquery', 'jquery-cookie', 'oauthpopup'], function (angular, pocket, $) {
  'use strict';
  // For development only:
  var baseUrl = 'http://play.fm.to.it/pocketviz/';

  /**
   * @ngdoc function
   * @name pocketvizApp.controller:MainCtrl
   * @description
   * # MainCtrl
   * Controller of the pocketvizApp
   */
  angular.module('pocketvizApp.controllers.MainCtrl', [])
  .controller('MainCtrl', function ($scope) {
    // Check for localstorage support with modernizr
    if(!Modernizr.localstorage) {
      // emit alert
      console.log('No localstorage support in browser!');
    }

    // Check authentication status
    if($.cookie('requestToken') || $.cookie('accessToken')) {
      window.location.hash = "/login";                 // go to /login and get accessToken or readsList
      return;
    }

    // Assign function to button
    $scope.startAuth = function () {
      pocket.getRequestToken(function (err, data) {   // Get request token
        // TODO handle error
        var requestToken = data.code;
        $.oauthpopup({
          path: 'https://getpocket.com/auth/authorize?request_token='+requestToken+'&redirect_uri='+baseUrl+'callback.html',
          callback: function oauthCallback () {
            console.log('Popup closed, proceed to authenticating.');
            window.location.hash = "/login";          // go to /login and get accessToken
          }
        });
      })
    }
  });
});
