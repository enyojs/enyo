/**
	_enyo.Jobs_ are a mechanism to queue tasks (ie, functions) and invoke
	them sorted by priority. It allows to programmatically block the
	execution of the current job stack by setting a priority level (aka "run
	level"), under which no job is executed.

	At the moment only <a href="#enyo.Animator">enyo.Animator</a> uses this
	interface to set a priority of 4, therefore blocking all low priority
	tasks from executing during animations. For backward compatibility jobs
	get a priority of 5 by default and are thus not blocked by animations.

	_enyo.Jobs_ is not normally directly used in application code, the
	<a href="#enyo.Component::startJob">Component</a> job methods should be
	used instead.
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
		Add a job to the job queue. If the current priority level is higher
		than this jobs priority, the job gets deferred until the job level
		drops. If the priority level is lower, the job is run immediately.
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

		// if the job is of higher priority than the current priority level than
		// there's no point in enqueuing it
		if(inPriority >= this.priorityLevel){
			inJob();
		} else {
			this._jobs[inPriority - 1].push({fkt: inJob, name: inName});
		}
	},
	/**
	 * Remove a job from the job queue
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
		Add a new priority at which you want the jobs to be executed. If it
		is higher than the highest current priority, the priority level
		rises. Newly added jobs below that priority level are deferred until
		the priority is removed (aka unregistered).
	*/
	registerPriority: function(inPriority, inId){
		this._priorities[inId] = inPriority;
		this.setPriorityLevel( Math.max(inPriority, this.priorityLevel) ); 
	},
	/**
		Remove a priority. If it had been the highest priority, the priority
		level drops to the new highest priority and queued jobs with a
		higher priority are executed.
	*/
	unregisterPriority: function(inId){
		var highestPriority = 0;

		// remove priority
		delete this._priorities[inId];

		// find new highest current priority
		for( var priority in this._priorities ){
			highestPriority = Math.max(highestPriority, priority);
		}

		this.setPriorityLevel( highestPriority ); 
	},
	// try to run next job if priority level has dropped
	priorityLevelChanged: function(inOldValue){
		if(inOldValue > this.priorityLevel){
			this._doJob();
		}
	},
	// find and execute the job of highest priority
	// ...and run all jobs with higher priority from high to low priority in order
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
