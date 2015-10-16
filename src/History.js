/**
* The enyo/History singleton is a specialized application history manager.
* It is built on top of the standard HTML5 History API and centrally manages
* interactions with that API to reduce the likelihood that "competing" uses
* of the API within a single app will conflict, causing unpredictable behavior.
*
* CAUTION: This API is experimental. It is likely to change or to be removed
* altogether in a future release.
*
* @module enyo/History
* @wip
*/

/**
* Passed to {@link module:enyo/History#push} to add a new history entry and passed as the first
* argument to {@link module:enyo/History~HistoryEntry#handler} when the entry is popped. Additional
* properties beyond those defined here may be included to provide additional data to the handler.
*
* @example
* var
* 	EnyoHistory = require('enyo/History');
*
* EnyoHistory.push({
* 	handler: function (entry) {
* 		console.log('Entry added at ', entry.time, 'and popped at', Date.now());
* 	},
* 	time: Date.now()
* });
*
* @typedef {Object} module:enyo/History~HistoryEntry
* @property {Function|String} handler - Function called when this history entry is popped. May
* 	either be a Function or the name of a function on `context`.
* @property {Object} [context] - Context on which `handler` is bound
* @property {String} [location] - When {@link module:enyo/History#isSupported} is `true`, updates
* 	the displayed URL. Must be within the same origin.
*/

var
	dispatcher = require('enyo/dispatcher'),
	kind = require('enyo/kind'),
	utils = require('enyo/utils'),
	Component = require('enyo/Component'),
	Signals = require('enyo/Signals');

var
	// App history, ordered from oldest to newest.
	_history = [],

	// History actions that were queued because a back operation was in progress. These will be
	// dequeued when the next popstate event is handled
	_queue = [],

	// Indicates the number of steps 'back' in history requested
	_popQueueCount = 0,

	// `true` if a push action has been enqueued
	_pushQueued = false,

	// Track if we're in the midst of handling a pop
	_processing = false,

	// `true` if the platform support the HTML5 History API
	_supports = !!global.history.pushState;

var EnyoHistory = module.exports = kind.singleton(
	/** @lends module:enyo/History~History.prototype */ {

	/**
	* @private
	*/
	kind: Component,

	/**
	* When enabled, enyo/History will handle onpopstate events and notify controls when their
	* history entry is popped.
	*
	* @type {Boolean}
	* @default true
	* @public
	*/
	enabled: true,

	/**
	* When true, the browser's history will be updated when history entries are added or removed. If
	* the platform does not support this feature, the value will always be false. The default is
	* true if supported by the platform and false otherwise.
	*
	* @type {Boolean}
	* @private
	*/
	updateHistory: _supports,

	/**
	* @private
	*/
	components: [
		{kind: Signals,  onkeyup: 'handleKeyUp'}
	],

	/**
	* @private
	*/
	enabledChanged: function () {
		// reset private members
		this.clear();
	},

	/**
	* Resets the value to false if the platform does not support the History API
	*
	* @private
	*/
	updateHistoryChanged: function () {
		this.updateHistory = this.updateHistory && _supports;
	},

	// Public methods

	/**
	* Adds a new history entry
	*
	* @param  {module:enyo/History~HistoryEntry} entry Object describing the history entry
	*
	* @public
	*/
	push: function (entry) {
		if (this.enabled) {
			if (_popQueueCount) {
				this.enqueuePush(entry);
			} else {
				this.pushEntry(entry);
			}
		}
	},

	/**
	* Asynchronously removes `count` entries from the history invoking the callback for each if it
	* exists.
	*
	* @param  {Number} count Number of entries to remove
	*
	* @oublic
	*/
	pop: function (count) {
		if (!this.enabled) return;
		this.enqueuePop('pop', count);
	},

	/**
	* Asynchronously removes `count` entries from the history without invoking the callbacks for
	* each.
	*
	* @param  {Number} count Number of entries to remove
	*
	* @public
	*/
	drop: function (count) {
		if (!this.enabled) return;
		this.enqueuePop('drop', count);
	},

	/**
	* Returns the latest history entry without removing it.
	*
	* @return {module:enyo/History~HistoryEntry}
	* @public
	*/
	peek: function () {
		return _history[_history.length - 1];
	},

	/**
	* Clears all history entries without calling their respective handlers. When the
	* entries are popped, the internal history will be empty and the browser history will be
	* reset to the state when this module started tracking the history.
	*
	* @public
	*/
	clear: function () {
		_queue.splice(0, _queue.length);
		_history.splice(0, _history.length);
		_popQueueCount = 0;
		_pushQueued = false;
		_processing = false;
		this.stopJob('history.go');
	},

	/**
	* Returns `true` when enyo/History is currently handling a popstate event and invoking the
	* callbacks for any popped entries.
	*
	* @return {Boolean}
	* @public
	*/
	isProcessing: function () {
		return _processing;
	},

	/**
	* Returns `true` when the HTML5 history API is supported by the platform
	*
	* @return {Boolean}
	* @public
	*/
	isSupported: function () {
		return _supports;
	},

	// Private methods

	/**
	* Handles flushing the history action queus and processing each entry. When the queues are
	* empty and a popstate event occurs, this pops the next entry and processes it.
	*
	* @param  {Object} state Value of the state member of the PopStateEvent
	*
	* @private
	*/
	processState: function (state) {
		_processing = true;
		if (_queue.length) {
			this.processQueue();
		} else {
			this.processPopEntry(_history.pop());
		}
		_processing = false;
	},

	/**
	* Processes any queued actions
	*
	* @private
	*/
	processQueue: function () {
		var next, i, entries;

		this.silencePushEntries();

		while (_queue.length) {
			next = _queue.shift();

			if (next.type === 'push') {
				this.pushEntry(next.entry, next.silenced);
			} else {
				_popQueueCount -= next.count;
				entries = _history.splice(_history.length - next.count, next.count);
				// if a 'pop' was requested
				if (next.type == 'pop') {
					// iterate the requested number of history entries
					for (i = entries.length - 1; i >= 0; --i) {
						// and call each handler if it exists
						this.processPopEntry(entries[i]);
					}
				}
				// otherwise we just drop the entries and do nothing
			}
		}
		_popQueueCount = 0;
		_pushQueued = false;
	},

	/**
	* Marks any queued push entries as silenced that would be popped by a subsequent queued pop or
	* drop entry.
	*
	* @private
	*/
	silencePushEntries: function () {
		var i, next,
			silence = 0;

		for (i = _queue.length - 1; i >= 0; --i) {
			next = _queue[i];
			if (next.type == 'push') {
				if (silence) {
					silence -= 1;
					next.silenced = true;
				}
			} else {
				silence += next.count;
			}
		}
	},

	/**
	* Invokes the callback for a pop entry
	*
	* @param  {module:enyo/History~HistoryEntry} entry
	*
	* @private
	*/
	processPopEntry: function (entry) {
		if (entry.handler) {
			utils.call(entry.context, entry.handler, [entry]);
		}
	},

	/**
	* Adds an pop or drop entry to the history queue
	*
	* @param  {String} type  History action type ('pop' or 'drop')
	* @param  {Number} [count] Number of actions to invoke. Defaults to 1.
	*
	* @private
	*/
	enqueuePop: function (type, count) {
		count = count || 1;
		_queue.push({type: type, count: count});
		// if we've only queued pop/drop events, we need to increment the number of entries to go
		// back. once a push is queued, the history must be managed in processState.
		if (!_pushQueued) {
			_popQueueCount += count;
		}
		if (_queue.length === 1) {
			// defer the actual 'back' action so pop() or drop() can be called multiple times in the
			// same frame. Otherwise, only the first go() would be observed.
			this.startJob('history.go', function () {
				// If we are able to and supposed to update history and there are pending pops
				if (this.updateHistory && _popQueueCount > 0) {
					// go back that many entries
					global.history.go(-_popQueueCount);
				} else {
					// otherwise we'll start the processing
					this.handlePop({
						state: this.peek()
					});
				}
			});
		}
	},

	/**
	* Adds a push entry to the history queue
	*
	* @param  {module:enyo/History~HistoryEntry} entry
	*
	* @private
	*/
	enqueuePush: function (entry) {
		_pushQueued = true;
		_queue.push({type: 'push', entry: entry});
	},

	/**
	* Adds an new entry to the _history and pushes the new state to global.history (if supported)
	*
	* @param  {module:enyo/History~HistoryEntry} entry
	* @param  {Boolean} silenced Prevents pushing the state onto history when `true`
	*
	* @private
	*/
	pushEntry: function (entry, silenced) {
		var id = entry.context && entry.context.id || 'anonymous',
			location = entry.location || '';
		_history.push(entry);
		if (this.updateHistory && !silenced) {
			global.history.pushState({id: id}, '', location);
		}
	},

	/**
	* onpopstate handler
	*
	* @private
	*/
	handlePop: function (event) {
		if (this.enabled && _history.length) {
			this.processState(event.state);
		}
	},

	/**
	* onkeyup handler
	*
	* @private
	*/
	handleKeyUp: function (sender, event) {
		var current = this.peek();
		if (event.keySymbol == 'back' && current && current.context.getShowing()) {
			this.pop();
		}
		return true;
	}

});

dispatcher.listen(global, 'popstate', EnyoHistory.handlePop.bind(EnyoHistory));