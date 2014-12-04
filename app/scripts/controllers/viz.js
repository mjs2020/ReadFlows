define(['angular', 'jquery', 'lodash', 'd3'], function (angular, $, _, d3) {
  'use strict';

  /**
   * @ngdoc function
   * @name pocketvizApp.controller:VizCtrl
   * @description
   * # VizCtrl
   * Controller of the pocketvizApp
   */
  angular.module('pocketvizApp.controllers.VizCtrl', [])
  .controller('VizCtrl', function ($scope) {

    // Get the data to visualize
    var readsList = _.toArray(JSON.parse(localStorage.getItem('pocketviz.readsList')));

    // Find the range of time from the first timestamp to the last timestamp in the dataset
    var startTimestamp = d3.min(readsList, function (d) {
          return d.time_updated;
        }),
        endTimestamp = d3.max(readsList, function (d) {
          return d.time_updated;
        }),
        startTime = new Date(startTimestamp*1000),
        endTime   = new Date(endTimestamp*1000),
        longestRead = d3.max(readsList, function (d) {
          return (parseInt(d.word_count) ? parseInt(d.word_count) : 0);
        }),
        shortestRead = d3.min(readsList, function (d) {
          return (parseInt(d.word_count) ? parseInt(d.word_count) : 0);
        });

    // Create #svgCanvas for the visualization
    // The width is calculated as number of days to visualize * 5px per day
    var margin = {top: 30, right: 10, bottom: 30, left: 10},
        svgWidth = Math.floor((endTimestamp - startTimestamp)/(60*60*24))*5,
        svgHeight = 600,
        graphWidth = svgWidth - margin.right - margin.left,
        graphHeight = svgHeight - margin.top - margin.bottom,
        pocketviz = d3.select("#graph")
                      .append("svg")
                      .attr('id', 'svgCanvas')
                      .attr('width', svgWidth)
                      .attr('height', svgHeight)
                      .attr('viewbox', '0 0 '+svgWidth+' '+svgHeight)
                      .attr('preserveAspectRatio', 'xMinYMin');

    // Assign behaviour in case of window resize (for responsiveness) and size the canvas for starts
    var aspect = svgWidth / svgHeight,
        svgCanvas = $("#svgCanvas"),
        resizeCanvas = function () {
          var targetHeight = $('#graph').height();
          svgCanvas.attr("width", (targetHeight-10) * aspect);
          svgCanvas.attr("height", targetHeight-10);
        };
    $(window).on("resize", resizeCanvas);
    resizeCanvas();


    // DEBUG
    console.log('readsList: ');
    console.log(readsList);
    console.log('number of articles in list: '+readsList.length);
    console.log('total number of words :'+_.reduce(readsList, function (m, n) {
      if (parseInt(n.word_count)) {
        return m+parseInt(n.word_count);
      } else {
        return m;
      }
    }, 0));
    console.log('startTimestamp value is: '+startTimestamp);
    console.log('endTimestamp value is: '+endTimestamp);
    console.log('startTime value is: '+startTime);
    console.log('endTime value is: '+endTime);
    console.log('longestRead is: '+longestRead);
    console.log('shortestRead is: '+shortestRead);

    // Create a xScale() function
    var xScale = d3.time.scale.utc()
                        .range([0, graphWidth-margin.left-margin.right])
                        .domain([startTime, endTime]),
        yScale = d3.scale.linear()
                         .range([0, graphHeight/2])
                         .domain([shortestRead, longestRead]);

    // Create the xAxis and draw them
    var xAxis = d3.svg.axis()
                      .scale(xScale)
                      .ticks(d3.time.month.utc, 1),
        addedAxisMonth = pocketviz.append("g")
                                  .attr('id', 'addedAxisMonth')
                                  .attr("class", "axis")
                                  .attr('transform', 'translate('+margin.left+','+margin.top+')')
                                  .call(xAxis.orient('top')
                                            .tickFormat(d3.time.format('%b'))
                                       ),
        readAxisMonth = pocketviz.append("g")
                                 .attr('id', 'readAxisMonth')
                                 .attr("class", "axis")
                                 .attr('transform', 'translate('+margin.left+','+graphHeight+')')
                                 .call(xAxis.orient('bottom')
                                            .tickFormat(d3.time.format('%b'))
                                      );
    // TODO create axises for year and day

    // Plot added data
    var dataPlots = pocketviz.append("g")
                             .attr('id', 'dataPlots')
                             .attr('transform', 'translate('+margin.left+',0)')
                             .selectAll('rect')
                             .data(readsList)
                             .enter()
                             .append('g')
                               .attr('class', 'readblock')
                               .attr('id', function (d) {
                                 return d.item_id
                               })
                               .attr('transform', function (d) {
                                 var date = new Date(d.time_added*1000),
                                     pos = xScale(date),
                                     topMargin = margin.top;
                                 return 'translate('+pos+','+topMargin+')'
                               })
                             .append('rect')
                               .attr("x", 0)
                               .attr("y", 0)
                               .attr("width", 5)
                               .attr("height", function (d) {
                                 return (parseInt(d.word_count) ? yScale(parseInt(d.word_count)) : 10)
                               });






  });
});
