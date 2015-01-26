define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc function
   * @name ReadFlowsApp.controller:DemoCtrl
   * @description
   * # DemoCtrl
   * Controller of the ReadFlowsApp
   */
  angular.module('ReadFlowsApp.controllers.DemoCtrl', [])
    .controller('DemoCtrl', function ($scope, $cookies, $location, Pocketdata) {
      // check for data
      if (Pocketdata.getData().lenght > 0) {
        if (DEBUG) console.log('There was an error fetching data.');
      } else {
        Pocketdata.getDemoList(function (err) {
          if (DEBUG && err) console.log(err);
          if (DEBUG) console.log('Got demo data json.');
          Pocketdata.processData(function () {
            $location.path('/stats');
          });
        });
      }
    });
});
