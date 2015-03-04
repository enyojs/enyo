(function (enyo, scope) {

	/**
	* The {@link enyo.jobs} singleton provides a mechanism for queueing tasks
	* (i.e., functions) for execution in order of priority. The execution of the
	* current job stack may be blocked programmatically by setting a priority
	* level (run level) below which no jobs are executed.
	*
	* At the moment, only {@link enyo.Animator} uses this interface, setting a
	* priority of 4, which blocks all low priority tasks from executing during
	* animations. To maintain backward compatibility, jobs are assigned a priority
	* of 5 by default; thus they are not blocked by animations.
	*
	* Normally, application code will not use `enyo.jobs` directly, but will
	* instead use the [job()]{@link enyo.Component#job} method of
	* {@link enyo.Component}.
	*
	* @name enyo.jobs
	* @public
	*/
	enyo.singleton(
		/** @lends enyo.jobs */ {
		
		/**
		* @private
		*/
		name: 'enyo.jobs',

		/**
		* @private
		*/
		kind: 'enyo.Object',
		
		/**
		* @private
		*/
		published: /** @lends enyo.jobs */ {
			
			/**
			* The current priority level.
			*
			* @type {Number}
			* @default 0
			* @public
			*/
			priorityLevel: 0
		},
		
		/**
		* Prioritized by index.
		*
		* @private
		*/
		_jobs: [ [], [], [], [], [], [], [], [], [], [] ],
		
		/**
		* @private
		*/
		_priorities: {},
		
		/**
		* @private
		*/
		_namedJobs: {},
		
		/**
		* @private
		*/
		_magicWords: {
			'low': 3,
			'normal': 5,
			'high': 7
		},
		
		/**
		* @private
		*/
		fpsThreshold: 55,

		/**
		* @private
		*/
		frameThreshold: 4,

		/**
		* @private
		*/
		constructor: function() {
			var c, p, f = 0, d = 1000 / this.fpsThreshold;

			this.inherited(arguments);

			this.cb = this.bindSafely(function() {
				if (!c) {
					c = enyo.perfNow();
				} else {
					p = c;
					c = enyo.perfNow();
					f = ((c - p) < d) ? f + 1 : 0;
				}
				if (f == this.frameThreshold) {
					this._doJob();
					c = p = f = 0;
				} else {
					this.trigger();
				}
			});
		},

		/**
		* Adds a [job]{@link enyo.job} to the job queue. If the current priority
		* level is higher than this job's priority, this job gets deferred until the
		* job level drops; if it is lower, this job is run immediately.
		*
		* @param {Function} job - The actual {@glossary Function} to execute as the
		* [job]{@link enyo.job}.
		* @param {Number} priority - The priority of the job.
		* @param {String} nom - The name of the job for later reference.
		* @public
		*/
		add: function (job, priority, nom) {
			priority = this.normalizePriority(priority) || 5;


			// if a job of the same name exists, remove it first (replace it)
			if(nom){
				this.remove(nom);
				this._namedJobs[nom] = priority;
			}

			this._jobs[priority - 1].push({fn: job, name: nom});
			this.trigger();
		},
		
		/**
		* Will remove the named [job]{@link enyo.job} from the queue.
		*
		* @param {String} nom - The name of the [job]{@link enyo.job} to remove.
		* @returns {Array} An {@glossary Array} that will contain the removed job if
		* it was found, or empty if it was not found.
		* @public
		*/
		remove: function (nom) {
			var jobs = this._jobs[this._namedJobs[nom] - 1];
			if(jobs){
				for(var j = jobs.length-1; j >= 0; j--){
					if(jobs[j].name === nom){
						return jobs.splice(j, 1);
					}
				}
			}
		},
		
		/**
		* Adds a new priority level at which jobs will be executed. If it is higher than the
		* highest current priority, the priority level rises. Newly added jobs below that priority
		* level are deferred until the priority is removed (i.e., unregistered).
		*
		* @param {Number} priority - The priority value to register.
		* @param {String} id - The name of the priority.
		* @public
		*/
		registerPriority: function(priority, id) {
			priority = this.normalizePriority(priority);
			this._priorities[id] = priority;
			this.setPriorityLevel( Math.max(priority, this.priorityLevel) );
		},
		
		/**
		* Removes a priority level. If the removed priority was previously the
		* highest priority, the priority level drops to the next highest priority
		* and queued jobs with a higher priority are executed.
		*
		* @param {String} id - The name of the priority level to remove.
		* @public
		*/
		unregisterPriority: function (id) {
			var highestPriority = 0;

			// remove priority
			delete this._priorities[id];

			// find new highest current priority
			for( var i in this._priorities ){
				highestPriority = Math.max(highestPriority, this._priorities[i]);
			}

			this.setPriorityLevel( highestPriority );
		},

		normalizePriority: function(priority) {
			// magic words: low = 3, normal = 5, high = 7
			return enyo.isString(priority) ? this._magicWords[priority] : priority;
		},
		
		/**
		* Tries to run next job if priority level has dropped.
		*
		* @type {enyo.ObserverSupport~Observer}
		* @private
		*/
		priorityLevelChanged: function (was) {
			if(was > this.priorityLevel){
				this.trigger();
			}
		},

		_findJob: function(pluck) {
			var min = this.priorityLevel || 1,
				jobs,
				job;

			for (var i = 10; i >= min; i--){
				jobs = this._jobs[i - 1];
				if (jobs.length) {
					if (!pluck) {
						return true;
					}
					job = jobs.shift();
					break;
				}
			}

			return job;
		},

		getJob: function() {
			return this._findJob(true);
		},

		hasJob: function() {
			return this._findJob(false);
		},

		trigger: function() {
			enyo.Loop.request(this.cb);
		},

		/**
		* Finds and executes the job of highest priority; in this way, all jobs with priority
		* greater than or equal to the current level are run, in order of their priority (highest
		* to lowest).
		*
		* @private
		*/
		_doJob: function () {
			var job = this.getJob();
			// find the job of highest priority above the current priority level
			// and remove from the job list

			// allow other events to pass through
			if (job) {
				job.fn();
				delete this._namedJobs[job.name];
				if (this.hasJob()) {
					this.trigger();
				}
			}
		}
	});
	
})(enyo, this);
