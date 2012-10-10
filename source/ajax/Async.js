/**
	_enyo.Async_ is the base kind for handling asynchronous operations.

	_enyo.Async_ is an **Object**, not a **Component**; thus, you may not declare
	an _Async_ in a _components_ block. If you want to use _Async_ as a
	component, you should probably be using
	<a href="#enyo.WebService">enyo.WebService</a> instead.

	An Async object represents a task that has not yet completed. You may attach
	callback functions to an Async, to be called when the task completes or
	encounters an error.

	More information on _Async_ and its usage is available in the documentation	on
	<a href="https://github.com/enyojs/enyo/wiki/Consuming-Web-Services">Consuming Web Services</a>
	in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.Async",
	kind: enyo.Object,
	published: {
		/**
			If set to a non-zero value, the number of milliseconds to
			wait after the _go_ call before failing with the "timeout" error
		*/
		timeout: 0
	},
	//* @protected
	failed: false,
	context: null,
	constructor: function() {
		this.responders = [];
		this.errorHandlers = [];
	},
	accumulate: function(inArray, inMethodArgs) {
		var fn = (inMethodArgs.length < 2) ? inMethodArgs[0] : enyo.bind(inMethodArgs[0], inMethodArgs[1]);
		inArray.push(fn);
	},
	//* @public
	/**
		Registers a response function.
		First parameter is an optional _this_ context for the response method.
		Second (or only) parameter is the function object. 
	*/
	response: function(/* [inContext], inResponder */) {
		this.accumulate(this.responders, arguments);
		return this;
	},
	/**
		Registers an error handler.
		First parameter is an optional _this_ context for the response method.
		Second (or only) parameter is the function object. 
	*/
	error: function(/* [inContext], inResponder */) {
		this.accumulate(this.errorHandlers, arguments);
		return this;
	},
	//* @protected
	route: function(inAsync, inValue) {
		var r = enyo.bind(this, "respond");
		inAsync.response(function(inSender, inValue) {
			r(inValue);
		});
		var f = enyo.bind(this, "fail");
		inAsync.error(function(inSender, inValue) {
			f(inValue);
		});
		inAsync.go(inValue);
	},
	handle: function(inValue, inHandlers) {
		var r = inHandlers.shift();
		if (r) {
			if (r instanceof enyo.Async) {
				this.route(r, inValue);
			} else {
				// handler can return a new 'value'
				var v = enyo.call(this.context || this, r, [this, inValue]);
				// ... but only if it returns something other than undefined
				v = (v !== undefined) ? v : inValue;
				// next handler
				(this.failed ? this.fail : this.respond).call(this, v);
			}
		}
	},
	startTimer: function() {
		this.startTime = enyo.now();
		if (this.timeout) {
			this.timeoutJob = setTimeout(enyo.bind(this, "timeoutComplete"), this.timeout);
		}
	},
	endTimer: function() {
		if (this.timeoutJob) {
			this.endTime = enyo.now();
			clearTimeout(this.timeoutJob);
			this.timeoutJob = null;
			this.latency = this.endTime - this.startTime;
		}
	},
	timeoutComplete: function() {
		this.timedout = true;
		this.fail("timeout");
	},
	//* @protected
	//* Called as part of the async implementation; triggers the handler chain.
	respond: function(inValue) {
		this.failed = false;
		this.endTimer();
		this.handle(inValue, this.responders);
	},
	//* @public
	//* Can be called from any handler to trigger the error chain.
	fail: function(inError) {
		this.failed = true;
		this.endTimer();
		this.handle(inError, this.errorHandlers);
	},
	//* Called from an error handler; clears the error condition and resumes
	//* calling handler methods.
	recover: function() {
		this.failed = false;
	},
	//* Starts the async activity. Overridden in subkinds.
	go: function(inValue) {
		enyo.asyncMethod(this, function() {
			this.respond(inValue);
		});
		return this;
	}
});
