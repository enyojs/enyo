/**
* Runs a [job]{@link enyo.job} after the specified amount of time has elapsed since a 
* [job]{@link enyo.job} with the same name has run.
* 
* [Jobs]{@link enyo.job} can be used to throttle behaviors.  If some event may occur once or
* multiple times, but we want a response to occur only once every `n` seconds, we can use a 
* [job]{@link enyo.job}.
*
* @example
* onscroll: function() {
*	// updateThumb will be called, but only when 1s has elapsed since the
*	// last onscroll
*	enyo.job("updateThumb", this.bindSafely("updateThumb"), 1000);
* }
*
* @param {String} nom The name of the [job]{@link enyo.job} to throttle.
* @param {(Function|String)} job Either the name of a method or a [function]{@link external:Function} 
*                                to execute as the requested [job]{@link enyo.job}.
* @param {Number} wait The number of milliseconds to wait before executing the [job]{@link enyo.job}
*                      again.
* @static
* @memberof enyo
* @public
*/
enyo.job = function(nom, job, wait) {
	enyo.job.stop(nom);
	enyo.job._jobs[nom] = setTimeout(function() {
		enyo.job.stop(nom);
		job();
	}, wait);
};

/**
* Cancels the named [job]{@link enyo.job}, if it has not already fired.
*
* @param {String} nom The name of the [job]{@link enyo.job} to throttle.
* @static
* @memberof enyo
* @public
*/
enyo.job.stop = function(nom) {
	if (enyo.job._jobs[nom]) {
		clearTimeout(enyo.job._jobs[nom]);
		delete enyo.job._jobs[nom];
	}
};

/**
* Immediately invokes the [job]{@link enyo.job} and prevents any other calls to _enyo.job.throttle_ with
* the same [job]{@link enyo.job} name from running for the specified amount of time.
* 
* This is used for throttling user events when you want an immediate response, but later invocations
* might just be noise if they arrive too often.
* 
* @param {String} nom The name of the [job]{@link enyo.job} to throttle.
* @param {(Function|String)} job Either the name of a method or a [function]{@link external:Function} 
*                                to execute as the requested [job]{@link enyo.job}.
* @param {Number} wait The number of milliseconds to wait before executing the [job]{@link enyo.job}
*                      again.
* @static
* @memberof enyo
* @public
*/
enyo.job.throttle = function(nom, job, wait) {
	// if we still have a job with this name pending, return immediately
	if (enyo.job._jobs[nom]) {
		return;
	}
	job();
	enyo.job._jobs[nom] = setTimeout(function() {
		enyo.job.stop(nom);
	}, wait);
};

enyo.job._jobs = {};
