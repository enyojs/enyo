(function (enyo, scope) {
	'use strict';

	/**
	* When available, supplies a high-precision, high performance monotonic
	* benchmark for some internal usage and benchmark testing.
	* 
	* @alias enyo.perfNow
	* @method
	* @public
	*/
	enyo.bench = enyo.perfNow;

	/*
	* Tracks the active tests.
	*
	* @private
	*/
	var tests = {};

	/*
	* Tracks averages.
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
	* Configurable benchmark options [hash]{@glossary Object}. For more
	* details, see the same properties defined on {@link enyo.dev.Benchmark}.
	* 
	* @typedef  {Object} enyo.dev.Benchmark~Options
	* @property {String} name - The referenceable name of the
	* [benchmark]{@link enyo.dev.Benchmark} (used for reporting).
	* @property {Boolean} average - If `true` (the default), an average of
	* repeated start/stops for the bench will be calculated.
	* @property {Boolean} logging - If `true` (the default), start and stop
	* messages will be written to the console.
	* @property {Boolean} autoStart - If `true` (the default), the benchmark will
	* automatically start on instantiation.
	*/

	/**
	* A collection of methods to assist in simple benchmarking. In creating these
	* methods, the goal was to supply useful functionality while impacting the
	* results as little as possible (the more calculations we do during
	* benchmarking, the greater the opportunity to skew results). This is
	* particularly important when dealing with potentially-nested benchmark series
	* (i.e., benchmarking a method that executes other benchmarked methods).
	*
	* @namespace enyo.dev
	* @public
	*/
	enyo.dev = /** @lends enyo.dev */ {

		/**
		* Can be set to `false` to disable all benchmarking code.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		enabled: true,
	
		/**
		* Creates a new [benchmark]{@link enyo.dev.Benchmark} test with the given
		* configuration options.
		*
		* @param {enyo.dev.Benchmark~Options} opts - The configuration
		* [options]{@link enyo.dev.Benchmark~Options} to apply to the
		* [benchmark]{@link enyo.dev.Benchmark}.
		* @returns {enyo.dev.Benchmark} A Benchmark instance with `start()` and
		* `stop()` methods used to track a test.
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
		* Shows a report for a given [benchmark]{@link enyo.dev.Benchmark} by name.
		*
		* @param {String} name - The name of the [benchmark]{@link enyo.dev.Benchmark} to report.
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
		* Removes all stored data related to the named [benchmark]{@link enyo.dev.Benchmark}.
		*
		* @param {String} name - The name of the [benchmark]{@link enyo.dev.Benchmark} from which to
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
	* A [kind]{@glossary kind} used internally for development benchmarking.
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
		* Determines whether output will be logged to the console.
		* 
		* @type {Boolean}
		* @default true
		* @public
		*/
		logging: true,

		/**
		* Determines whether benchmarking will start immediately when this instance is created. 
		* 
		* @type {Boolean}
		* @default true
		* @public
		*/
		autoStart: true,
		
		/**
		* Determines whether this instance will collect and maintain a report of averages for
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
		* Begins benching.
		*
		* @returns {Boolean} Whether or not benching began successfully. Returns `false` if
		*	benching was already in progress.
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
		* Stops benching.
		*
		* @returns {Boolean} Whether or not benching was stopped successfully. Returns `false`
		*	if benching was not in progress.
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