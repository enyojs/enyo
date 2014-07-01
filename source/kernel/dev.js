(function (enyo, scope) {
	'use strict';

	/**
	* When available, supply a high-precision, high performance monotonic benchmark for some
	* internal usage and benchmark testing.
	* 
	* @alias enyo.perfNow
	* @method
	* @public
	*/
	enyo.bench = enyo.perfNow;

	/*
	* Track the active tests.
	*
	* @private
	*/
	var tests = {};

	/*
	* Track averages.
	*
	* @private
	*/
	var averages = {};

	/*
	* Default report template string.
	*
	* @private
	*/
	var report_template = '- - - - - - - - - - - - - - - - -\n' +
					'BENCHMARK REPORT (%.): %.\n' +
					'TOTAL TIME (ms): %.\n' +
					'AVERAGE TIME (ms): %.\n' +
					'MINIMUM TIME (ms): %.\n' +
					'MAXIMUM TIME (ms): %.\n' +
					'NUMBER OF ENTRIES: %.\n' +
					'- - - - - - - - - - - - - - - - -\n';

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
	* Configurable benchmark options [hash]{@link external:Object}. For more details see the
	* same properties defined on {@link enyo.dev.Benchmark}.
	* 
	* @typedef  {Object} enyo.dev.Benchmark~Options
	* @property {String} name - The referenceable name of the benchmark (used for reporting).
	* @property {Boolean} average - Defaults to `true`; if `true`, calculate an average of repeated
	*	start/stops for the bench.
	* @property {Boolean} logging - Defaults to `true`; if `true`, write start and stop messages to
	*	the console.
	* @property {Boolean} autoStart - Defaults to `true`; if `true`, automatically start the
	*	[benchmark]{@link enyo.dev.Benchmark}.
	*/

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
	enyo.dev = /** @lends enyo.dev */ {

		/**
		* Can be set to false to disable all benchmarking code.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		enabled: true,
	
		/**
		* Create a new benchmark test with the given configuration options.
		*
		* @param {enyo.dev.Benchmark~Options} opts The configuration options to apply to the
		*	[benchmark]{@link enyo.dev.Benchmark~Options}.
		* @returns {enyo.dev.Benchmark} A Benchmark instance that has start and stop methods used to
		*	track a test.
		* @public
		*/
		bench: function (opts) {
			if (true !== this.enabled) {
				return false;
			}
			var options = opts || {name: enyo.uid('bench')};
			return new enyo.dev.Benchmark(options);
		},

		/**
		* Show a report for a given [benchmark]{@link enyo.dev.Benchmark} by name.
		*
		* @param {String} name The name of the [benchmark]{@link enyo.dev.Benchmark} to report.
		* @public
		*/
		report: function (name) {
			var bench = averages[name] || tests[name];
			if (!bench) {
				return false;
			}
			if (bench.report && 'function' === typeof bench.report) {
				return bench.report();
			} else {
				var stats = calc(bench);
				enyo.log(
					enyo.format(
						report_template,
						'averages',
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
		* Remove all stored data related to the named [benchmark]{@link enyo.dev.Benchmark}.
		*
		* @param {String} name The name of the [benchmark]{@link enyo.dev.Benchmark} from which to
		*	remove stored data.
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
	* An internally used [kind]{@link external:kind} for development benchmarking.
	*
	* @class enyo.dev.Benchmark
	* @protected
	*/
	enyo.kind(/** @lends enyo.dev.Benchmark.prototype */ {
		
		/**
		* @private
		*/
		name: 'enyo.dev.Benchmark',
		
		/**
		* @private
		*/
		kind: null,
		
		/**
		* @private
		*/
		noDefer: true,
		
		/**
		* Determines whether or not output will be logged to the console.
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
		
		/**
		* Determines whether or not this will collect and maintain an averages report for
		* benches intended to be executed multiple times.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		average: true,
		
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
		
		/**
		* Begin benching.
		*
		* @returns {Boolean} Whether or not it successfully began benching. Will be `false` if it
		*	was already benching.
		* @public
		*/
		start: function () {
			if (true === this._started) {
				return false;
			}
			this._log('starting benchmark');
			this._begin = enyo.bench();
			this._started = true;
			return true;
		},

		/**
		* Stop benching.
		*
		* @returns {Boolean} Whether or not it successfully stopped benching. Will be `false` if it
		*	was not benching.
		* @public
		*/
		stop: function () {
			if (!this._started) {
				return false;
			}
			this._end = enyo.bench();
			this._time = this._end - this._begin;
			this._log('benchmark complete: ' + this._time);
			if (true === this._averaging) {
				averages[this.name].push(this._time);
			}
			this._started = false;
			return true;
		},
		
		/**
		* @private
		*/
		constructor: function (options) {
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
		},
		
		/**
		* @private
		*/
		_log: function (message) {
			if (!this.logging) {
				return false;
			}
			enyo.log('bench (' + this.name + '): ' + message);
		}
		
	});
	
})(enyo, this);