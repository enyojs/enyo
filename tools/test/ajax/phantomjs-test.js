/* jshint phantom:true, devel: true */

// PhantomJS driver for loading Enyo Ajax tests and checking for failures
var page = require('webpage').create();

page.onConsoleMessage = function (msg) {
    console.log("JS: " + msg);
    if (msg === "TEST RUNNER FINISHED") {
		var pass = page.evaluate(function() {
			return (document.querySelector(".enyo-testcase-failed") === null);
		});
		if (pass) {
			console.log("Enyo Ajax tests passed!");
			phantom.exit(0);
		} else {
			console.log("Enyo Ajax tests failed. :(");
			phantom.exit(1);
		}
    }
};

page.onError = function(msg, trace) {
	phantom.exit(1);
};

page.open("http://localhost:8000/tools/test/ajax/index.html", function(status) {
	if (status !== "success") {
		console.log("Error loading page, status: " + status);
		phantom.exit(1);
	}
});

setTimeout(function() {
	console.log("timed out after 1 minute");
	phantom.exit(1);
}, 60 * 1000);