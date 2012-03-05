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
	response: function(/* [inContext], inResponder */) {
		this.accumulate(this.responders, arguments);
		return this;
	},
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
	respond: function(inValue) {
		this.failed = false;
		this.endTimer();
		this.handle(inValue, this.responders);
	},
	fail: function(inError) {
		this.failed = true;
		this.endTimer();
		this.handle(inError, this.errorHandlers);
	},
	recover: function() {
		this.failed = false;
	},
	go: function(inValue) {
		this.respond(inValue);
		return this;
	}
});
