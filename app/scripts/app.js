/*jshint unused: vars */
define(['angular', 'jquery', 'bootstrap', 'controllers/navbar', 'controllers/main', 'controllers/login', 'controllers/viz', 'controllers/stats', 'controllers/demo']/*deps*/, function (angular, $, bootstrap, NavbarCtrl, MainCtrl, LoginCtrl, VizCtrl, StatsCtrl, DemoCtrl)/*invoke*/ {
  'use strict';

  // General setup for app
  window.DEBUG = true;              // Change to false to avoid console logging.

  // Setup UI
  $('.mytooltip').tooltip()

  /**
   * @ngdoc overview
   * @name pocketvizApp
   * @description
   * # pocketvizApp
   *
   * Main module of the application.
   */
  return angular
  .module('pocketvizApp', [
    'pocketvizApp.controllers.MainCtrl',
    'pocketvizApp.controllers.NavbarCtrl',
    'pocketvizApp.controllers.LoginCtrl',
    'pocketvizApp.controllers.VizCtrl',
    'pocketvizApp.controllers.StatsCtrl',
    'pocketvizApp.controllers.DemoCtrl',
/*angJSDeps*/
    'ngCookies',
    'ngAria',
    'ngMessages',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ngAnimate',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
    .when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    })
    .when('/login', {
      templateUrl: 'views/login.html',
      controller: 'LoginCtrl'
    })
    .when('/viz', {
      templateUrl: 'views/viz.html',
      controller: 'VizCtrl'
    })
    .when('/stats', {
      templateUrl: 'views/viz.html',
      controller: 'VizCtrl'
    })
    .when('/demo', {
      templateUrl: 'views/viz.html',
      controller: 'VizCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
  });
});
