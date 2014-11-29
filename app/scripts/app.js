/*jshint unused: vars */
define(['angular']/*deps*/, function (angular)/*invoke*/ {
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
    .module('pocketvizApp', [/*angJSDeps*/
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
        .otherwise({
          redirectTo: '/'
        });
    });
});
