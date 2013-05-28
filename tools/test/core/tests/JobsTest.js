enyo.kind({
	name: "JobsTest",
	kind: enyo.TestSuite,
	testJobs: function() {
		var finish = this.bindSafely("finish");
		var executed = {
			low: false,
			normal: false
		};
		function invoke(priority){
			executed[priority] = true;
		}

		// register a priority which should block all jobs lower than 5
		enyo.jobs.registerPriority(4, "testPriority");

		enyo.jobs.add("low", enyo.bind(this, invoke, "low"));

		enyo.jobs.add(enyo.bind(this, invoke, "normal"));
		if (!executed.normal) {
			finish("Normal priority job did not execute");
		}

		setTimeout(function(){
			if (executed.low) {
				finish("Low priority job did execute too early");
			}

			enyo.jobs.unregisterPriority("testPriority");

			if (!executed.low) {
				finish("Low priority did not execute");
			} else {
				finish();
			}
		}, 20);
	}
});
