/**
	Invokes function _inJob_ after _inWait_ milliseconds have elapsed since the
	last time _inJobName_ was referenced.

	Jobs can be used to throttle behaviors.  If some event may occur once or
	multiple times, but we want a response to occur only once every _n_	seconds,
	we can use a job.

		onscroll: function() {
			// updateThumb will be called, but only when 1s has elapsed since the
			// last onscroll
			enyo.job("updateThumb", this.bindSafely("updateThumb"), 1000);
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

/**
	Invoke _inJob_ immediately, then prevent any other calls to
	enyo.job.throttle with the same _inJobName_ from running for
	the next _inWait_ milliseconds.

	This is used for throttling user events when you want an
	immediate response, but later invocations might just be noise
	if they arrive too often.
*/
enyo.job.throttle = function(inJobName, inJob, inWait) {
	// if we still have a job with this name pending, return immediately
	if (enyo.job._jobs[inJobName]) {
		return;
	}
	inJob();
	enyo.job._jobs[inJobName] = setTimeout(function() {
		enyo.job.stop(inJobName);
	}, inWait);
};

/**
	Prioritize jobs
*/
enyo.singleton({
	name: "enyo.jobs",
	published: {
		priorityLevel: 0
	},
	// Priority  1   2   3   4   5   6   7   8   9  10
	jobs: [     [], [], [], [], [], [], [], [], [], [] ],
	priorities: {},
	magicWords: {
		"low": 3,
		"high": 7
	},
	add: function(inPriority, inJob){
		if(enyo.isFunction(inPriority)){
			inJob = inPriority;
			inPriority = 5;
		}

		// magic words: low = 3, high = 7
		if(enyo.isString(inPriority)){
			inPriority = this.magicWords[inPriority];
		}

		// if the job is of higher priority than the current priority level than
		// there's no point in enqueuing it
		if(inPriority > this.priorityLevel){
			inJob();
		} else {
			this.jobs[inPriority - 1].push(inJob);
		}
	},
	registerPriority: function(inPriority, inId){
		this.priorities[inId] = inPriority;
		this.setPriorityLevel( Math.max(inPriority, this.priorityLevel) ); 
	},
	unregisterPriority: function(inId){
		var highestPriority = 0;

		// remove priority
		delete this.priorities[inId];

		// find new highest current priority
		for( var priority in this.priorities ){
			highestPriority = Math.max(highestPriority, priority);
		}

		this.setPriorityLevel( highestPriority ); 
	},
	// try to run next job if priority level has dropped
	priorityLevelChanged: function(inOldValue){
		if(inOldValue > this.priorityLevel){
			this.doJob();
		}
	},
	// find and execute the job of highest priority
	// ...and run all jobs with higher priority from high to low priority in order
	doJob: function(){
		var job;
		// find the job of highest priority above the current priority level
		// and remove from the job list
		for(var i = 9; i >= this.priorityLevel; i--){
			if(this.jobs[i].length){
				job = this.jobs[i].shift();
				break;
			}
		}

		if(job){
			job();
			setTimeout(enyo.bind(this, "doJob"), 10);
		}
	}
});


enyo.job._jobs = {};
