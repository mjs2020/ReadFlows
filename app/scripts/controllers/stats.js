define(['angular', 'lodash', 'd3', 'dcjs', 'crossfilter'], function (angular, _, d3, dc, crossfilter) {
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
      if(!$cookies.lastUpdate && !Pocketdata.getDemo()) {
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

      // Create DC charts
      var addedChart = dc.lineChart('#addedChart', 'readsGroup'),
          readChart = dc.lineChart('#readChart', 'readsGroup'),
          favoritesChart = dc.pieChart('#favoritesChart', 'readsGroup'),
          domainsChart = dc.bubbleChart('#domainsChart', 'readsGroup');

      // Scope reset functions
      $scope.addedChartReset = function () {
        addedChart.filterAll();
        dc.redrawAll();
      }
      $scope.readChartReset = function () {
        readChart.filterAll();
        dc.redrawAll();
      }
      $scope.favouritesChartReset = function () {
        favoritesChart.filterAll();
        dc.redrawAll();
      }
      $scope.domainsChartReset = function () {
        domainsChart.filterAll();
        dc.redrawAll();
      }

      // Crossfilter stuff here
      var cfData = crossfilter(data),
          cfAll = cfData.groupAll(),
          favDimension = cfData.dimension(function (d) {
            return d.favorite = 1 ? "Favorites" : "All";
          }),
          favGroup = favDimension.group();

      // Setup the favourites pie chart
      favoritesChart
        .width(250)
        .height(250)
        .radius(120)
        .dimension(favDimension)
        .group(favGroup)
        .transitionDuration(500)
        .colors(['#3182bd', '#6baed6'])
        .label(function (d) {
            return d.key;
        })

        // Render charts
        dc.renderAll();
    });
});
