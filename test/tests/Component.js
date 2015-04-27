var kind = require('../../lib/kind');
var Component = require('../../lib/Component');
var Control = require('../../lib/Control');
var Anchor = require('../../lib/Anchor');
var Button = require('../../lib/Button');
var jobs = require('../../lib/jobs');

describe('Component', function () {

	describe('usage', function () {

//	testStartJob: function() {
//		var finish = this.bindSafely("finish");
//		var c = new enyo.Component();
//		c.startJob("testStartJob", function() {
//			finish();
//		}, 10);
//	},

		describe('Start job', function () {

			var c = new Component();

			before(function () {
			});

			after(function () {
			});

			it('should start job', function (done) {

				c.startJob("testStartJob", function () {
					done();
				}, 10);

			});
		});

//	testStartJobStringName: function() {
//		var finish = this.bindSafely("finish");
//		var c = new enyo.Component({
//			pass: function() {
//				finish();
//			}
//		});
//		c.startJob("testStartJobStringName", "pass", 10);
//	},

		describe('Start job', function () {

			before(function () {
			});

			after(function () {
			});

			it('should start job with string name', function (done) {

				var c = new Component({
					done: done,
					pass: function() {
						this.done();
					}
				});

				c.startJob("testStartJob", "pass", 10);

			});
		});

//	testStopJob: function() {
//		var finish = this.bindSafely("finish");
//		var c = new enyo.Component();
//		c.startJob("testStopJob", function() {
//			finish("job wasn't stopped");
//		}, 10);
//		c.stopJob("testStopJob");
//		setTimeout(function() {
//			finish();
//		}, 30);
//	},

		describe('Stop job', function () {

			var ran = false;
			var c = new Component();

			before(function () {
			});

			after(function () {
			});

			it('should stop job', function (done) {

				c.startJob("testStopJob", function() {
					ran = true;
					done(new Error("job wasn't stopped"));
				}, 10);

				c.stopJob("testStopJob");

				setTimeout(function() {
					if (!ran) {
						done()
					}
				}, 30);

			});
		});

//	testStopDeferredJob: function() {
//		var finish = this.bindSafely("finish");
//		var c = new enyo.Component();
//		c.startJob("testStopJob", function() {
//			finish("job wasn't stopped");
//		}, 10);
//
//		enyo.jobs.registerPriority(8, "high");
//
//		setTimeout(function() {
//			c.stopJob("testStopJob");
//			enyo.jobs.unregisterPriority("high");
//			finish();
//		}, 20);
//	},

		describe('Stop deferred job', function () {

			var ran = false;
			var c = new Component();

			before(function () {
			});

			after(function () {
			});

			it('should stop job', function (done) {

				c.startJob("testStopJob", function() {
					ran = true;
					done(new Error("job wasn't stopped"));
				}, 10);

				jobs.registerPriority(8, "high");

				setTimeout(function() {
					c.stopJob("testStopJob");
					jobs.unregisterPriority("high");
					if (!ran) {
						done()
					}
				}, 20);

			});
		});

//	testDestroyJob: function() {
//		var finish = this.bindSafely("finish");
//		var c = new enyo.Component();
//		c.startJob("testDestroyJob", function() {
//			finish("job wasn't stopped on destroy");
//		}, 10);
//		c.destroy();
//		setTimeout(function() {
//			finish();
//		}, 30);
//	},

		describe('Stop job on destroy', function () {

			var ran = false;
			var c = new Component();

			before(function () {
			});

			after(function () {
			});

			it('should stop job', function (done) {

				c.startJob("testDestroyJob", function() {
					ran = true;
					done(new Error("job wasn't stopped"));
				}, 10);

				c.destroy();

				setTimeout(function() {
					if (!ran) {
						done()
					}
				}, 30);

			});
		});

//	testThrottleJob: function() {
//		var finish = this.bindSafely("finish");
//		var c = new enyo.Component({
//			number: 0,
//			increment: function() {
//				this.number++;
//			}
//		});
//		c.throttleJob("testThrottleJob", "increment", 20);
//		setTimeout(function () {
//			c.throttleJob("testThrottleJob", c.increment, 20);
//		}, 5);
//		setTimeout(function () {
//			c.throttleJob("testThrottleJob", "increment", 20);
//		}, 15);
//		setTimeout(function () {
//			c.throttleJob("testThrottleJob", c.increment, 20);
//		}, 25);
//		setTimeout(function() {
//			if (c.number === 2) {
//				finish();
//			} else {
//				finish("too many or too few calls");
//			}
//		}, 30);
//	},

		describe('Throttle job', function () {

			var ran = false;
			var c = new Component({
				number: 0,
				increment: function() {
					this.number++;
				}
			});

			before(function () {
			});

			after(function () {
			});

			it('should throttle job', function (done) {

				c.throttleJob("testThrottleJob", "increment", 20);
				setTimeout(function () {
					c.throttleJob("testThrottleJob", c.increment, 20);
				}, 5);
				setTimeout(function () {
					c.throttleJob("testThrottleJob", "increment", 20);
				}, 15);
				setTimeout(function () {
					c.throttleJob("testThrottleJob", c.increment, 20);
				}, 25);
				setTimeout(function() {
					if (c.number === 2) {
						done();
					} else {
						done(new Error('too many or too few calls'));
					}
				}, 30);

			});
		});

//	testStartJobPriorityNumber: function() {
//		var finish = this.bindSafely("finish");
//		var c = new enyo.Component({
//			number: 0,
//			increment: function() {
//				this.number++;
//			}
//		});
//		c.startJob("increment", "increment", 1); // number should be 1
//
//		setTimeout(function(){
//			if (c.number !== 1) {
//				finish("job did not execute even though its not blocked");
//			} else {
//				finish();
//			}
//		}, 20);
//	},

		describe('Start job with priority number', function () {

			var c = new Component({
				number: 0,
				increment: function() {
					this.number++;
				}
			});

			before(function () {
			});

			after(function () {
			});

			it('should start job', function (done) {

				c.startJob("increment", "increment", 1);

				setTimeout(function() {
					if (c.number !== 1) {
						done(new Error('Job did not execute even though it is not blocked'))
					} else {
						done()
					}
				}, 20);

			});
		});

//	testStartJobPriorityNumberBlocked: function() {
//		var finish = this.bindSafely("finish");
//		var c = new enyo.Component({
//			number: 0,
//			increment: function() {
//				this.number++;
//			}
//		});
//		enyo.jobs.registerPriority(5, "testPriority");
//		c.startJob("incrementLow", "increment", 1, 1); // number should be 1
//		c.startJob("incrementHigh", "increment", 1, 6); // number should be 2
//
//		setTimeout(function(){
//			if (c.number !== 1) {
//				finish("High priority did not execute");
//			}
//			enyo.jobs.unregisterPriority("testPriority");
//			if (c.number !== 2) {
//				finish("Low priority did not execute");
//			} else {
//				finish();
//			}
//		}, 20);
//	},

		describe('Start job with priority number blocked', function () {

			var c = new Component({
				number: 0,
				increment: function() {
					this.number++;
				}
			});

			before(function () {
			});

			after(function () {
			});

			it('should start job', function (done) {

				jobs.registerPriority(5, "testPriority");
				c.startJob("incrementLow", "increment", 1, 1); // number should be 1
				c.startJob("incrementHigh", "increment", 1, 6); // number should be 2

				setTimeout(function() {
					if (c.number !== 1) {
						done(new Error("High priority did not execute"));
					}

					jobs.unregisterPriority("testPriority");

					if (c.number !== 2) {
						done(new Error("Low priority did not execute"));
					} else {
						done();
					}
				}, 20);

			});
		});

//	testOverrideComponentProps: function() {
//		// Base kind
//		var C1 = enyo.kind({
//			name: "componenttest.BaseKind",
//			components: [
//				{name:"red", content:"Red", components: [
//					{name:"orange", content:"Orange", components: [
//						{kind:"enyo.Anchor", name:"green", content:"Green", classes:"green", style:"background:green;"}
//					]}
//				]},
//				{name:"purple", content:"Purple", classes:"purple", style:"background:purple;"},
//				{name:"blue", content:"Blue"}
//			]
//		});
//		// Subkind: override kind & content
//		var C2 = enyo.kind({
//			name: "componenttest.SubKind",
//			kind: "componenttest.BaseKind",
//			componentOverrides: {
//				purple: {kind:"enyo.Button", content:"Overridden purple", classes:"over-purple", style:"background:over-purple;"},
//				green: {kind:"enyo.Button", newMethod: function () {throw "I EXIST";}, content:"Overridden green", classes:"over-green", style:"background:over-green;"}
//			}
//		});
//		// Sub-sub kind: override kind & content again,
//		var C3 = enyo.kind({
//			name: "componenttest.SubSubKind",
//			kind: "componenttest.SubKind",
//			componentOverrides: {
//				purple: {kind:"enyo.Anchor", content:"Again purple", classes:"again-purple", style:"background:again-purple;"},
//				green: {kind:"enyo.Anchor", content:"Again green", classes:"again-green", style:"background:again-green;"}
//			}
//		});
//		var baseKind = new C1();
//		var subKind = new C2();
//		var subSubKind = new C3();
//		this.checkOverrides(baseKind, subKind, subSubKind);
//
//		// Test a second set, to catch any possible differences with deferred constructor scheme
//		baseKind = new C1();
//		subKind = new C2();
//		subSubKind = new C3();
//		this.checkOverrides(baseKind, subKind, subSubKind);
//
//		this.finish();
//	},
//	checkOverrides: function(baseKind, subKind, subSubKind) {
//		if ((baseKind.$.purple.kindName != "enyo.Control") ||
//				(baseKind.$.green.kindName != "enyo.Anchor")) {
//			throw "Overrides should not modify base kind: unexpected kindName";
//		}
//		if ((baseKind.$.purple.content != "Purple") ||
//				(baseKind.$.green.content != "Green")) {
//			throw "Overrides should not modify base kind: unexpected content";
//		}
//		if ((baseKind.$.purple.classes != "purple") ||
//				(baseKind.$.green.classes != "green")) {
//			throw "Overrides should not modify base kind: unexpected classes";
//		}
//
//		if ((subKind.$.purple.kindName != "enyo.Button") ||
//				(subKind.$.green.kindName != "enyo.Button")) {
//			throw "Subclass overrides were not applied properly: unexpected kindName";
//		}
//		if ((subKind.$.purple.content != "Overridden purple") ||
//				(subKind.$.green.content != "Overridden green")) {
//			throw "Subclass overrides were not applied properly: unexpected content";
//		}
//		if (!/^.*purple over-purple$/.test(subKind.$.purple.classes) ||
//				!/^.*green over-green$/.test(subKind.$.green.classes)) {
//			throw "Subclass overrides were not applied properly: unexpected classes";
//		}
//
//		if ((subSubKind.$.purple.kindName != "enyo.Anchor") ||
//				(subSubKind.$.green.kindName != "enyo.Anchor")) {
//			throw "Multiply-subclassed overrides were not applied properly: unexpeted kindName";
//		}
//		if ((subSubKind.$.purple.content != "Again purple") ||
//				(subSubKind.$.green.content != "Again green")) {
//			throw "Multiply-subclassed overrides were not applied properly: unexpeted content";
//		}
//		if (!/^.*purple over-purple again-purple$/.test(subSubKind.$.purple.classes) ||
//				!/^.*green over-green again-green$/.test(subSubKind.$.green.classes)) {
//			throw "Multiply-subclassed overrides were not applied properly: unexpeted classes: " + subSubKind.$.green.classes;
//		}
//		if ((subSubKind.$.purple.style.indexOf("background: again-purple;") < 0) ||
//				(subSubKind.$.green.style.indexOf("background: again-green;") < 0)) {
//			throw "Multiply-subclassed overrides were not applied properly: unexpected style";
//		}
//
//		try {
//			subKind.$.green.newMethod();
//		} catch (e) {
//			if (e == "I EXIST") {
//				throw "Method should not be on child";
//			}
//		}
//	}

		describe('Override component props', function () {

			before(function () {
			});

			after(function () {
			});

			it('should exist', function () {

				// Base kind
				var C1 = kind({
					name: "componenttestBaseKind",
					components: [
						{name:"red", content:"Red", components: [
							{name:"orange", content:"Orange", components: [
								{kind: Anchor, name:"green", content:"Green", classes:"green", style:"background:green;"}
							]}
						]},
						{name:"purple", content:"Purple", classes:"purple", style:"background:purple;"},
						{name:"blue", content:"Blue"}
					]
				});
				// Subkind: override kind & content
				var C2 = kind({
					name: "componenttestSubKind",
					kind: C1,
					componentOverrides: {
						purple: {kind: Button, content:"Overridden purple", classes:"over-purple", style:"background:over-purple;"},
						green: {kind: Button, newMethod: function () {throw "I EXIST";}, content:"Overridden green", classes:"over-green", style:"background:over-green;"}
					}
				});
				// Sub-sub kind: override kind & content again,
				var C3 = kind({
					name: "componenttestSubSubKind",
					kind: C2,
					componentOverrides: {
						purple: {kind: Anchor, content:"Again purple", classes:"again-purple", style:"background:again-purple;"},
						green: {kind: Anchor, content:"Again green", classes:"again-green", style:"background:again-green;"}
					}
				});
				var baseKind = new C1();
				var subKind = new C2();
				var subSubKind = new C3();
				checkOverrides(baseKind, subKind, subSubKind);

				// Test a second set, to catch any possible differences with deferred constructor scheme
				baseKind = new C1();
				subKind = new C2();
				subSubKind = new C3();
				checkOverrides(baseKind, subKind, subSubKind);

			});

			function checkOverrides(baseKind, subKind, subSubKind) {

				//expect(baseKind.$.purple.kindName).to.equal('enyo.Control');
				//expect(baseKind.$.green.kindName).to.equal('enyo.Anchor');

				expect(baseKind.$.purple.content).to.equal('Purple');
				expect(baseKind.$.green.content).to.equal('Green');

				expect(baseKind.$.purple.classes).to.equal('purple');
				expect(baseKind.$.green.classes).to.equal('green');


				//expect(subKind.$.purple.kindName).to.equal('enyo.Button');
				//expect(subKind.$.green.kindName).to.equal('enyo.Button');

				expect(subKind.$.purple.content).to.equal('Overridden purple');
				expect(subKind.$.green.content).to.equal('Overridden green');

				expect(/^.*purple over-purple$/.test(subKind.$.purple.classes)).to.be.true;
				expect(/^.*green over-green$/.test(subKind.$.green.classes)).to.be.true;

				//expect(subSubKind.$.purple.kindName).to.equal('enyo.Anchor');
				//expect(subSubKind.$.green.kindName).to.equal('enyo.Anchor');

				expect(subSubKind.$.purple.content).to.equal('Again purple');
				expect(subSubKind.$.green.content).to.equal('Again green');

				expect(/^.*purple over-purple again-purple$/.test(subSubKind.$.purple.classes)).to.be.true;
				expect(/^.*green over-green again-green$/.test(subSubKind.$.green.classes)).to.be.true;


				expect(subSubKind.$.purple.style.indexOf("background: again-purple;")).to.be.at.least(0);
				expect(subSubKind.$.green.style.indexOf("background: again-green;")).to.be.at.least(0);

				expect(subKind.$.green.newMethod).to.not.exist;
			}
		});
	});
});

