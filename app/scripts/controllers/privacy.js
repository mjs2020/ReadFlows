define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc function
   * @name pocketvizApp.controller:PrivacyCtrl
   * @description
   * # PrivacyCtrl
   * Controller of the pocketvizApp
   */
  angular.module('pocketvizApp.controllers.PrivacyCtrl', [])
    .controller('PrivacyCtrl', function ($scope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    });
});
