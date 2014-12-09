define(['jquery', 'moment', 'lodash', 'simple-statistics'], function($, moment, _, ss) {

  return {
    // properties
    readsList : [],
    stats : {},

    // TODO add callbacks to these methods

    // methods
    getData : function () {
      this.readsList = _.chain(JSON.parse(localStorage.getItem('pocketviz.readsList')))
                        .toArray()
                        .sortBy(function (d) {
                          return _.parseInt(d.time_added);
                        })
                        .filter(function (d) {
                          return (d.status != "2" && d.is_article == "1");
                        })
                        .value();
    },

    computeStats : function () {
      this.stats = {                        // Init stats on running of the commpute method
        adds : {
          maxPerDay: 0
        },
        reads : {
          maxPerDay: 0
        },
        words : {
          maxAddedPerDay : 0,
          maxReadPerDay : 0,
          averageLength : 0,
          modeLength : 0
        },
        totalWords : 0,
        longestRead : 0,
        shortestRead : 0,
        startTimestamp : moment().unix(),
        endTimestamp : 0,
        daysAddedCounter : {},
        daysReadCounter : {},
        wordLengths: []
      };
      this.readsList = _.map(this.readsList, function (d, i, l) {
        // Round timestamps to the day
        d.day_added = moment(_.parseInt(d.time_added)*1000).hours(0).minutes(0).seconds(0).unix();
        d.day_updated = moment(_.parseInt(d.time_updated)*1000).hours(0).minutes(0).seconds(0).unix();
        d.day_read = (d.time_read != "0") ? moment(_.parseInt(d.time_read)*1000).hours(0).minutes(0).seconds(0).unix() : false;
        d.dayAddedId = moment(d.day_added*1000).format('YYMMDD');
        d.dayReadId = d.day_read ? moment(d.day_read*1000).format('YYMMDD') : false;

        // Add some more detail
        var r = /:\/\/(.[^/]+)/
        d.domain = d.resolved_url.match(r)[1];

        // Add data to stats object
        this.stats.startTimestamp = Math.min(this.stats.startTimestamp, d.day_updated);
        this.stats.endTimestamp = Math.max(this.stats.endTimestamp, d.day_updated);
        // Init counter for day if this is the first item
        if (!this.stats.daysAddedCounter[d.dayAddedId]) this.stats.daysAddedCounter[d.dayAddedId] = {counter : 0, words : 0};
        if (d.dayReadId && !this.stats.daysReadCounter[d.dayReadId]) this.stats.daysReadCounter[d.dayReadId] = {counter : 0, words : 0};
        // Add offsets (words already in the day)
        d.addedWordOffset = this.stats.daysAddedCounter[d.dayAddedId].words;
        d.readWordOffset = d.dayReadId ? this.stats.daysReadCounter[d.dayReadId].words : 0;
        d.addedCountOffset = this.stats.daysAddedCounter[d.dayAddedId].counter;
        d.readCountOffset = d.dayReadId ? this.stats.daysReadCounter[d.dayReadId].counter : 0;
        // Add all other stats
        this.stats.daysAddedCounter[d.dayAddedId].counter += 1;
        if (d.dayReadId) this.stats.daysReadCounter[d.dayReadId].counter += 1;
        this.stats.daysAddedCounter[d.dayAddedId].words += (_.parseInt(d.word_count) ? _.parseInt(d.word_count) : 0);
        if (d.dayReadId) this.stats.daysReadCounter[d.dayReadId].words += (_.parseInt(d.word_count) ? _.parseInt(d.word_count) : 0);
        this.stats.adds.maxPerDay = Math.max(this.stats.adds.maxPerDay, this.stats.daysAddedCounter[d.dayAddedId].counter);
        this.stats.words.maxAddedPerDay = Math.max(this.stats.words.maxAddedPerDay, this.stats.daysAddedCounter[d.dayAddedId].words);
        if (d.dayReadId) this.stats.reads.maxPerDay = Math.max(this.stats.reads.maxPerDay, this.stats.daysReadCounter[d.dayReadId].counter);
        if (d.dayReadId) this.stats.words.maxReadPerDay = Math.max(this.stats.words.maxReadPerDay, this.stats.daysReadCounter[d.dayReadId].words);
        this.stats.totalWords += (_.parseInt(d.word_count) ? _.parseInt(d.word_count) : 0);
        this.stats.longestRead = Math.max(this.stats.longestRead, (_.parseInt(d.word_count) ? _.parseInt(d.word_count) : 0));
        this.stats.shortestRead = Math.min(this.stats.shortestRead, (_.parseInt(d.word_count) ? _.parseInt(d.word_count) : 0));
        if (_.parseInt(d.word_count)) this.stats.wordLengths.push(_.parseInt(d.word_count));

        // Return the updated object
        return d;
      }, this);
      // Find the range of time from the first timestamp to the last timestamp in the dataset
      this.stats.startTime = new Date(this.stats.startTimestamp*1000);
      this.stats.endTime   = new Date(this.stats.endTimestamp*1000);

      // Compute word length stats
      this.stats.words.averageLength = ss.mean(this.stats.wordLengths);
      this.stats.words.modeLength = ss.mode(this.stats.wordLengths);
    },

    filterOutliers : function () {
      // Do some statistics and filter out any outliers (basically batch additions for users who converted from readitlater to pocket)
      this.stats.daysDataset = _.map(this.stats.daysAddedCounter, function (d, k, o) {
        return d.counter;
      });
      this.stats.q3 = ss.quantile(this.stats.daysDataset, 0.75);
      this.stats.iqr = ss.iqr(this.stats.daysDataset);
      this.stats.k = 10;                             // Configurable parameter to remove outliers which distort the distribution
      this.stats.threshold = this.stats.q3 + this.stats.k * (this.stats.iqr);

      // Now that we have the threshold find which days need to be excluded
      this.stats.excludeDays = [];
      _.each(this.stats.daysAddedCounter, function (d, k, o) {
        if (d.counter > this.stats.threshold) this.stats.excludeDays.push(k);
      },this);
      if (this.stats.excludeDays.length > 0) {
        // Iterate through readsList and remove any reads that have dayAddedId matching any value in stats.excludeDays
        this.readsList = _.filter(this.readsList, function (d, k, o) {
          return !_.contains(this.stats.excludeDays,d.dayAddedId);
        },this);
        // Then recompute stats
        this.computeStats();
      }
    }

    /*
     * Do NLP
     * Best option probably is:
     *  https://github.com/wooorm/retext-keywords
     *  and https://github.com/wooorm/retext
     *
     * Alternatives:
     *  https://github.com/kimchouard/keyword-extract
     *  https://github.com/michaeldelorenzo/keyword-extractor
     *  https://github.com/harthur/glossary
     * Or browserify
     *  https://www.npmjs.org/package/gramophone
     * */

  }
});
