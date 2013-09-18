/**
	_enyo.jobs_ provides a mechanism for queueing tasks (i.e., functions) for
	execution in order of priority. The execution of the current job stack may be
	blocked programmatically by setting a priority level ("run level") under which
	no jobs are executed.

	At the moment, only <a href="#enyo.Animator">enyo.Animator</a> uses this
	interface, setting a priority of 4, which blocks all low priority tasks from
	executing during animations. To maintain backward compatibility, jobs are
	assigned a priority of 5 by default; thus they are not blocked by animations.

	Normally, application code will not use _enyo.jobs_ directly, but will instead
	use the job methods from <a href="#enyo.Component">enyo.Component</a>.
*/
enyo.singleton({
	name: "enyo.jobs",
	published: {
		priorityLevel: 0
	},
	// Priority  1   2   3   4   5   6   7   8   9  10
	_jobs: [     [], [], [], [], [], [], [], [], [], [] ],
	_priorities: {},
	_namedJobs: {},
	_magicWords: {
		"low": 3,
		"normal": 5,
		"high": 7
	},
	/**
		Adds a job to the job queue. If the current priority level is higher than
		this job's priority, the job gets deferred until the job level drops; if it
		is lower, the job is run immediately.
	*/
	add: function(inJob, inPriority, inName){
		inPriority = inPriority || 5;

		// magic words: low = 3, normal = 5, high = 7
		inPriority = enyo.isString(inPriority) ? this._magicWords[inPriority] : inPriority;

		// if a job of the same name exists, remove it first (replace it)
		if(inName){
			this.remove(inName);
			this._namedJobs[inName] = inPriority;
		}

		// if the job is of higher priority than the current priority level then
		// there's no point in queueing it
		if(inPriority >= this.priorityLevel){
			inJob();
		} else {
			this._jobs[inPriority - 1].push({fkt: inJob, name: inName});
		}
	},
	/**
	 * Removes a job from the job queue.
	 */
	remove: function(inJobName){
		var jobs = this._jobs[this._namedJobs[inJobName] - 1];
		if(jobs){
			for(var j = jobs.length-1; j >= 0; j--){
				if(jobs[j].name === inJobName){
					return jobs.splice(j, 1);
				}
			}
		}
	},
	/**
		Adds a new priority level at which jobs will be executed. If it is higher
		than the highest current priority, the priority level rises. Newly added
		jobs below that priority level are deferred until the priority is removed
		(i.e., unregistered).
	*/
	registerPriority: function(inPriority, inId){
		this._priorities[inId] = inPriority;
		this.setPriorityLevel( Math.max(inPriority, this.priorityLevel) );
	},
	/**
		Removes a priority. If the removed priority had been the highest priority,
		the priority level drops to the next highest priority and queued jobs with a
		higher priority are executed.
	*/
	unregisterPriority: function(inId){
		var highestPriority = 0;

		// remove priority
		delete this._priorities[inId];

		// find new highest current priority
		for( var i in this._priorities ){
			highestPriority = Math.max(highestPriority, this._priorities[i]);
		}

		this.setPriorityLevel( highestPriority );
	},
	/**
		Tries to run next job if priority level has dropped.
	*/
	priorityLevelChanged: function(inOldValue){
		if(inOldValue > this.priorityLevel){
			this._doJob();
		}
	},
	/**
		Finds and executes the job of highest priority; in this way, all jobs with
		priority greater than or equal to the current level are run, in order of
		their priority (highest to lowest).
	*/
	_doJob: function(){
		var job;
		// find the job of highest priority above the current priority level
		// and remove from the job list
		for(var i = 9; i >= this.priorityLevel; i--){
			if(this._jobs[i].length){
				job = this._jobs[i].shift();
				break;
			}
		}

		// allow other events to pass through
		if(job){
			job.fkt();
			delete this._namedJobs[job.name];
			setTimeout(enyo.bind(this, "_doJob"), 10);
		}
	}
});
