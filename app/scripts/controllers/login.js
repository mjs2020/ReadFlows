define(['angular', 'jquery', 'moment'], function (angular, $, moment) {
  'use strict';

  /**
   * @ngdoc function
   * @name ReadFlowsApp.controller:LoginCtrl
   * @description
   * # LoginCtrl
   * Controller of the ReadFlowsApp
   */
  angular.module('ReadFlowsApp.controllers.LoginCtrl', [])
  .controller('LoginCtrl', function ($scope, $cookies, $location, Pocketdata) {

    // Init $scope stuff
    $scope.errorMsgHide = true;
    $scope.btnHide = true;
    $scope.steps = [];
    $scope.message = '';

    // Check for requestToken. If missing go back to the authentication.
    if(!$cookies.requestToken) {
      $scope.message = 'You need to authenticate with Pocket first. Redirecting back home...';
      $location.path('/');
      return;
    }

    // Create function to check for accessToken and get one if one is not available
    var checkAccessToken = function (callback) {
      if(!$cookies.accessToken) {
        $scope.message = 'Authorizing with Pocket';
        Pocketdata.getAccessToken($cookies.requestToken, function (err, response) {
          if (err) {
            if(DEBUG) console.log('Failed: '+response);
            $scope.errorMsgHide = false;
            $scope.errorMsg = 'There was a problem authorizing with Pocket. Please make sure you\'ve authorized this app in your settings.';
            $scope.message = 'Authorizing with pocket failed.';
            return;
          }
          callback();
        });
      } else {
        callback();
      }
    }

    // Check for accessToken
    checkAccessToken(function(){
      Pocketdata.hasData(function (state) {
        if ($scope.message) $scope.steps.push($scope.message);
        $scope.message = state ? 'Updating your latest reading data from Pocket.' : 'Retrieving your reading list from Pocket.';
        Pocketdata.getReadsList($cookies.accessToken, function (err, data) {
          if (err) {  // handle error
            if(DEBUG) console.log('Failed getting reading list: '+err);
            $scope.errorMsgHide = false;
            $scope.errorMsg = 'There was a problem loading data from Pocket.';
            $scope.message = 'Loading data from Pocket failed.';
            return;
          }
          $scope.steps.push($scope.message);
          $scope.steps.push('Some items were already stored locally in your browser. Updates were fetched from the Pocket API.');
          $scope.message = 'Processing your data...';
          Pocketdata.processData(function () {
            $scope.steps.push($scope.message);
            $scope.message = '';
            $scope.btnHide = false;
            $scope.btnText = 'Continue...'
            $scope.go = function () {
              $('#userMenu').removeClass('hidden');
              $location.path('/stats');
              if(!$scope.$$phase) $scope.$apply()
            }
            var countdown = 5,
                timeout = window.setInterval(function () {
                  countdown -= 1;
                  $scope.btnText = 'Continue... ('+countdown+')';
                  if (countdown <= 0) {
                    window.clearInterval(timeout);
                    $scope.go();
                  }
                }, 1000);
          });
        });
      });
    });
  });
});
