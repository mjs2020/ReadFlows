define(['angular', 'pouchdb', 'lodash', 'moment', 'simple-statistics'], function (angular, PouchDB, _, moment, ss) {
  'use strict';

  /**
   * @ngdoc service
   * @name ReadFlowsApp.Pocketdata
   * @description
   * # Pocketdata
   * Service in the ReadFlowsApp.
   */
  angular.module('ReadFlowsApp.services.Pocketdata', [])
  .service('Pocketdata', function ($http, $cookies, pouchDB) {

    // For development only (change to your URL if installing somewhere else):
    var baseUrl = 'http://play.fm.to.it/ReadFlows/'

    // Create or open the DB
    var DB    = pouchDB('ReadFlows.readsdb'),
        data  = [],
        stats = {};

    this.getData = function(){
      return data;
    }

    this.getStats = function(){
      return stats;
    }

    // API Methods
    this.hasData = function (callback) {
      DB.info()
        .then(function (info) {
          info.doc_count > 0 ? callback(true) : callback(false);
        })
        .catch(function (err) {
          if(DEBUG) console.log('Error while trying to get info on the db');
          callback(false);
        })
    }

    this.getRequestToken = function(callback) {
      $http.get(baseUrl+'proxy.php?a=getRequestToken')
           .success(function(response, status, headers, config) {
             $cookies.requestToken = response.code;
             callback(null, response.code)
           })
           .error(function(response, status, headers, config) {
             callback(status, null)
           })
    }

    this.getAccessToken = function(requestToken, callback) {
      $http.get(baseUrl+'proxy.php?a=getAccessToken&code='+requestToken)
           .success(function(response, status, headers, config) {
             $cookies.accessToken = response.access_token;
             callback(null, response.access_token)
           })
           .error(function(response, status, headers, config) {
             callback(status, null)
           })
    }

    this.getReadsList = function(accessToken, callback) {
      if(typeof accessToken === 'undefined') callback('Undefined accessToken');

      var url = baseUrl+'proxy.php?a=getReadsList&accessToken='+accessToken,
          state = {};

      if(DEBUG) console.log('Initiated get read list procedure');

      DB.allDocs({include_docs: true})

        .then(function (response) {                  // Set up state and make http call
          state.initialCount = response.total_rows-1;
          state.dbDocs = response.rows;
          if(DEBUG) console.log('Number of documents in the local DB before update: '+state.initialCount);

          state.lastUpdate = _.find(state.dbDocs, function (v, i, c) {
            return v.id == 'ReadFlows.lastUpdate'
          })
          state.lastUpdate = state.lastUpdate.doc;

          if (state.lastUpdate.timestamp) url = url+'&since='+state.lastUpdate.timestamp;
          if(DEBUG && state.lastUpdate.timestamp) console.log('There was no lastUpdate stored so we are fetching all documents from PocketAPI');
          if(DEBUG && state.lastUpdate.timestamp) console.log('lastUpdate was set to '+state.lastUpdate.timestamp+' so we will fetch any new documents since then.');
          if(DEBUG) console.log('Going to call: '+url);
          return $http.get(url);
        })

        .then(function success (response) {               // Process http response and prepare db insert
          state.newData = _.toArray(response.data.list);
          state.addedItems = state.newData.length;
          state.since = response.data.since;
          if(DEBUG) console.log('Data was received from the PocketAPI through the proxy. '+state.addedItems+' items were received.');

          // Add _id and _rev to all the newData items before injecting them so that existing docs update correctly.
          state.newData = _.map(state.newData, function (apiDoc, k , c) {
                            var dbDoc = _.find(state.dbDocs, function (dbItem, k1, c1) {
                              if (typeof dbItem.doc.item_id != 'undefined' && typeof apiDoc.item_id != 'undefined') return dbItem.doc.item_id == apiDoc.item_id;
                              return false;
                            })
                            // and if we do then get the _id and _rev into the document for addition
                            if (typeof dbDoc != 'undefined') {
                              apiDoc._id = dbDoc.doc._id;
                              apiDoc._rev = dbDoc.doc._rev;
                            } else {                 // If it's a new doc then set it's _id anyhow
                              apiDoc._id = apiDoc.item_id;
                            }
                            return apiDoc;
                          });
          return DB.bulkDocs(state.newData);          // Return promise with injection into pouchdb
        }, function error (response) {
          if(DEBUG) console.log('There was an error in the HTTP request to get data.');
          throw response.status;                               // If the http call failed throw an error
        })

        .then(function (response) {              // Save lastUpdate value
          if (state.lastUpdate._rev) {
            if(DEBUG) console.log('Insert succeeded. Saving lastUpdate value with new revision.');
            return DB.put({ timestamp: state.since }, 'ReadFlows.lastUpdate', state.lastUpdate._rev);
          } else {
            if(DEBUG) console.log('Insert succeeded. Saving lastUpdate value.');
            return DB.put({ timestamp: state.since }, 'ReadFlows.lastUpdate');
          }
        })

        .then(function (response) {              // Get final DB list
          if(DEBUG) console.log('lastUpdate saved. Getting final DB element list.');
          return DB.allDocs({include_docs: true})
        })

        .then(function (response) {              // Final post processing and return
          state.dbDocs = _.map(response.rows, function (v, i, c) {
            return v.doc;
          });
          state.finalCount = response.total_rows-1;
          if(DEBUG) console.log('Number of documents in the local DB after update: '+state.finalCount);
          state.lastUpdate = _.find(state.dbDocs, function (v, i, c) {
            return v._id == 'ReadFlows.lastUpdate'
          })
          state.lastUpdate = state.lastUpdate.timestamp;
          delete state.newData;
          delete state.since;

          data = state.dbDocs;
          callback(null, state)
        })

        .catch(function (error) {                     // Something went wrong in the http request or in the db insertion
          if(DEBUG) console.log('Something went wrong in the http request or in the db insertion.');
          callback(error, null);
        });

    }

    this.processData = function (callback) {

      this._computeStats();
      this._filterOutliers();

      callback()
    }

    this.getDemoList = function () {

    }

    this._computeStats = function () {
      this.stats = {                        // Init stats on running of the processData method
        adds : {
          maxPerDay: 0
        },
        reads : {
          maxPerDay: 0
        },
        words : {
          maxAddedPerDay : 0,
          maxReadPerDay : 0,
          averageLength : 0,
          modeLength : 0
        },
        totalWords : 0,
        longestRead : 0,
        shortestRead : 0,
        startTimestamp : moment().unix(),
        endTimestamp : 0,
        daysAddedCounter : {},
        daysReadCounter : {},
        wordLengths: []
      };
      this.readsList = _.map(data, function (d, i, l) {
        // Round timestamps to the day
        d.day_added = moment(_.parseInt(d.time_added)*1000).hours(0).minutes(0).seconds(0).unix();
        d.day_updated = moment(_.parseInt(d.time_updated)*1000).hours(0).minutes(0).seconds(0).unix();
        d.day_read = (d.time_read != "0") ? moment(_.parseInt(d.time_read)*1000).hours(0).minutes(0).seconds(0).unix() : false;
        d.dayAddedId = moment(d.day_added*1000).format('YYMMDD');
        d.dayReadId = d.day_read ? moment(d.day_read*1000).format('YYMMDD') : false;

        // Add some more detail
        var r = /:\/\/(.[^/]+)/
        if (d.resolved_url) d.domain = d.resolved_url.match(r)[1];

        // Add data to stats object
        this.stats.startTimestamp = Math.min(this.stats.startTimestamp, d.day_updated);
        this.stats.endTimestamp = Math.max(this.stats.endTimestamp, d.day_updated);
        // Init counter for day if this is the first item
        if (!this.stats.daysAddedCounter[d.dayAddedId]) this.stats.daysAddedCounter[d.dayAddedId] = {counter : 0, words : 0};
        if (d.dayReadId && !this.stats.daysReadCounter[d.dayReadId]) this.stats.daysReadCounter[d.dayReadId] = {counter : 0, words : 0};
        // Add offsets (words already in the day)
        d.addedWordOffset = this.stats.daysAddedCounter[d.dayAddedId].words;
        d.readWordOffset = d.dayReadId ? this.stats.daysReadCounter[d.dayReadId].words : 0;
        d.addedCountOffset = this.stats.daysAddedCounter[d.dayAddedId].counter;
        d.readCountOffset = d.dayReadId ? this.stats.daysReadCounter[d.dayReadId].counter : 0;
        // Add all other stats
        this.stats.daysAddedCounter[d.dayAddedId].counter += 1;
        if (d.dayReadId) this.stats.daysReadCounter[d.dayReadId].counter += 1;
        this.stats.daysAddedCounter[d.dayAddedId].words += (_.parseInt(d.word_count) ? _.parseInt(d.word_count) : 0);
        if (d.dayReadId) this.stats.daysReadCounter[d.dayReadId].words += (_.parseInt(d.word_count) ? _.parseInt(d.word_count) : 0);
        this.stats.adds.maxPerDay = Math.max(this.stats.adds.maxPerDay, this.stats.daysAddedCounter[d.dayAddedId].counter);
        this.stats.words.maxAddedPerDay = Math.max(this.stats.words.maxAddedPerDay, this.stats.daysAddedCounter[d.dayAddedId].words);
        if (d.dayReadId) this.stats.reads.maxPerDay = Math.max(this.stats.reads.maxPerDay, this.stats.daysReadCounter[d.dayReadId].counter);
        if (d.dayReadId) this.stats.words.maxReadPerDay = Math.max(this.stats.words.maxReadPerDay, this.stats.daysReadCounter[d.dayReadId].words);
        this.stats.totalWords += (_.parseInt(d.word_count) ? _.parseInt(d.word_count) : 0);
        this.stats.longestRead = Math.max(this.stats.longestRead, (_.parseInt(d.word_count) ? _.parseInt(d.word_count) : 0));
        this.stats.shortestRead = Math.min(this.stats.shortestRead, (_.parseInt(d.word_count) ? _.parseInt(d.word_count) : 0));
        if (_.parseInt(d.word_count)) this.stats.wordLengths.push(_.parseInt(d.word_count));

        // Return the updated object
        return d;
      }, this);

      // Find the range of time from the first timestamp to the last timestamp in the dataset
      this.stats.startTime = new Date(this.stats.startTimestamp*1000);
      this.stats.endTime   = new Date(this.stats.endTimestamp*1000);

      // Compute word length stats
      this.stats.words.averageLength = ss.mean(this.stats.wordLengths);
      this.stats.words.modeLength = ss.mode(this.stats.wordLengths);

      stats = this.stats;
    }

    this._filterOutliers = function () {
      this.stats = stats;

      // Do some statistics and filter out any outliers (basically batch additions for users who converted from readitlater to pocket)
      this.stats.daysDataset = _.map(this.stats.daysAddedCounter, function (d, k, o) {
        return d.counter;
      });
      this.stats.q3 = ss.quantile(this.stats.daysDataset, 0.75);
      this.stats.iqr = ss.iqr(this.stats.daysDataset);
      this.stats.k = 10;                             // Configurable parameter to remove outliers which distort the distribution
      this.stats.threshold = this.stats.q3 + this.stats.k * (this.stats.iqr);

      // Now that we have the threshold find which days need to be excluded
      this.stats.excludeDays = [];
      _.each(this.stats.daysAddedCounter, function (d, k, o) {
        if (d.counter > this.stats.threshold) this.stats.excludeDays.push(k);
      },this);
      if (this.stats.excludeDays.length > 0) {
        // Iterate through data and remove any reads that have dayAddedId matching any value in stats.excludeDays
        data = _.filter(data, function (d, k, o) {
          return !_.contains(this.stats.excludeDays,d.dayAddedId);
        },this);
        // Then recompute stats
        this._computeStats();
      }
    }


    /*
     * Do NLP
     * Best option probably is:
     *  https://github.com/wooorm/retext-keywords
     *  and https://github.com/wooorm/retext
     *
     * Alternatives:
     *  https://github.com/kimchouard/keyword-extract
     *  https://github.com/michaeldelorenzo/keyword-extractor
     *  https://github.com/harthur/glossary
     * Or browserify
     *  https://www.npmjs.org/package/gramophone
     * */
  });
});
