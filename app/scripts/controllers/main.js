define(['angular'], function (angular) {
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
      $scope.name = "francesco";
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    });
});
