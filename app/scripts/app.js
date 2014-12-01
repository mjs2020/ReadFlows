/*jshint unused: vars */
define(['angular', 'controllers/main', 'controllers/about', 'controllers/credits', 'controllers/privacy']/*deps*/, function (angular, MainCtrl, AboutCtrl, CreditsCtrl, PrivacyCtrl)/*invoke*/ {
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
      'pocketvizApp.controllers.AboutCtrl',
      'pocketvizApp.controllers.CreditsCtrl',
      'pocketvizApp.controllers.PrivacyCtrl',
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
        .when('/about', {
          templateUrl: 'views/about.html',
          controller: 'AboutCtrl'
        })
        .when('/credits', {
          templateUrl: 'views/credits.html',
          controller: 'CreditsCtrl'
        })
        .when('/privacy', {
          templateUrl: 'views/privacy.html',
          controller: 'PrivacyCtrl'
        })
//        .otherwise({
//          redirectTo: '/'
//        });
    });
});
