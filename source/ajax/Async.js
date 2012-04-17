/**
	Base kind for handling asynchronous operations.  To use, you create a new
	instance of enyo.Async or a kind derived from it, then register response
	and error handlers, then start the async operation running with the `go`
	method.

	Handlers can either me methods with the signature (asyncObject, value) or
	new instances of enyo.Async or its subkinds.  This allows chaining of
	async objects, such as calling a web API

	The base implementation isn't actually sync.  Calling go causes all the
	response handlers to be called.  However, its useful for chaining multiple
	enyo.Asnyc-subkinds together.
*/
enyo.kind({
	name: "enyo.Async",
	kind: enyo.Object,
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
	/** register a response function, first parameter is
		an optional this context for the response method, second
		(or only) parameter is the function object. */
	response: function(/* [inContext], inResponder */) {
		this.accumulate(this.responders, arguments);
		return this;
	},
	/** register an error handler, first parameter is
		an optional this context for the response method, second
		(or only) parameter is the function object. */
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
				var v = enyo.call(this.context || this, r, [this, inValue]);
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
	//* @public
	//* called from async handler, indicates successful completion
	respond: function(inValue) {
		this.failed = false;
		this.endTimer();
		this.handle(inValue, this.responders);
	},
	//* called from async handler, indicates error
	fail: function(inError) {
		this.failed = true;
		this.endTimer();
		this.handle(inError, this.errorHandlers);
	},
	//* clear error condition to allow retrying
	recover: function() {
		this.failed = false;
	},
	//* start the async activity, overridden in subkinds
	go: function(inValue) {
		this.respond(inValue);
		return this;
	}
});
