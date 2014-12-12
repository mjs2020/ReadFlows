var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    // Removed "Spec" naming from files
    if (/Spec\.js$/.test(file)) {
      tests.push(file);
    }
  }
}

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/app/scripts',

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
    modernizr: '../../bower_components/modernizr/modernizr',
    moment: '../../bower_components/momentjs/moment',
    jquery: '../../bower_components/jquery/dist/jquery',
    'jquery-cookie': '../../bower_components/jquery-cookie/jquery.cookie',
    'jquery-mousewheel': '../../bower_components/jquery-mousewheel/jquery.mousewheel',
    d3: '../../bower_components/d3/d3',
    'd3-tip': '../../bower_components/d3-tip/index',
    data: 'data',
    'pocket-api': 'pocket-api',
    oauthpopup: 'oauthpopup',
    momentjs: '../../bower_components/momentjs/moment',
    'requirejs-text': '../../bower_components/requirejs-text/text'
  },

    shim: {
        'angular' : {'exports' : 'angular'},
        'angular-route': ['angular'],
        'angular-cookies': ['angular'],
        'angular-sanitize': ['angular'],
        'angular-resource': ['angular'],
        'angular-animate': ['angular'],
        'angular-touch': ['angular'],
        'angular-mocks': {
          deps:['angular'],
          'exports':'angular.mock'
        }
    },

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});
