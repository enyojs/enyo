enyo.kind({
	name: "JobsTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testJobs: function() {
		var finish = this.bindSafely("finish");
		var executed = {
			low: false,
			normal: false,
			stopped: false
		};
		function invoke(priority){
			executed[priority] = true;
		}

		// register a priority which should block all jobs lower than 5
		enyo.jobs.registerPriority(4, "testPriority");

		enyo.jobs.add(enyo.bind(this, invoke, "low"), "low");

		enyo.jobs.add(enyo.bind(this, invoke, "normal"));
		enyo.jobs.add(enyo.bind(this, invoke, "stopped"), 3, "stopped");
		enyo.jobs.remove("stopped");

		if (!executed.normal) {
			finish("Normal priority job did not execute");
		} else if (executed.low) {
			finish("Low priority job did execute too early");
		}

		enyo.jobs.unregisterPriority("testPriority");

		setTimeout(function(){
			if (executed.stopped) {
				finish("stopped job has been executed");
			} else if (!executed.low) {
				finish("Low priority did not execute");
			} else {
				finish();
			}
		}, 20);
	}
});
