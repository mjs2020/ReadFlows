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
  .service('Pocketdata', function ($http, $cookies, pouchDB) {

    // For development only (change to your URL if installing somewhere else):
    var baseUrl = 'http://play.fm.to.it/ReadFlows/'

    // Create or open the DB
    this.db = pouchDB('ReadFlows.readsdb');
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
          state.readData = data.data.list;
          state.added_items = state.readData.length;
          state.since = data.data.since;
          return DB.allDocs()                         // Return promise to read current DB so that in the next step we can merge the two
        }, function error (data, status, headers, config) {
          if(DEBUG) console.log('There was an error in the HTTP request to get data.');
          throw status;                               // If the http call failed throw an error
        })
        .then(function (dbItems) {
          state.readData = _.chain(state.readData)    // We process the retrived data adding _id and _rev attributes getting the _rev from the DB
                          .toArray()
                          .map(function (apiDoc, k , c) {
                            // Check if we already had the document in the DB
                            var dbDoc = _.find(dbItems.rows, function (dbItem, i, c1) {
                              if (typeof dbItem.item_id != 'undefined' && typeof apiDoc.item_id != 'undefined') return dbItem.item_id == apiDoc.item_id;
                              return false;
                            })
                            // and if we do then get the _id and _rev into the
                            if (typeof dbDoc != 'undefined') {
                              apiDoc._id = dbDoc._id;
                              apiDoc._rev = dbDoc._rev;
                            }
                            return apiDoc;
                          })
                          .value();
          return DB.bulkDocs(state.readData)          // Return promise with injection into pouchdb
        })
        .then(function (err, result) {
          if(DEBUG) console.log('Getting DB info with new total');
          return DB.info();                           // get db info with new total
        })
        .then(function (result) {
          state.final_items = result.doc_count;
          if(DEBUG) console.log('Getting ReadFlows.lastUpdate');
          return DB.get('ReadFlows.lastUpdate');
        })
        .then(function (result) {
          if(DEBUG) console.log('Updating ReadFlows.lastUpdate');
          return DB.put({                             // lastUpdate exists so we update it with _rev
            timestamp: state.since
          }, 'ReadFlows.lastUpdate', result._rev);
        })
        .catch(function (err) {
          console.log(err);
          if(DEBUG) console.log('Setting ReadFlows.lastUpdate which did not exist');
          return DB.put({                             // lastUpdate does not exist so we create it
            timestamp: state.since
          }, 'ReadFlows.lastUpdate');
        })
        .then(function (result) {
          if(DEBUG) console.log('Update should have completed correctly, returning to login process.');
          // If we got here data has been fetched and inserted into pouchdb and we can call the callback
          callback(null,state)
        })
        .catch(function (error) {
          // Something went wrong in the http request or in the db insertion
          if(DEBUG) console.log('Something went wrong in the http request or in the db insertion.');
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
