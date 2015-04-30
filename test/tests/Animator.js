var Animator = require('../../lib/Animator');
var Component = require('../../lib/Component');

describe('Animator', function () {

	describe('usage', function () {

//		this.checkJobs = function(inSender, inEvent) {
//			setTimeout(function(){
//				if(!c.low){
//					finish("low priority job did not execute after animation has finished");
//				} else {
//					// check order of execution
//					if( JSON.stringify(c.executionOrder) !== '["normal","high","low"]' ){
//						finish("jobs did not execute in the correct order");
//					}
//
//					finish();
//				}
//			}, 10);
//			return true;
//		};
//		var animation = this.createComponent({kind: "enyo.Animator", duration: 70, onEnd: "checkJobs"});
//		var c = new enyo.Component({
//			executionOrder: [],
//			executeHighPriorityJob: function() {
//				this.executionOrder.push("high");
//				this.high = true;
//			},
//			executeNormalPriorityJob: function() {
//				this.executionOrder.push("normal");
//				this.normal = true;
//			},
//			executeLowPriorityJob: function() {
//				this.executionOrder.push("low");
//				this.low = true;
//			}
//		});
//		animation.play();
//
//		c.startJob("LowPriorityJob", "executeLowPriorityJob", 1, 3); // gets deferred
//		c.startJob("NormalPriorityJob", "executeNormalPriorityJob", 1); // is invoked immediately
//		c.startJob("HighPriorityJob", "executeHighPriorityJob", 1, 8); // is invoked immediately
//
//		setTimeout(function(){
//			if(c.low){
//				finish("low priority job execute despite being blocked by animation");
//			}
//			if(!c.normal){
//				finish("normal priority job did not execute despite overriding priority");
//			}
//			if(!c.high){
//				finish("high priority job did not execute despite overriding priority");
//			}
//		}, 10);
//	}

		describe('Defer low priority tasks', function () {

			before(function () {
			});

			after(function () {
			});

			var test = new Component({
				checkJobs: function(inSender, inEvent) {
					setTimeout(function(){
						console.log('true: ' + c.low);
						console.log(JSON.stringify(c.executionOrder));
						expect(c.low).to.be.true;
						expect(JSON.stringify(c.executionOrder)).to.equal('["normal","high","low"]');
						done();
					}, 10);
					return true;
				}
			});

			var animation = test.createComponent({
				kind: Animator,
				duration: 70,
				onEnd: "checkJobs"
			});

			var c = new Component({
				high: false,
				normal: false,
				low: false,
				executionOrder: [],
				executeHighPriorityJob: function() {
					this.executionOrder.push("high");
					this.high = true;
				},
				executeNormalPriorityJob: function() {
					this.executionOrder.push("normal");
					this.normal = true;
				},
				executeLowPriorityJob: function() {
					this.executionOrder.push("low");
					this.low = true;
				}
			});

			it ('should execute jobs in the correct order', function(done){
				animation.play();
			});


			c.startJob("LowPriorityJob", "executeLowPriorityJob", 1, 3); // gets deferred
			c.startJob("NormalPriorityJob", "executeNormalPriorityJob", 1); // is invoked immediately
			c.startJob("HighPriorityJob", "executeHighPriorityJob", 1, 8); // is invoked immediately

			it('blocks only low priority jobs', function (done) {
				setTimeout(function(){
					console.log('false: ' + c.low);
					console.log('true: ' + c.normal);
					console.log('true: ' + c.high);
					expect(c.low).to.be.false;
					expect(c.normal).to.be.true;
					expect(c.high).to.be.true;
					done();
				}, 10);
			});

		});

////~ Test issue described in https://github.com/enyojs/enyo/commit/d76bca80195adedca4de61f197d7b452efe78b8c#commitcomment-4082791
////~ and fixed in https://github.com/enyojs/enyo/pull/449
//enyo.kind({
//	name: "AnimatorStartupTest",
//	kind: enyo.TestSuite,
//	noDefer: true,
//	create: function(){
//		this.inherited(arguments);
//
//		this.animation = new enyo.Animator({duration: 50});
//		this.animation.play();
//		this.c = new enyo.Component({
//			counter: 0,
//			executeStartUpJob: function(){
//				this.counter++;
//			}
//		});
//		this.c.startJob("startupjob", "executeStartUpJob", 1, 1);
//	},
//	testStartUpjobs: function() {
//		this.animation.onEnd = this.bindSafely("animationFinished");
//	},
//	animationFinished: function(){
//		this.finish(this.c.counter ? "" : "Job didn't run even though the animation finished");
//	}
//});

		describe('Test GitHub Issue', function () {

			before(function () {
			});

			after(function () {
			});

			var test = new Component({
				name: "AnimatorStartupTest",
				create: function () {
					console.log('>>> create()');
					this.inherited(arguments);

					this.animation = new Animator({duration: 50});
					this.animation.onEnd = this.bindSafely("animationFinished");
					it ('should run job when animation finishes', function(done){
						test.done = done;
						test.animation.play();
					});
					this.c = new Component({
						counter: 0,
						executeStartUpJob: function () {
							this.counter++;
						}
					});
					this.c.startJob("startupjob", "executeStartUpJob", 1, 1);
				},
				testStartUpjobs: function () {
					this.animation.onEnd = this.bindSafely("animationFinished");
				},
				animationFinished: function () {
					expect(this.c.counter).to.be.at.least(1);
					test.done();
				}
			});
		});


	});
});


