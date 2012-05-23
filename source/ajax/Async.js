/**
	Base kind for handling asynchronous operations.
	
	_enyo.Aync_ is an **Object**, not a **Component**, you may not declare
	them in component blocks. If you want to use Async as a Component, you
	are probably looking for <a href="#enyo.WebService">enyo.WebService</a>.
	
	An Async object represents a task that has not yet completed. Callback
	functions can be attached to an Async that will be called with the task
	completes or encounters an error.
	
	To use it, create a new instance of _enyo.Async_ or a kind derived from it,
	then register handlers with the `response()` and `error()` methods.
	
	Start the async operation by calling the `go()` method.

	Handlers may either be methods with the signature _(asyncObject, value)_ or
	new instances of _enyo.Async_ or its subkinds. This allows for chaining of
	async objects (e.g., when calling a Web API).

	If a response method returns a value (other than undefined) that value is 
	sent to subsequent handlers in the chain, replacing the original value.

	A failure method can call `recover()` to undo the error condition and switch
	to calling response methods.

	The default implementation of `go()` causes all the response handlers 
	to be called (asynchronously).

	Here is a complicated example which demonstrates many of these features:

		var transaction = function() {
			// create a transaction object
			var async = new enyo.Async();
			// cause handlers to fire asynchronously (sometime after we yield this thread)
			// "initial response" will be sent to handlers as inResponse
			async.go("intial response");
			// until we yield the thread, we can continue to add handlers
			async.response(function(inSender, inResponse) {
				console.log("first response: returning a string, subsequent handlers receive this value for 'inResponse'");
				return "some response"
			});
			return async;
		};

	Users of the `transaction()` function can add handlers to the Async object until all functions return (synchronously).

		// get a new transaction, it's been started, but we can add more handlers synchronously
		var x = transaction();

		// add an handler that will be called if an error is detected ... this handler recovers and sends a custom message
		x.error(function(inSender, inResponse) {
			console.log("error: calling recover", inResponse);
			this.recover();
			return "recovered message";
		});

		// add a response handler that halts response handler and triggers the error chain
		// the error will be sent to the error handler registered above, which will
		// restart the handler chain
		x.response(function(inSender, inResponse) {
			console.log("response: calling fail");
			this.fail(inResponse);
		});

		// recovered message will end up here
		x.response(function(inSender, inResponse) {
			console.log("response: ", inResponse);
		});
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
	/**
		Registers a response function.
		First parameter is an optional this context for the response method.
		Second (or only) parameter is the function object. 
	*/
	response: function(/* [inContext], inResponder */) {
		this.accumulate(this.responders, arguments);
		return this;
	},
	/**
		Registers an error handler.
		First parameter is an optional this context for the response method.
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
	//* Called as part of the async implementation, triggers the handler chain.
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
	//* Called from an error handler, this method clears the error
	// condition and resumes calling handler methods.
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
