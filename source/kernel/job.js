/**
	Invokes function _inJob_ after _inWait_ milliseconds have elapsed since the
	last time _inJobName_ was referenced.

	Jobs can be used to throttle behaviors.  If some event may occur once or
	multiple times, but we want a response to occur only once every _n_	seconds,
	we can use a job.

		onscroll: function() {
			// updateThumb will be called, but only when 1s has elapsed since the 
			// last onscroll
			enyo.job("updateThumb", enyo.bind(this, "updateThumb"), 1000);
		}
*/
enyo.job = function(inJobName, inJob, inWait) {
	enyo.job.stop(inJobName);
	enyo.job._jobs[inJobName] = setTimeout(function() {
		enyo.job.stop(inJobName);
		inJob();
	}, inWait);
};

/**
	Cancels the named job, if it has not already fired.
*/
enyo.job.stop = function(inJobName) {
	if (enyo.job._jobs[inJobName]) {
		clearTimeout(enyo.job._jobs[inJobName]);
		delete enyo.job._jobs[inJobName];
	}
};

enyo.job._jobs = {};