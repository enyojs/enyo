
// TestRunner.js

/*
To add a test case:
	1) Create a subclass of EnyoTestCase
	2) Add file to package.js
*/
enyo.kind({
	name: "enyo.TestRunner",
	kind: enyo.Control,
	index: 0,
	rendered: function() {
		this.inherited(arguments);
		this.next();
	},
	next: function() {
		var test = enyo.TestSuite.tests[this.index++];
		if (test) {
			this.createComponent({name: test.prototype.kindName, kind: enyo.TestReporter, onFinishAll: "next"}).render().runTests();
		}
	}
});

// TestSuite.js

/*global enyo, console
*/
/*
Test Package Wish list:
-----------------------
Collapse success results for a suite, so large swaths of green don't hide the red.
Expandable stack trace & logging for failures, so they can be collapsed by default.
Support for async beforeEach & afterEach
Jasmine style assert mechanism, so we can have fancy english text for failures 
	e.g., this.assert("spreadsheet total", total).equals(15) yields "Expected spreadsheet total 12 to equal 15"

*/


/**
	To implement a suite of unit tests, create a subkind of enyo.TestSuite.
	Any methods in your subkind that begin with 'test' will be invoked as unit tests when the test runner executes.
	
	When each test is complete, it should call this.finish().  
	Pass nothing for success, or something truthy for failure (usually an explanatory message or an exception object).
	If you do not call finish(), your test will be failed after a 3-second timeout.  
	This timeout can be customized for a given test by calling this.resetTimeout(ms).
	
	
	See enyo-support/tests for example framework tests.
	
*/
enyo.kind({
	name: "enyo.TestSuite",
	kind: enyo.Component,
	events: {
		onBegin: "", // sent with test name as each test begins running.
		onFinish: "", // sent with result as each test completes.
		onFinishAll: "" // sent when all tests are finished.
	},
	timeout: 3000,
	timeoutMessage: "timed out",
	/** @public
		Replaces the current test timeout with 
		May be called by individual tests to reset/lengthen/shorten the test timeout.
		Mostly good for unusually long-running tests, but can be used for shortening the timeout duration, or 
		even for setting different timeouts for successive stages of a test.
	*/
	resetTimeout: function(timeout) {
		this.clearTimer();
		this.timer = window.setTimeout(enyo.bind(this, "timedout"), timeout || this.timeout);
	},
	/** @public
		Tests can call this.log() to print useful diagnostic information.
		The logs are accumulated, and only displayed when the test fails.
		Logged objects will be automatically converted to JSON.
	*/
	log: function(msg) {
		this.logMessages = this.logMessages || [];
		if (typeof msg !== "string") {
			msg = JSON.stringify(msg);
		}
		this.logMessages.push(msg);
	},
	// Subclasses can override this method.
	// It will be called before each test executes.
	// It can be used to run common setup code.
	beforeEach: function() {
	},
	// Subclasses can override this method.
	// It will be called exactly once as each test finishes, even in failure cases.
	// It can be used to reliably execute cleanup code.
	afterEach: function() {
	},
	// Runs all the tests in the suite.
	// This component can operate in a couple of modes... one where it runs all tests, and one where it runs only a single test.
	// When running all tests, it allocates a fresh child component for each test, and then uses that to do actually run the test,
	// passing along any relevant events to our owner.  The reason for this is to eliminate unintentional state sharing between tests,
	// and to make sure that lingering test code that calls finish() at a later time does not affect the state of a different test.
	runAllTests: function() {
		if (this.autoRunNextTest) {
			console.error("TestSuite.runAllTests: Already running.");
			return; // already running.
		}
		this.testNames = this.getTestNames();
		this.index = 0;
		this.autoRunNextTest = true;
		this.next();
	},
	getTestNames: function() {
		// NOTE: name no function or property test* before this point unless it's really a test
		var names = [];
		for (var key in this) {
			if (/^test/.test(key)) {
				names.push(key);
			}
		}
		return names;
	},
	next: function() {
		var testName;
		if (!this.autoRunNextTest) {
			return;
		}
		testName = this.testNames[this.index++];
		this.current = testName;
		if (testName) {
			// Allocate a new child component to run the test.
			if (this.$[testName]) {
				this.$[testName].destroy();
			}
			this.createComponent({name: testName, kind:this.kind, onBegin: "childTestBegun", onFinish: "childTestFinished"});
			this.$[testName].runTest(testName);
		} else {
			this.autoRunNextTest = false;
			this.doFinishAll();
		}
	},
	// Called on a component running in the "run a single test" mode to run the actual test.
	runTest: function(inTestName) {
		this.resetTimeout();
		this.doBegin({testName: inTestName});
		try {
			// actual test code invoked here
			this.beforeEach();
			this[inTestName]();
		} catch(x) {
			this.finish(x);
		}
	},
	timedout: function() {
		this.finish(this.timeoutMessage);
	},
	clearTimer: function() {
		window.clearTimeout(this.timer);
	},
	// Call finish() to indicate success, or finish("<reason-message>") to indicate failure.
	finish: function(inMessage) {
		enyo.asyncMethod(this, "reallyFinish", inMessage);
	},
	reallyFinish: function(inMessage) {
		// If finish has been called before, then we ignore it 
		// unless we passed previously and now we're failing.
		// We will send multiple finish events if we get a success and then a failure -- that counts as a failure.
		if (this.results) {
			console.warn("Finish called more than once in test "+this.name);
			if (!this.results.passed || !inMessage) {
				return;
			}
		}
		this.results = {
			suite: this.kindName,
			name: this.name,
			passed: !inMessage,
			logs: this.logMessages
		};
		if (inMessage) {
			if ((typeof inMessage) === "string") { // In message could be a string...
				this.results.message = inMessage;
			} else if (inMessage.message !== undefined) { // ... or an exception ...
				this.results.message = inMessage.message;
				this.results.exception = inMessage;
			} else { // ... or some other object ...
				this.results.message = inMessage.errorText || inMessage.toString();
				this.results.failValue = inMessage;
			}
			// Except for timeouts, make sure we have an exception so we can get a backtrace.
			if (!this.results.exception && inMessage !== this.timeoutMessage) {
				try {
					throw new Error(inMessage);
				} catch(e) {
					this.results.exception = e;
				}
			}
		}
		this.clearTimer();
		// Execute afterEach method, if we haven't already.
		if (this.afterEach) {
			try {
				this.afterEach();
			} catch(x) {
				this.afterEach = null; // so we don't try again when we recurse.
				this.finish(x); // we count an afterEach exception as a failure, even if the test result was originally success.
			}
			this.afterEach = null; // so we don't try again
		}
		this.doFinish({results: this.results}); // bubble results
	},
	childTestBegun: function(inSender) {
		// Pass child test begin event up, with the test name.
		// This can be used to trigger UI.
		this.triggeredNextTest = false;
	},
	childTestFinished: function(inSender, inResults) {
		// We do not destroy the child component yet, in case it calls finish() again later with a failure... in that case, we still fail it.
		if (!this.triggeredNextTest) {
			this.triggeredNextTest = true;
			enyo.asyncMethod(this, "next");
		}
	}
	
});

enyo.TestSuite.tests = [];

enyo.TestSuite.subclass = function(ctor, props) {
	// make a list of TestSuite subclasses so we can run them automatically
	// if one needs to make a TestSuite subclass that isn't actually a TestSuite itself,
	// they should assign a truthy 'testBase' property
	if (!props.testBase) {
		enyo.TestSuite.tests.push(ctor);
	}
};

// TestReporter.js

// UI kind responsible for creating test component, running tests, receiving & displaying test results.
enyo.kind({
	name: "enyo.TestReporter",
	kind: enyo.Control,
	published: {
		results: null
	},
	events: {
		onFinishAll: ""
	},
	components: [
		{name: "title", classes: "enyo-testcase-title"},
		{name: "group", classes: "enyo-testcase-group"}
	],
	classes: "enyo-testcase",
	timeout: 3000,
	create: function() {
		this.inherited(arguments);
		this.$.title.setContent(this.name);
	},
	initComponents: function() {
		this.inherited(arguments);
		this.createComponent({name: "testSuite", kind: this.name, onBegin: "testBegun", onFinish: "updateTestDisplay"});
	},
	runTests: function() {
		this.$.testSuite.runAllTests();
	},
	testBegun: function(inSender, inEvent) {
		this.$.group.createComponent({name: inEvent.testName, classes: "enyo-testcase-running", content: inEvent.testName + ": running", allowHtml: true}).render();
	},
	formatStackTrace: function(inStack) {
		var stack = inStack.split("\n");
		var out = [''];
		for (var i=0, s; s=stack[i]; i++) {
			if (s.indexOf("    at Object.do") == 0 || s.indexOf("    at Object.dispatch") == 0 || s.indexOf("TestSuite.js") != -1) {
				continue;
			}
			out.push(s);
		}
		return out.join("<br/>");
	},
	updateTestDisplay: function(inSender, inEvent) {
		var results = inEvent.results;
		var e = results.exception;
		var info = this.$.group.$[results.name];
		var content = "<b>" + results.name + "</b>: " + (results.passed ? "PASSED" : results.message);
		if (e) {
			// If we have an exception include the stack trace or file/line number.
			if (e.stack) {
				content += this.formatStackTrace(e.stack);
			} else if (e.sourceURL && e.line) {
				content += "<br/>" + e.sourceURL + ":" + e.line;
			}
			// if fail was called with an object, show the JSON.  This is likely a service request error or somesuch.
			if (results.failValue) {
				content += "<br/>" + enyo.json.stringify(results.failValue).replace(/\\n/g, "<br/>");
			}
		}
		// Show logs if we have any.
		if (!results.passed && results.logs) {
			content += "<br/>" + results.logs.join("<br/>");
		}
		info.setContent(content);
		info.setClasses("enyo-testcase-" + (results.passed ? "passed" : "failed"));
	}
});