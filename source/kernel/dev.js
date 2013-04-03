(function () {
	"use strict";

	//*@protected
	/**
		When available, supply a high-precision, high performance
		monotonic benchmark for some internal usage and benchmark testing.
	*/
	enyo.bench = (function () {
		// we have to check whether or not the browser has supplied a valid
		// method to use
		var perf = window.performance || {};
		// test against all known vendor-specific implementations, but use
		// a fallback just in case
		perf.now = perf.now || perf.mozNow || perf.msNow || perf.oNow || perf.webkitNow || enyo.now;
		// while we do supply the fallback, it forces a warning to indicate it
		// should not be trusted
		if (perf.now === enyo.now) {
			return function () {
				enyo.warn(
					"Performance benchmarking requested but was not available, " +
					"the tests using the method cause considerable overhead, thus " +
					"skewing the results."
				);
				return perf.now();
			};
		// otherwise, we now have a pointer to the performant benchmark method
		} else {
			return function () {return perf.now();};
		}
	}());

	//*@protected
	/**
		This is a collection of methods to assist in simple benchmarking.
		The goal was to supply useful functionality while impacting the results
		as little as possible (the more calculations we do during benchmarking,
		the greater the opportunity to skew results). This is particularly important
		when using potentially-nested benchmark series (i.e., benchmarking a method
		that executes other benchmarked methods).
	*/

	// Track the active tests
	var tests = {};
	// Track averages
	var averages = {};

	// Default report template string
	var report_template = "- - - - - - - - - - - - - - - - -\n" +
					"BENCHMARK REPORT (%.): %.\n" +
					"TOTAL TIME: %.\n" +
					"AVERAGE TIME: %.\n" +
					"NUMBER OF ENTRIES: %.\n" +
					"- - - - - - - - - - - - - - - - -\n";

	// Calculates average and basic statistics.
	var calc = function (numbers) {
		var total = 0;
		var number = numbers.length;
		var stats = {total: null, average: null, number: number};
		enyo.forEach(numbers, function (num) {total += num;});
		stats.total = total;
		stats.average = Math.abs(total/(number || 1));
		return stats;
	};

	enyo.dev = {

		enabled: true,

		bench: function (opts) {
			if (true !== this.enabled) {
				return false;
			}
			var options = opts || {name: enyo.uid("bench")};
			if (true === options.analyze) {
				return new Suite(options);
			}
			else {
				return new Benchmark(options);
			}
		},

		report: function (name) {
			var bench = averages[name] || tests[name];
			if (!bench) {
				return false;
			}
			if (bench.report && "function" === typeof bench.report) {
				return bench.report();
			} else {
				var stats = calc(bench);
				enyo.log(
					enyo.format(
						report_template,
						"averages",
						name,
						stats.total,
						stats.average,
						stats.number
					)
				);
			}
		},

		clear: function (name) {
			var source = tests[name]? tests: averages[name]? averages: null;
			if (!source) {
				return false;
			}
			if (source.complete) {
				source.complete();
			}
			if (source[name] instanceof Array) {
				source[name] = [];
			}
			else {
				delete source[name];
			}
			return true;
		}

	};

	function Benchmark (options) {
		enyo.mixin(this, options);
		if (true === this.average && !averages[this.name]) {
			averages[this.name] = [];
		}
		if (averages[this.name] && false !== this.average) {
			this._averaging = true;
		}
		if (true === this.autoStart) {
			this.start();
		}
	}

	function Suite (options) {
		enyo.mixin(this, options);
	}

	//*@protected
	Benchmark.prototype = {

		// ...........................
		// PUBLIC PROPERTIES

		logging: true,
		autoStart: true,

		// ...........................
		// PROTECTED PROPERTIES

		_started: false,
		_averaging: false,
		_begin: null,
		_end: null,
		_time: null,

		// ...........................
		// PUBLIC METHODS

		start: function () {
			if (true === this._started) {
				return false;
			}
			this._log("starting benchmark");
			this._begin = enyo.bench();
			this._started = true;
			return true;
		},

		stop: function () {
			if (!this._started) {
				return false;
			}
			this._end = enyo.bench();
			this._time = this._end - this._begin;
			this._log("benchmark complete: " + this._time);
			if (true === this._averaging) {
				averages[this.name].push(this._time);
			}
			return !(this._started = false);
		},

		// ...........................
		// PROTECTED METHODS

		_log: function (message) {
			if (!this.logging) {
				return false;
			}
			enyo.log("bench (" + this.name + "): " + message);
		}

	};

	//*@protected
	Suite.prototype = {

		// ...........................
		// PUBLIC PROPERTIES

		logging: true,
		autoStart: true,

		// ...........................
		// PROTECTED PROPERTIES

		_started: false,
		_averaging: false,
		_begin: null,
		_end: null,
		_time: null,

		// ...........................
		// PUBLIC METHODS

		start: function () {
			if (true === this._started) {
				return false;
			}
			this._log("starting benchmark");
			this._begin = enyo.bench();
			this._started = true;
			return true;
		},

		stop: function () {
			if (!this._started) {
				return false;
			}
			this._end = enyo.bench();
			this._time = this._end - this._begin;
			this._log("benchmark complete: " + this._time);
			if (true === this._averaging) {
				averages[this.name].push(this._time);
			}
			return !(this._started = false);
		},

		// ...........................
		// PROTECTED METHODS

		_log: function (message) {
			if (!this.logging) {
				return false;
			}
			enyo.log("bench (" + this.name + "): " + message);
		}

	};

}());