(function () {
	"use strict";

	/**
	* When available, supply a high-precision, high performance monotonic benchmark for some
	* internal usage and benchmark testing.
	* 
	* @private
	*/
	enyo.bench = enyo.perfNow;

	/*
	* Track the active tests
	*
	* @private
	*/
	var tests = {};

	/*
	* Track averages
	*
	* @private
	*/
	var averages = {};

	/*
	* Default report template string
	*
	* @private
	*/
	var report_template = "- - - - - - - - - - - - - - - - -\n" +
					"BENCHMARK REPORT (%.): %.\n" +
					"TOTAL TIME (ms): %.\n" +
					"AVERAGE TIME (ms): %.\n" +
					"MINIMUM TIME (ms): %.\n" +
					"MAXIMUM TIME (ms): %.\n" +
					"NUMBER OF ENTRIES: %.\n" +
					"- - - - - - - - - - - - - - - - -\n";

	/*
	* Calculates average and basic statistics.
	*
	* @private
	*/
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

	/**
	* This is a collection of methods to assist in simple benchmarking. The goal was to supply
	* useful functionality while impacting the results as little as possible (the more calculations
	* we do during benchmarking, the greater the opportunity to skew results). This is particularly
	* important when using potentially-nested benchmark series (i.e., benchmarking a method that
	* executes other benchmarked methods).
	*
	* @namespace enyo.dev
	* @public
	*/
	enyo.dev = {

		/**
		* Can be set to false to disable all benchmarking code
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		enabled: true,

		/**
		* Confuigurable benchmark options [object/hash]{@link external:Object}.
		* 
		* @typedef  {Object} enyo.dev~Options
		* 
		* @property {String} [name] - optional name for test
		* @property {Boolean} average=false - if true, calculate an average of repeated start/stops
		*                                   for the test
		* @property {Boolean} logging=true -  if true, write start and stop messages to the console
		* @property {Boolean} autoStart=true - if true, automatically start the benchmark
		*/
	
		/**
		* Create a new benchmark test. The [_opts_ object]{@link enyo.dev~Options} passed in has the
		* properties.
		*
		* @param {enyo.dev~Options} opts [Options]{@link enyo.dev~Options} for the benchmark instance.
		* @returns {Benchmark} A Benchmark instance that has start and stop methods used to track a
		*                        test.
		* @public
		*/
		bench: function (opts) {
			if (true !== this.enabled) {
				return false;
			}
			var options = opts || {name: enyo.uid("bench")};
			return new Benchmark(options);
		},

		/**
		* Print output to the console information about a benchmark named _name_.
		*
		* @param {String} name The name of the benchmark to report.
		* @public
		*/
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

		/**
		* Remove stored data for a benchmark named _name_.
		*
		* @param {String} name The name of the benchmark to report.
		* @public
		*/
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

	/**
	* @private
	*/
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

	Benchmark.prototype = {

		// ...........................
		// PUBLIC PROPERTIES

		/**
		* To log or not to log...
		* 
		* @type {Boolean}
		* @default true
		* @public
		*/
		logging: true,

		/**
		* Start benchmarking immediately when this instance is created. 
		* 
		* @type {Boolean}
		* @default true
		* @public
		*/
		autoStart: true,

		// ...........................
		// PROTECTED PROPERTIES

		/**
		* @private
		*/
		_started: false,

		/**
		* @private
		*/
		_averaging: false,

		/**
		* @private
		*/
		_begin: null,

		/**
		* @private
		*/
		_end: null,

		/**
		* @private
		*/
		_time: null,

		// ...........................
		// PUBLIC METHODS

		/**
		* Begin the benchmark!
		*
		* @returns {Boolean} True if we successfully started, false otherwise.
		* @public
		*/
		start: function () {
			if (true === this._started) {
				return false;
			}
			this._log("starting benchmark");
			this._begin = enyo.bench();
			this._started = true;
			return true;
		},

		/**
		* All done benchmarking. Finish the benchmark instance with this.
		*
		* @returns {Boolean} True if we successfully stopped, false if we hadn't started yet.
		* @public
		*/
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

		/**
		* @private
		*/
		_log: function (message) {
			if (!this.logging) {
				return false;
			}
			enyo.log("bench (" + this.name + "): " + message);
		}

	};
}());