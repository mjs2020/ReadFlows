define(['angular', 'jquery', 'moment', 'lodash', 'simple-statistics', 'd3', 'data'], function (angular, $, moment, _, ss, d3, data) {
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

    // Get the data to visualize do some pre-processing
    var stats = {
          adds : {
            maxPerDay: 0
          },
          reads : {
            maxPerDay: 0
          },
          words : {
            maxAddedPerDay : 0,
            maxReadPerDay : 0
          },
          totalWords : 0,
          longestRead : 0,
          shortestRead : 0,
          startTimestamp : moment().unix(),
          endTimestamp : 0,
          daysAddedCounter : {},
          daysReadCounter : {}
        },
        readsList = _.chain(JSON.parse(localStorage.getItem('pocketviz.readsList')))
                     .toArray()
                     .sortBy(readsList, function (d) {
                       return _.parseInt(d.time_added);
                     })
                     .map(function (d, i, l) {
                       // Round timestamps to the day
                       d.day_added = moment(_.parseInt(d.time_added)*1000).hours(0).minutes(0).seconds(0).unix();
                       d.day_updated = moment(_.parseInt(d.time_updated)*1000).hours(0).minutes(0).seconds(0).unix();
                       d.day_read = moment(_.parseInt(d.time_read)*1000).hours(0).minutes(0).seconds(0).unix();
                       d.dayAddedId = moment(d.time_added*1000).format('YYMMDD');
                       d.dayReadId = moment(d.time_read*1000).format('YYMMDD');

                       // Add data to stats object
                       stats.startTimestamp = Math.min(stats.startTimestamp, d.day_updated);
                       stats.endTimestamp = Math.max(stats.endTimestamp, d.day_updated);
                       // Init counter for day if this is the first item
                       if (!stats.daysAddedCounter[d.dayAddedId]) stats.daysAddedCounter[d.dayAddedId] = {counter : 0, words : 0};
                       if (!stats.daysReadCounter[d.dayReadId]) stats.daysReadCounter[d.dayReadId] = {counter : 0, words : 0};
                       // Add offsets (words already in the day)
                       d.addedWordOffset = stats.daysAddedCounter[d.dayAddedId].words;
                       d.readWordOffset = stats.daysReadCounter[d.dayReadId].words;
                       // Add all other stats
                       stats.daysAddedCounter[d.dayAddedId].counter += 1;
                       stats.daysReadCounter[d.dayReadId].counter += 1;
                       stats.daysAddedCounter[d.dayAddedId].words += (_.parseInt(d.word_count) ? _.parseInt(d.word_count) : 0);
                       stats.daysReadCounter[d.dayReadId].words += (_.parseInt(d.word_count) ? _.parseInt(d.word_count) : 0);
                       stats.adds.maxPerDay = Math.max(stats.adds.maxPerDay, stats.daysAddedCounter[d.dayAddedId].counter);
                       stats.words.maxAddedPerDay = Math.max(stats.words.maxAddedPerDay, stats.daysAddedCounter[d.dayAddedId].words);
                       stats.reads.maxPerDay = Math.max(stats.reads.maxPerDay, stats.daysReadCounter[d.dayReadId].counter);
                       stats.words.maxReadPerDay = Math.max(stats.words.maxReadPerDay, stats.daysReadCounter[d.dayReadId].words);
                       stats.totalWords += (_.parseInt(d.word_count) ? _.parseInt(d.word_count) : 0);
                       stats.longestRead = Math.max(stats.longestRead, (_.parseInt(d.word_count) ? _.parseInt(d.word_count) : 0));
                       stats.shortestRead = Math.min(stats.shortestRead, (_.parseInt(d.word_count) ? _.parseInt(d.word_count) : 0));

                       // Return the updated object
                       return d;
                     })
                     .value();

    // Do some statistics and filter out any outliers (basically batch additions for users who converted from readitlater to pocket)
    stats.daysDataset = _.map(stats.daysAddedCounter, function (d, k, o) {
                          return d.counter;
                        });
    stats.q3 = ss.quantile(stats.daysDataset, 0.75);
    stats.iqr = ss.iqr(stats.daysDataset);
    stats.k = 10;                             // Configurable parameter to remove outliers which distort the distribution
    stats.threshold = stats.q3 + stats.k * (stats.iqr);
    stats.excludeDays = [];
    _.each(stats.daysAddedCounter, function (d, k, o) {
      if (d.counter > stats.threshold) stats.excludeDays.push(k);
    });
    // Iterate through readsList and remove any reads that have dayAddedId matching any value in stats.excludeDays
    readsList = _.filter(readsList, function (d, k, o) {
      return _.contains(stats.excludeDays,d.dayAddedId);
    });


    // Find the range of time from the first timestamp to the last timestamp in the dataset
    stats.startTime = new Date(stats.startTimestamp*1000),
    stats.endTime   = new Date(stats.endTimestamp*1000);

    //------------------------------------------------------------------
    // Create #svgCanvas for the visualization
    // The width is calculated as number of days to visualize * 5px per day
    var margin = {top: 20, right: 50, bottom: 20, left: 10},
        svgWidth = Math.floor((stats.endTimestamp - stats.startTimestamp)/(60*60*24))*5,
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
    if(DEBUG) {
      console.log('readsList: ');
      console.log(readsList);
      console.log('stats: ');
      console.log(stats);
    }

    // Create a xScale() and yScale() functions
    var xScale = d3.time.scale.utc()
                        .range([0, graphWidth-margin.left-margin.right])
                        .domain([stats.startTime, stats.endTime])
                        .nice(),
        yScale = d3.scale.linear()
                         .range([0, (graphHeight-50)/2])
                         .domain([0, stats.words.maxReadPerDay]);

    // Create the xAxis and draw them
    var xAxis = d3.svg.axis()
                      .scale(xScale),
        addedAxisYear = pocketviz.append("g")
                                  .attr('id', 'addedAxisYear')
                                  .attr("class", "axis")
                                  .attr('transform', 'translate('+margin.left+','+(margin.top+25)+')')
                                  .call(xAxis.orient('top')
                                             .ticks(d3.time.year.utc, 1)
                                             .tickFormat(d3.time.format('%Y'))
                                             .innerTickSize(25)
                                       )
                                  .selectAll('text')
                                  .attr('y', -17)
                                  .attr('x', 5)
                                  .attr('style', 'text-anchor: left'),
        addedAxisMonth = pocketviz.append("g")
                                  .attr('id', 'addedAxisMonth')
                                  .attr("class", "axis")
                                  .attr('transform', 'translate('+margin.left+','+(margin.top+25)+')')
                                  .call(xAxis.orient('top')
                                             .ticks(d3.time.month.utc, 1)
                                             .tickFormat(d3.time.format('%b'))
                                             .innerTickSize(16)
                                       )
                                  .selectAll('text')
                                  .attr('y', -7)
                                  .attr('x', 5)
                                  .attr('style', 'text-anchor: left'),
        addedAxisDay = pocketviz.append("g")
                                  .attr('id', 'addedAxisDay')
                                  .attr("class", "axis")
                                  .attr('transform', 'translate('+margin.left+','+(margin.top+25)+')')
                                  .call(xAxis.orient('top')
                                             .ticks(d3.time.day.utc, 1)
                                             .tickFormat(d3.time.format(''))
                                             .innerTickSize(5)
                                       )
                                  .selectAll('text')
                                  .remove(),
        readAxisYear = pocketviz.append("g")
                                 .attr('id', 'readAxisYear')
                                 .attr("class", "axis")
                                 .attr('transform', 'translate('+margin.left+','+(graphHeight-margin.bottom)+')')
                                 .call(xAxis.orient('bottom')
                                            .ticks(d3.time.year.utc, 1)
                                            .tickFormat(d3.time.format('%Y'))
                                            .innerTickSize(25)
                                      )
                                 .selectAll('text')
                                 .attr('y', 17)
                                 .attr('x', 5)
                                 .attr('style', 'text-anchor: left'),
        readAxisMonth = pocketviz.append("g")
                                 .attr('id', 'readAxisMonth')
                                 .attr("class", "axis")
                                 .attr('transform', 'translate('+margin.left+','+(graphHeight-margin.bottom)+')')
                                 .call(xAxis.orient('bottom')
                                            .ticks(d3.time.month.utc, 1)
                                            .tickFormat(d3.time.format('%b'))
                                            .innerTickSize(16)
                                      )
                                 .selectAll('text')
                                 .attr('y', 7)
                                 .attr('x', 5)
                                 .attr('style', 'text-anchor: left'),
        readAxisDay = pocketviz.append("g")
                                 .attr('id', 'readAxisDay')
                                 .attr("class", "axis")
                                 .attr('transform', 'translate('+margin.left+','+(graphHeight-margin.bottom)+')')
                                 .call(xAxis.orient('bottom')
                                            .ticks(d3.time.day.utc, 1)
                                            .tickFormat(d3.time.format(''))
                                            .innerTickSize(5)
                                      )
                                 .selectAll('text')
                                 .remove();

    // TODO Add boxes to highlight adds and reads together with text


    // Plot added data

    // TODO Draw bg rectangles and text

    // Pre-process data to calculate positions for drawing
    readsList = _.map(readsList, function (d) {
      if (d.time_read == 0) {

      } else {

      }
      d.points = {             // calculate values
                   'addedRect': {
                     x: 0,
                     y: 0,
                     w: 5,
                     h: 0
                   },
                   'readRect': {
                     x: 0,
                     y: 0,
                     w: 5,
                     h: 0
                   },
                   'p1': {
                     x: 0,
                     y: 0
                   },
                   'p2': {
                     cx1: 0,
                     cy1: 0,
                     cx2: 0,
                     cy2: 0,
                     x: 0,
                     y: 0
                   },
                   'p3': {
                     x: 0,
                     y: 0
                   },
                   'p4': {
                     cx1: 0,
                     cy1: 0,
                     cx2: 0,
                     cy2: 0,
                     x: 0,
                     y: 0
                   }
                 }
      return d;
    });

    // Draw the data
    var dataPlots = pocketviz.append("g")
                             .attr('id', 'dataPlots')
                             .attr('transform', 'translate('+margin.left+',0)')
                             .selectAll('g')
                             .data(readsList)
                             .enter()
                             .append('g')
                               .attr('class', 'readblock')
                               .attr('id', function (d) {
                                 return d.item_id;
                               });
    dataPlots.append('path')
             .attr('class', 'wave')
             .attr("d", function (d) {    // the d3 line function does not help in this case so we generate the d attr directly here
               var dStr = '';
               // build the string
               dStr += 'M ' + d.points.p1.x   + ',' + d.points.p1.y   + ' ';
               dStr += 'C ' + d.points.p2.cx1 + ',' + d.points.p2.cy1 + ' ' + d.points.p2.cx2 + ',' + d.points.p2.cy2 + ' ' + d.points.p2.x + ',' + d.points.p2.y + ' ';
               dStr += 'L ' + d.points.p3.x   + ',' + d.points.p3.y   + ' ';
               dStr += 'C ' + d.points.p4.cx1 + ',' + d.points.p4.cy1 + ' ' + d.points.p4.cx2 + ',' + d.points.p4.cy2 + ' ' + d.points.p4.x + ',' + d.points.p4.y + ' ';
               dStr += 'z';
               return dStr;
             });
    dataPlots.append('rect')
             .attr('class', 'added')
             .attr('x', function (d) { return d.points.addedRect.x })
             .attr('y', function (d) { return d.points.addedRect.y })
             .attr('width', function (d) { return d.points.addedRect.w })
             .attr('height', function (d) { return d.points.addedRect.h });
    dataPlots.insert('rect',':first-child')
             .attr('class', 'read')
             .attr('x', function (d) { return d.points.addedRect.x })
             .attr('y', function (d) { return d.points.addedRect.y })
             .attr('width', function (d) { return d.points.addedRect.w })
             .attr('height', function (d) { return d.points.addedRect.h });



  });
});
