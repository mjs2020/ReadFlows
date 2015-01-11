/*jshint unused: vars */
define(['angular', 'angular-mocks', 'app'], function(angular, mocks, app) {
  'use strict';

  describe('Service: Pocketdata', function () {

    // load the service's module
    beforeEach(module('pocketvizApp.services.Pocketdata'));

    // instantiate service
    var Pocketdata;
    beforeEach(inject(function (_Pocketdata_) {
      Pocketdata = _Pocketdata_;
    }));

    it('should do something', function () {
      expect(!!Pocketdata).toBe(true);
    });

  });
});
