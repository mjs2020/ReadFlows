define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc function
   * @name pocketvizApp.controller:AboutCtrl
   * @description
   * # AboutCtrl
   * Controller of the pocketvizApp
   */
  angular.module('pocketvizApp.controllers.AboutCtrl', [])
    .controller('AboutCtrl', function ($scope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    });
});
