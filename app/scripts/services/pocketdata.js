define(['angular', 'pouchdb', 'lodash'], function (angular, PouchDB, _) {
  'use strict';

  /**
   * @ngdoc service
   * @name ReadFlowsApp.Pocketdata
   * @description
   * # Pocketdata
   * Service in the ReadFlowsApp.
   */
  angular.module('ReadFlowsApp.services.Pocketdata', [])
  .service('Pocketdata', function ($http, $cookies, pouchdb) {

    // For development only (change to your URL if installing somewhere else):
    var baseUrl = 'http://play.fm.to.it/ReadFlows/'

    // Create or open the DB
    this.db = pouchdb.create('ReadFlows.readsdb');
    var DB = this.db;

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
           .success(function(data, status, headers, config) {
             $cookies.requestToken = data.code;
             callback(null, data.code)
           })
           .error(function(data, status, headers, config) {
             callback(status, null)
           })
    }

    this.getAccessToken = function(requestToken, callback) {
      $http.get(baseUrl+'proxy.php?a=getAccessToken&code='+requestToken)
           .success(function(data, status, headers, config) {
             $cookies.accessToken = data.access_token;
             callback(null, data.access_token)
           })
           .error(function(data, status, headers, config) {
             callback(status, null)
           })
    }

    this.getReadsList = function(accessToken, callback) {
      var url = baseUrl+'proxy.php?a=getReadsList&accessToken='+accessToken,
          state = {};

      DB.info()
        .then(function (response) {
          state.initial_items = response.doc_count;
          return DB.get('ReadFlows.lastUpdate');
        })
        .then(function (response) {                   // lasstUpdate is set so we udate the url with the since paramenter
          url = url+'&since='+response.timestamp;
          return $http.get(url);
        })
        .catch(function (error) {                     // lastUpdate is not set so we fetch the whole list by url
          return $http.get(url);
        })
        .then(function success (data, status, headers, config) {
          console.log(data);
          var readData = _.chain(data.list)
                          .toArray()
                          .map(function (v, k , c) {  // Add an _id property to each item
                            v._id = v.item_id;
                            return v;
                          })
                          .value();
          console.log('readData:');
          console.log(readData);
          state.added_items = readData.length;
          state.since = data.since;
          return DB.bulkDocs(readData, {              // Return promise with injection into pouchdb
            new_edits : true
          })
        }, function error (data, status, headers, config) {
          throw status;                               // If the http call failed throw an error
        })
        .then(function (result) {
          return DB.info();                           // get db info with new total
        })
        .then(function (result) {
          state.final_items = result.doc_count;
          return DB.get('ReadFlows.lastUpdate');
        })
        .then(function (result) {
          return DB.put({                             // lastUpdate exists so we update it with _rev
            timestamp: state.since
          }, 'ReadFlows.lastUpdate', result._rev);
        })
        .catch(function (err) {
          return DB.put({                             // lastUpdate does not exist so we create it
            timestamp: state.since
          }, 'ReadFlows.lastUpdate');
        })
        .then(function (result) {
          // If we got here data has been fetched and inserted into pouchdb and we can call the callback
          callback(null,state)
        })
        .catch(function (error) {
          // Something went wrong in the http request or in the db insertion
          callback(error, null);
        });
    }

    this.processData = function (callback) {
      //compute stats if necessary and then return them
    }

    this.getDemoList = function () {

    }

    this._setData = function (data) {

    }

    this._filterOutliers = function () {
      //
    }

  });
});
