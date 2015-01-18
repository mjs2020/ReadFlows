define(['angular', 'lodash', 'd3', 'dc', 'crossfilter', 'd3-tip'], function (angular, _) {
  'use strict';

  /**
   * @ngdoc function
   * @name ReadFlowsApp.controller:StatsCtrl
   * @description
   * # StatsCtrl
   * Controller of the ReadFlowsApp
   */
  angular.module('ReadFlowsApp.controllers.StatsCtrl', [])
    .controller('StatsCtrl', function ($scope, $cookies, $location, Pocketdata) {

      // Check for lastUpdate. If not present then go to /login
      if(!$cookies.lastUpdate) {
        if(DEBUG) console.log('No update, go back to /login.');
        $location.path('/login');
        return;
      }

      // Get the data to visualize do some pre-processing
      var data = Pocketdata.getData(),
          stats = Pocketdata.getStats();

      // Check for data and stats initialization. If empty then go to /login
      if(_.isEmpty(data) || _.isEmpty(stats)) {
        if(DEBUG) console.log('Pocket data not initialized.');
        $location.path('/login');
        return;
      }

      // DEBUG
      if(DEBUG) {
        console.log('readsList: ');
        console.log(data);
        console.log('stats: ');
        console.log(stats);
      }

      $scope.stats = stats;

    });
});
