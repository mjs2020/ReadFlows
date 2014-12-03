/*jshint unused: vars */
define([
  'angular',
  'controllers/navbar',
  'controllers/main',
  'controllers/login',
  'controllers/viz'
], function (
       angular,
        NavbarCtrl,
        MainCtrl,
        LoginCtrl,
        VizCtrl
       ) {
  'use strict';

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
    .otherwise({
      redirectTo: '/'
    });
  });
});
