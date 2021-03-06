"Use Strict";

var prime = require('prime');
var FSModule = require('./FSModule');
var arr = {
	'forEach': require('prime/array/forEach')
};
var lev = require('levenshtein');

var LevenshteinFS = prime({

    inherits: FSModule,

    name: 'LevenshteinFS',
    options: {
        'maxDistanceTolerance': 3
    },

    search: function(term, haystack) {
        this.lastTerm = term;
        this.lastHaystack = haystack;

        var needleWords = term.split(' ');
        var haystackWords = haystack.split(' ');

        var matches = [];

        var nwl = needleWords.length;
        var hwl = haystackWords.length;
        for (var i = 0; i < nwl; i++) {
            for (var j = 0; j < hwl; j++) {
                var needleWord = needleWords[i];
                var haystackWord = haystackWords[j];

                var score = lev(needleWord, haystackWord);

                if (score <= this.options.maxDistanceTolerance) {
                    matches.push({'match': needleWord, 'score': score});
                }
            }
        }

        this.lastResults = matches;

        return this;
    },

    getPoints: function() {
        var haystackWords = this.lastHaystack.split(' ');

        var combinedScore = 0;
        arr.forEach(this.lastResults, function(result) {
            combinedScore += result.score;
        });

        combinedScore += (haystackWords.length - this.lastResults.length) * this.options.maxDistanceTolerance;

        var points = 50 / haystackWords.length * this.lastResults.length;
        points += 50 / (haystackWords.length * this.options.maxDistanceTolerance) * (haystackWords.length * this.options.maxDistanceTolerance - combinedScore);

        return points;
    }

});

module.exports = function(options) {return new LevenshteinFS(options);};