define(['angular', 'pocket-api'], function (angular, pocket) {
  'use strict';

  /**
   * @ngdoc function
   * @name pocketvizApp.controller:LoginCtrl
   * @description
   * # LoginCtrl
   * Controller of the pocketvizApp
   */
  angular.module('pocketvizApp.controllers.LoginCtrl', [])
  .controller('LoginCtrl', function ($scope) {
    var requestToken = $.cookie('requestToken'),
        accessToken = $.cookie('accessToken');

    $scope.message = 'Authorizing you with Pocket...';

    // Check authentication status
    if(!requestToken && !accessToken) {               // If there is no requestToken and no accessToken
      $scope.message = 'You need to authenticate with Pocket first. Redirecting back home...';
      window.location.hash = "/";                     // go back to /
      return;
    }

    if(requestToken && !accessToken) {                // if there is a requestToken but no accessToken
      // then get access token
      pocket.getAccessToken(requestToken, function (err, response) {
        // TODO handle error
        $scope.message = 'Loading read list...';
        if(DEBUG) console.log('Retrieved and using accessToken: '+response.access_token);
        pocket.getReadsList(response.access_token, function (err) {
          // TODO handle error
          window.location.hash = "/viz";
        });
      });
    }

    if (accessToken) {                                // If we have an accessToken already
      $scope.message = 'Loading read list...';
      console.log('Using existing accessToken: '+accessToken);
      pocket.getReadsList(accessToken, function (err) {
        // TODO handle error
        window.location.hash = "/viz";
      });
    }

  });
});
