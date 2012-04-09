
// TestRunner.js

enyo.kind({
name: "enyo.TestRunner",
kind: enyo.Control,
index: 0,
rendered: function() {
this.inherited(arguments), this.next();
},
next: function() {
var a = enyo.TestSuite.tests[this.index++];
a && (a = a.prototype.kindName, this.createComponent({
name: a,
kind: enyo.TestReporter,
onFinishAll: "next"
}).render(), this.$[a].runTests());
}
});

// TestSuite.js

enyo.kind({
name: "enyo.TestSuite",
kind: enyo.Component,
events: {
onBegin: "",
onFinish: "",
onFinishAll: ""
},
timeout: 3e3,
timeoutMessage: "timed out",
resetTimeout: function(a) {
this.clearTimer(), this.timer = window.setTimeout(enyo.bind(this, "timedout"), a || this.timeout);
},
log: function(a) {
this.logMessages = this.logMessages || [], typeof a != "string" && (a = JSON.stringify(a)), this.logMessages.push(a);
},
beforeEach: function() {},
afterEach: function() {},
runAllTests: function() {
if (this.autoRunNextTest) {
console.error("TestSuite.runAllTests: Already running.");
return;
}
this.testNames = this.getTestNames(), this.index = 0, this.autoRunNextTest = !0, this.next();
},
getTestNames: function() {
var a = [];
for (var b in this) /^test/.test(b) && a.push(b);
return a;
},
next: function() {
var a;
if (!this.autoRunNextTest) return;
a = this.testNames[this.index++], this.current = a, a ? (this.$[a] && this.$[a].destroy(), this.createComponent({
name: a,
kind: this.kind,
onBegin: "childTestBegun",
onFinish: "childTestFinished"
}), this.$[a].runTest(a)) : (this.autoRunNextTest = !1, this.doFinishAll());
},
runTest: function(a) {
this.resetTimeout(), this.doBegin(a);
try {
this.beforeEach(), this[a]();
} catch (b) {
this.finish(b);
}
},
timedout: function() {
this.finish(this.timeoutMessage);
},
clearTimer: function() {
window.clearTimeout(this.timer);
},
finish: function(a) {
return enyo.asyncMethod(this, "reallyFinish", a), !0;
},
reallyFinish: function(a) {
if (this.results) {
console.warn("Finish called more than once in test " + this.name);
if (!this.results.passed || !a) return;
}
this.results = {
suite: this.kindName,
name: this.name,
passed: !a,
logs: this.logMessages
};
if (a) {
typeof a == "string" ? this.results.message = a : a.message !== undefined ? (this.results.message = a.message, this.results.exception = a) : (this.results.message = a.errorText || a.toString(), this.results.failValue = a);
if (!this.results.exception && a !== this.timeoutMessage) try {
throw new Error(a);
} catch (b) {
this.results.exception = b;
}
}
this.clearTimer();
if (this.afterEach) {
try {
this.afterEach();
} catch (c) {
this.afterEach = null, this.finish(c);
}
this.afterEach = null;
}
this.doFinish(this.results);
},
childTestBegun: function(a) {
this.triggeredNextTest = !1;
},
childTestFinished: function(a, b) {
this.triggeredNextTest || (this.triggeredNextTest = !0, enyo.asyncMethod(this, "next"));
}
}), enyo.TestSuite.tests = [], enyo.TestSuite.subclass = function(a, b) {
b.testBase || enyo.TestSuite.tests.push(a);
};

// TestReporter.js

enyo.kind({
name: "enyo.TestReporter",
kind: enyo.Control,
published: {
results: null
},
events: {
onFinishAll: ""
},
components: [ {
name: "title",
classes: "enyo-testcase-title"
}, {
name: "group",
classes: "enyo-testcase-group"
} ],
classes: "enyo-testcase",
timeout: 3e3,
create: function() {
this.inherited(arguments), this.$.title.setContent(this.name);
},
initComponents: function() {
this.inherited(arguments), this.createComponent({
name: "testSuite",
kind: this.name,
onBegin: "testBegun",
onFinish: "updateTestDisplay"
});
},
runTests: function() {
this.$.testSuite.runAllTests();
},
testBegun: function(a, b) {
this.$.group.createComponent({
name: b,
classes: "enyo-testcase-running",
content: b + ": running",
allowHtml: true
}).render();
},
formatStackTrace: function(a) {
var b = a.split("\n"), c = [ "" ];
for (var d = 0, e; e = b[d]; d++) {
if (e.indexOf("    at Object.do") == 0 || e.indexOf("    at Object.dispatchIndirectly") == 0 || e.indexOf("TestSuite.js") != -1) continue;
c.push(e);
}
return c.join("<br/>");
},
updateTestDisplay: function(a, b) {
var c = b.exception, d = this.$.group.$[b.name], e = "<b>" + b.name + "</b>: " + (b.passed ? "PASSED" : b.message);
c && (c.stack ? e += this.formatStackTrace(c.stack) : c.sourceURL && c.line && (e += "<br/>" + c.sourceURL + ":" + c.line), b.failValue && (e += "<br/>" + enyo.json.stringify(b.failValue).replace(/\\n/g, "<br/>"))), !b.passed && b.logs && (e += "<br/>" + b.logs.join("<br/>")), d.setContent(e), d.setClasses("enyo-testcase-" + (b.passed ? "passed" : "failed"));
}
});
