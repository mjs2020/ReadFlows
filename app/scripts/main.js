/*jshint unused: vars */
require.config({
  paths: {
    angular: '../../bower_components/angular/angular',
    'angular-animate': '../../bower_components/angular-animate/angular-animate',
    'angular-aria': '../../bower_components/angular-aria/angular-aria',
    'angular-cookies': '../../bower_components/angular-cookies/angular-cookies',
    'angular-messages': '../../bower_components/angular-messages/angular-messages',
    'angular-mocks': '../../bower_components/angular-mocks/angular-mocks',
    'angular-resource': '../../bower_components/angular-resource/angular-resource',
    'angular-route': '../../bower_components/angular-route/angular-route',
    'angular-sanitize': '../../bower_components/angular-sanitize/angular-sanitize',
    'angular-scenario': '../../bower_components/angular-scenario/angular-scenario',
    'angular-touch': '../../bower_components/angular-touch/angular-touch',
    text: '../../bower_components/requirejs-text/text',
    bootstrap: '../../bower_components/bootstrap/dist/js/bootstrap',
    lodash: '../../bower_components/lodash/dist/lodash.compat',
    'simple-statistics': '../../bower_components/simple-statistics/src/simple_statistics',
    moment: '../../bower_components/momentjs/moment',
    jquery: '../../bower_components/jquery/dist/jquery',
    'jquery-mousewheel': '../../bower_components/jquery-mousewheel/jquery.mousewheel',
    d3: '../../bower_components/d3/d3',
    'd3-tip': '../../bower_components/d3-tip/index',
    momentjs: '../../bower_components/momentjs/moment',
    'requirejs-text': '../../bower_components/requirejs-text/text',
    pouchdb: '../../bower_components/pouchdb/dist/pouchdb',
    'angular-pouchdb': '../../bower_components/angular-pouchdb/dist/angular-pouchdb',
    modernizr: '../../bower_components/modernizr/modernizr',
    dc: '../../bower_components/dcjs/dc',
    crossfilter: '../../bower_components/crossfilter/crossfilter'
  },
  shim: {
    angular: {
      exports: 'angular'
    },
    'angular-route': [
      'angular'
    ],
    'angular-aria': [
      'angular'
    ],
    'angular-messages': [
      'angular'
    ],
    'angular-cookies': [
      'angular'
    ],
    'angular-sanitize': [
      'angular'
    ],
    'angular-resource': [
      'angular'
    ],
    'angular-animate': [
      'angular'
    ],
    'angular-touch': [
      'angular'
    ],
    'angular-mocks': {
      deps: [
        'angular'
      ],
      exports: 'angular.mock'
    },
    bootstrap: {
      deps: [
        'jquery'
      ]
    },
    'd3-tip': {
      deps: [
        'd3'
      ]
    },
    'simple-statistics': {
      exports: 'ss'
    },
    pouchdb: {
      exports: 'PouchDB'
    },
    'angular-pouchdb': {
      deps: [
        'angular',
        'pouchdb'
      ]
    }
  },
  priority: [
    'angular'
  ],
  packages: [

  ]
});

//http://code.angularjs.org/1.2.1/docs/guide/bootstrap#overview_deferred-bootstrap
window.name = 'NG_DEFER_BOOTSTRAP!';

require([
  'angular',
  'app',
  'angular-route',
  'angular-cookies',
  'angular-sanitize',
  'angular-resource',
  'angular-animate',
  'angular-touch',
  'angular-aria',
  'angular-messages',
  'angular-pouchdb',
  'pouchdb'
], function(angular, app, ngRoutes, ngCookies, ngSanitize, ngResource, ngAnimate, ngTouch, ngAria, ngMessages, pouchdb, PouchDB) {
  'use strict';

  /* jshint ignore:start */
  var $html = angular.element(document.getElementsByTagName('html')[0]);
  /* jshint ignore:end */

  angular.element(document).ready(function() {
    window.PouchDB = PouchDB;
    angular.resumeBootstrap([app.name]);
  });
});
