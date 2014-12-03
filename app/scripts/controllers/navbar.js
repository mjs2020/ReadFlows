define(['angular', 'jquery', 'bootstrap', 'text!/views/about.html', 'text!/views/credits.html', 'text!/views/privacy.html'], function (angular, $, _bootstrap, aboutTxt, creditsTxt, privacyTxt) {
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
      $scope.modalTitle = modal;
      switch(modal) {
        case 'about':
          $scope.modalBody = aboutTxt;
          break;
        case 'credits':
          $scope.modalBody = creditsTxt;
          break;
        case 'privacy':
          $scope.modalBody = privacyTxt;
          break;
      }
      $('#navbarModal').modal('show')
    };
  });
});
