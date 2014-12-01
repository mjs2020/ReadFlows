define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc function
   * @name pocketvizApp.controller:CreditsCtrl
   * @description
   * # CreditsCtrl
   * Controller of the pocketvizApp
   */
  angular.module('pocketvizApp.controllers.CreditsCtrl', [])
    .controller('CreditsCtrl', function ($scope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    });
});
