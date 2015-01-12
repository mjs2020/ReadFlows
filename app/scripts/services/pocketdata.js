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
          callback(null, state)
        })

        .catch(function (error) {                     // Something went wrong in the http request or in the db insertion
          if(DEBUG) console.log('Something went wrong in the http request or in the db insertion.');
          callback(error, null);
        });

    }

    this.processData = function (data, callback) {
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
