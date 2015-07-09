require('enyo');

/**
* Contains methods for dealing with jobs.
* @module enyo/job
*/
var _jobs = {};

/**
* Runs a job after the specified amount of time has elapsed
* since a job with the same name has run.
* 
* Jobs can be used to throttle behaviors.  If some event may occur one time or
* multiple times, but we want a response to occur only once every `n` seconds,
* we can use a job.
*
* @example
* onscroll: function() {
*	// updateThumb will be called, but only when 1 second has elapsed since the
*	// last onscroll
*	exports("updateThumb", this.bindSafely("updateThumb"), 1000);
* }
*
* @param {String} nom - The name of the job to throttle.
* @param {(Function|String)} job - Either the name of a method or a [function]{@glossary Function}
*                                to execute as the requested job.
* @param {Number} wait - The number of milliseconds to wait before executing the job again.
* @function
* @public
*/
exports = module.exports = function (nom, job, wait) {
	exports.stop(nom);
	_jobs[nom] = setTimeout(function() {
		exports.stop(nom);
		job();
	}, wait);
};

/**
* Cancels the named job, if it has not already fired.
*
* @param {String} nom - The name of the job to cancel.
* @static
* @public
*/
exports.stop = function (nom) {
	if (_jobs[nom]) {
		clearTimeout(_jobs[nom]);
		delete _jobs[nom];
	}
};

/**
* Immediately invokes the job and prevents any other calls
* to `exports.throttle()` with the same job name from running for the
* specified amount of time.
* 
* This is used for throttling user events when you want to provide an
* immediate response, but later invocations might just be noise if they arrive
* too often.
* 
* @param {String} nom - The name of the job to throttle.
* @param {(Function|String)} job - Either the name of a method or a [function]{@glossary Function}
*                                to execute as the requested job.
* @param {Number} wait - The number of milliseconds to wait before executing the
*                      job again.
* @static
* @public
*/
exports.throttle = function (nom, job, wait) {
	// if we still have a job with this name pending, return immediately
	if (_jobs[nom]) {
		return;
	}
	job();
	_jobs[nom] = setTimeout(function() {
		exports.stop(nom);
	}, wait);
};
