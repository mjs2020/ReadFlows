define(['angular', 'lodash', 'd3', 'crossfilter', 'dc'], function (angular, _, d3, crossfilter, dc) {
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

      // Add stats to scope in order to display them
      $scope.stats = stats;

      // Crossfilter stuff here
      var cfData = crossfilter(data),
          monthYear = d3.time.format("%b %Y"),
          getDateAdded = function (d) {
                           return new Date(d.day_added*1000);
                         },
          getDateRead = function (d) {
                           return d.day_read ? new Date(d.day_read*1000) : null;
                         },
          addedDomainRange = d3.time.month.range(d3.time.month.offset(d3.min(data, getDateAdded), -1), d3.max(data, getDateAdded)).map(function (d) {
            return monthYear(d);
          }),
          readDomainRange = d3.time.month.range(d3.time.month.offset(d3.min(data, getDateAdded), -1), d3.max(data, getDateAdded)).map(function (d) {
            return monthYear(d);
          });
      $scope.xDateScaleAdded = d3.scale.ordinal()
                                 .domain(addedDomainRange);
      $scope.xDateScaleRead = d3.scale.ordinal()
                                .domain(readDomainRange);
      $scope.resetAll = function(){
        dc.filterAll();
        dc.redrawAll();
      }

      // CHARTS
      // Added by date
      $scope.addedDateDimension = cfData.dimension(function (d) {
        return monthYear(new Date(d.day_added*1000));
      });
      $scope.addedDateGroup = $scope.addedDateDimension.group();
      $scope.addedDatePostSetupChart = function(c) {
        c.xAxisLabel('Months');
        c.yAxisLabel('Num of articles');
        c.xUnits(dc.units.ordinal)
        c.margins({ top: 10, left: 60, right: 10, bottom: 80 })
        c.outerPadding(1)
        c.renderlet(function(chart){
          chart.selectAll("g.x text")
            .attr('transform', "rotate(-65) translate(-28, -8)");
        });
      }

      // Read by date
      $scope.readDateDimension = cfData.dimension(function (d) {
        return d.day_read ? monthYear(new Date(d.day_read*1000)) : null;
      });
      $scope.readDateDimension.filter(function(date) {
        return date != null;
      });
      $scope.readDateGroup = $scope.readDateDimension.group();
      $scope.readDatePostSetupChart = function (c) {
        c.xAxisLabel('Months');
        c.yAxisLabel('Num of articles');
        c.xUnits(dc.units.ordinal)
        c.margins({ top: 10, left: 60, right: 10, bottom: 80 })
        c.outerPadding(1)
        c.renderlet(function(chart){
          chart.selectAll("g.x text")
            .attr('transform', "rotate(-65) translate(-28, -8)");
        });
      }

      // Fav pie chart
      $scope.favDimension = cfData.dimension(function (d) {
        return d.favorite != "0" ? "Favorites" : "All";
      });
      $scope.favGroup = $scope.favDimension.group();

      // Read pie chart
      $scope.readDimension = cfData.dimension(function (d) {
        return d.status != "0" ? "Read" : "Unread";
      });
      $scope.readGroup = $scope.readDimension.group();

      // Domains row charts
      $scope.domainsDimension = cfData.dimension(function (d) {
        return d.domain;
      });
      $scope.domainsByNumberGroup = $scope.domainsDimension.group().reduceCount();
      $scope.domainsByLengthGroup = $scope.domainsDimension.group().reduceSum(function (d) {
        return _.parseInt(d.word_count);
      });
      $scope.domainsOrdering = function(d){return -d.value}





    });
});
