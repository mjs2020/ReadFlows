define(['angular', 'jquery', 'bootstrap'], function (angular, $, _bootstrap) {
  'use strict';

  /**
   * @ngdoc function
   * @name pocketvizApp.controller:NavbarCtrl
   * @description
   * # NavbarCtrl
   * Controller of the pocketvizApp
   */
  angular.module('pocketvizApp.controllers.NavbarCtrl', [])
  .controller('NavbarCtrl', function ($scope) {
    $('#navbarModal').modal({
      keyboard: false,
      show: false
    });
    $scope.openModal = function (modal) {
      $scope.modalTitle = "This is a title";
      $scope.modalBody = modal;
      console.log(modal);
      $('#navbarModal').modal('show')
    };
  });
});
