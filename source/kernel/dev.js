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
		return function () {
			return perf.now();
		};
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
					"TOTAL TIME (ms): %.\n" +
					"AVERAGE TIME (ms): %.\n" +
					"MINIMUM TIME (ms): %.\n" +
					"MAXIMUM TIME (ms): %.\n" +
					"NUMBER OF ENTRIES: %.\n" +
					"- - - - - - - - - - - - - - - - -\n";

	// Calculates average and basic statistics.
	var calc = function (numbers) {
		var total = 0;
		var min = Infinity;
		var max = -Infinity;
		var number = numbers.length;
		var stats = {total: null, average: null, number: number, min: null, max: null};
		enyo.forEach(numbers, function (num) {
			total += num;
			min = Math.min(num, min);
			max = Math.max(num, max);
		});
		stats.total = total;
		stats.min = min;
		stats.max = max;
		stats.average = Math.abs(total/(number || 1));
		return stats;
	};

	//*@public
	enyo.dev = {

		//*@public
		//* can be set to false to disable all benchmarking code
		enabled: true,

		//*@public
		/**
			Create a new benchmark test.
			The opts object passed in has the properties

			* name: optional name for test
			* average: if true, calculate an average of repeated start/stops for the test
			* logging: if true, write start and stop messages to the console (defaults to true)
			* autoStart: if true, automatically start the benchmark (defaults to true)

			This returns an object that has start and stop methods used
			to track a test.
		*/
		bench: function (opts) {
			if (true !== this.enabled) {
				return false;
			}
			var options = opts || {name: enyo.uid("bench")};
			return new Benchmark(options);
		},

		//*@public
		//* Output to the console information about a benchmark named _name_.
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
						stats.min,
						stats.max,
						stats.number
					)
				);
			}
		},

		//*@public
		//* Remove stored data for a benchmark named _name_.
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

	//*@protected
	function Benchmark (options) {
		enyo.mixin(this, options);
		tests[this.name] = this;
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
			this._started = false;
			return true;
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