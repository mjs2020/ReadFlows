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
    'text': '../../bower_components/requirejs-text/text',
    'bootstrap': '../../bower_components/bootstrap/dist/js/bootstrap',
    'd3': '../../bower_components/d3/d3',
    'lodash': '../../bower_components/lodash/dist/lodash.compat',
    'jquery': '../../bower_components/jquery/dist/jquery',
    'jquery-cookie': '../../bower_components/jquery-cookie/jquery.cookie',
    'pocket-api': 'pocket-api',
    'oauthpopup': 'oauthpopup',
    'moment' : '../../bower_components/momentjs/moment',
    'modernizr': '../../bower_components/modernizr/modernizr',
    'requirejs-text': '../../bower_components/requirejs-text/text'
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
  'angular-messages'
], function(angular, app, ngRoutes, ngCookies, ngSanitize, ngResource, ngAnimate, ngTouch, ngAria, ngMessages) {
  'use strict';

  /* jshint ignore:start */
  var $html = angular.element(document.getElementsByTagName('html')[0]);
  /* jshint ignore:end */

  angular.element(document).ready(function() {
    angular.resumeBootstrap([app.name]);
  });
});
