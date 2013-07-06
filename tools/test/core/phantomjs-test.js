/* jshint phantom:true, devel: true */

var RED   = "\x1b\x5b31;1m";
var GREEN = "\x1b\x5b32;1m";
var RESET = "\x1b\x5b0m";

function passLog(msg) {
	console.log(GREEN + "JS: " + msg + RESET);
}

function failLog(msg) {
	console.log(RED + "JS: " + msg + RESET);
}

// PhantomJS driver for loading Enyo core tests and checking for failures
var page = require('webpage').create();

var totalMsgs = 0;

page.onConsoleMessage = function (msg) {
	++totalMsgs;
	if (msg.match(/FAILED TEST/)) {
		failLog(msg);
	} else {
		console.log("JS: " + msg);
	}
	if (msg === "TEST RUNNER FINISHED") {
		var pass = totalMsgs > 1 &&
			page.evaluate(function() {
				return (document.querySelector(".enyo-testcase-failed") === null);
			});
		if (pass) {
			passLog("Enyo core tests passed!");
			phantom.exit(0);
		} else {
			failLog("Enyo core tests failed. :(");
			phantom.exit(1);
		}
	}
};

page.onError = function(msg, trace) {
	phantom.exit(1);
};

page.open("tools/test/core/index.html", function(status) {
	if (status !== "success") {
		failLog("Error loading page, status: " + status);
		phantom.exit(1);
	}
});

setTimeout(function() {
	failLog("timed out after 1 minute");
	phantom.exit(1);
}, 60 * 1000);