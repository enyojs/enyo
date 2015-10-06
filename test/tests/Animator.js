var
	Animator = require('enyo/Animator'),
	Component = require('enyo/Component');

describe('Animator', function () {

	describe('usage', function () {

		describe('Defer low priority tasks', function (done) {

			var test, c;

			before(function () {
				test = new Component({
					components: [
						{name: 'animation', kind: Animator, duration: 70, onEnd: 'checkJobs'},
					],
					start: function (done) {
						this.done = done;
						this.$.animation.play();
					},
					checkJobs: function (sender, event) {
						var done = this.done;
						setTimeout(function () {
							expect(c.low).to.be.true;
							expect(JSON.stringify(c.executionOrder)).to.equal('["normal","high","low"]');
							// this.done set by the test
							done();
						}, 10);
						return true;
					}
				});

				c = new Component({
					high: false,
					normal: false,
					low: false,
					executionOrder: [],
					executeHighPriorityJob: function() {
						this.executionOrder.push('high');
						this.high = true;
					},
					executeNormalPriorityJob: function() {
						this.executionOrder.push('normal');
						this.normal = true;
					},
					executeLowPriorityJob: function() {
						this.executionOrder.push('low');
						this.low = true;
					}
				});
			});

			after(function () {
				test.destroy();
				c.destroy();
				test = c = null;
			});

			it ('should prioritize jobs correctly with active animation', function (done) {
				test.start(done);

				c.startJob('LowPriorityJob', 'executeLowPriorityJob', 1, 3); // gets deferred
				c.startJob('NormalPriorityJob', 'executeNormalPriorityJob', 1); // is invoked immediately
				c.startJob('HighPriorityJob', 'executeHighPriorityJob', 1, 8); // is invoked immediately

				setTimeout(function () {
					expect(c.low).to.be.false;
					expect(c.normal).to.be.true;
					expect(c.high).to.be.true;
				}, 10);
			});

		});

		////~ Test issue described in https://github.com/enyojs/enyo/commit/d76bca80195adedca4de61f197d7b452efe78b8c#commitcomment-4082791
		////~ and fixed in https://github.com/enyojs/enyo/pull/449
		describe('Test GitHub Issue', function () {

			var test;

			before(function () {
				test = new Component({
					name: 'AnimatorStartupTest',
					components: [
						{name: 'animation', kind: Animator, duration: 50, onEnd: 'animationFinished'}
					],
					create: function () {
						Component.prototype.create.apply(this, arguments);

						this.c = new Component({
							counter: 0,
							executeStartUpJob: function () {
								this.counter++;
							}
						});
						this.c.startJob('startupjob', 'executeStartUpJob', 1, 1);
					},
					start: function (done) {
						this.done = done;
						this.$.animation.play();
					},
					animationFinished: function () {
						expect(this.c.counter).to.be.at.least(1);
						this.done();
					}
				});
			});

			after(function () {
				test.destroy();
				test = null;
			});

			it ('should run job before animation finishes', function (done) {
				test.start(done);
			});
		});
	});
});