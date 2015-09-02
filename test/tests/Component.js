var kind = require('enyo/kind'),
	jobs = require('enyo/jobs'),
	Component = require('enyo/Component'),
	Control = require('enyo/Control'),
	Anchor = require('enyo/Anchor'),
	Button = require('enyo/Button');

describe('Component', function () {

	describe('usage', function () {

		describe('Start job', function () {
			var c;

			before(function () {
				c = new Component();
			});

			after(function () {
				c.destroy();
			});

			it('should start job', function (done) {
				c.startJob('testStartJob', function () {
					done();
				}, 10);
			});
		});

		describe('Start job', function () {
			var c;

			before(function () {
				c = new Component({
					pass: function() {
						this.done();
					}
				});
			});

			after(function () {
				c.destroy();
			});

			it('should start job with string name', function (done) {
				c.done = done;
				c.startJob('testStartJob', 'pass', 10);
			});
		});

		describe('Stop job', function () {
			var c, ran;

			before(function () {
				ran = false;
				c = new Component();
			});

			after(function () {
				c.destroy();
			});

			it('should stop job', function (done) {
				c.startJob('testStopJob', function() {
					ran = true;
					done(new Error('job wasn\'t stopped'));
				}, 10);

				c.stopJob('testStopJob');

				setTimeout(function () {
					if (!ran) done();
				}, 30);
			});
		});

		describe('Stop deferred job', function () {
			var c, ran;

			before(function () {
				ran = false;
				c = new Component();
			});

			after(function () {
				c.destroy();
			});

			it('should stop job', function (done) {

				c.startJob('testStopJob', function() {
					ran = true;
					done(new Error('job wasn\'t stopped'));
				}, 10);

				jobs.registerPriority(8, 'high');

				setTimeout(function () {
					c.stopJob('testStopJob');
					jobs.unregisterPriority('high');
					if (!ran) done();
				}, 20);

			});
		});

		describe('Stop job on destroy', function () {
			var c, ran;

			before(function () {
				ran = false;
				c = new Component();
			});

			after(function () {
				c.destroy();
			});

			it('should stop job', function (done) {
				c.startJob('testDestroyJob', function() {
					ran = true;
					done(new Error('job wasn\'t stopped'));
				}, 10);
				c.destroy();

				setTimeout(function () {
					if (!ran) done();
				}, 30);
			});
		});

		describe('Throttle job', function () {
			var c;

			before(function () {
				c = new Component({
					number: 0,
					increment: function() {
						this.number++;
					}
				});
			});

			after(function () {
				c.destroy();
			});

			it('should throttle job', function (done) {
				c.throttleJob('testThrottleJob', 'increment', 20);
				setTimeout(function () {
					c.throttleJob('testThrottleJob', c.increment, 20);
				}, 5);
				setTimeout(function () {
					c.throttleJob('testThrottleJob', 'increment', 20);
				}, 15);
				setTimeout(function () {
					c.throttleJob('testThrottleJob', c.increment, 20);
				}, 25);
				setTimeout(function () {
					if (c.number === 2) {
						done();
					} else {
						done(new Error('too many or too few calls'));
					}
				}, 30);
			});
		});

		describe('Start job with priority number', function () {
			var c;

			before(function () {
				c = new Component({
					number: 0,
					increment: function() {
						this.number++;
					}
				});
			});

			after(function () {
				c.destroy();
			});

			it('should start job', function (done) {
				c.startJob('increment', 'increment', 1);
				setTimeout(function () {
					if (c.number !== 1) {
						done(new Error('Job did not execute even though it is not blocked'))
					} else {
						done()
					}
				}, 20);
			});
		});

		describe('Start job with priority number blocked', function () {
			var c;

			before(function () {
				c = new Component({
					number: 0,
					increment: function() {
						this.number++;
					}
				});
			});

			after(function () {
				c.destroy();
			});

			it('should start job', function (done) {
				jobs.registerPriority(5, 'testPriority');
				c.startJob('incrementLow', 'increment', 1, 1); // number should be 1
				c.startJob('incrementHigh', 'increment', 1, 6); // number should be 2

				setTimeout(function() {
					if (c.number !== 1) {
						done(new Error('High priority did not execute'));
					}

					jobs.unregisterPriority('testPriority');

					if (c.number !== 2) {
						done(new Error('Low priority did not execute'));
					} else {
						done();
					}
				}, 20);

			});
		});

		describe('Override component props', function () {

			it('should exist', function () {
				// Base kind
				var C1 = kind({
					name: 'componenttestBaseKind',
					components: [
						{name: 'red', content: 'Red', components: [
							{name: 'orange', content: 'Orange', components: [
								{kind: Anchor, name: 'green', content: 'Green', classes: 'green', style: 'background: green;'}
							]}
						]},
						{name: 'purple', content: 'Purple', classes: 'purple', style: 'background: purple;'},
						{name: 'blue', content: 'Blue'}
					]
				});
				// Subkind: override kind & content
				var C2 = kind({
					name: 'componenttestSubKind',
					kind: C1,
					componentOverrides: {
						purple: {kind: Button, content: 'Overridden purple', classes: 'over-purple', style: 'background: over-purple;'},
						green: {kind: Button, newMethod: function () {throw 'I EXIST';}, content: 'Overridden green', classes: 'over-green', style: 'background: over-green;'}
					}
				});
				// Sub-sub kind: override kind & content again,
				var C3 = kind({
					name: 'componenttestSubSubKind',
					kind: C2,
					componentOverrides: {
						purple: {kind: Anchor, content: 'Again purple', classes: 'again-purple', style: 'background: again-purple;'},
						green: {kind: Anchor, content: 'Again green', classes: 'again-green', style: 'background: again-green;'}
					}
				});
				var baseKind = new C1();
				var subKind = new C2();
				var subSubKind = new C3();
				checkOverrides(baseKind, subKind, subSubKind);
			});

			function checkOverrides(baseKind, subKind, subSubKind) {

				expect(baseKind.$.purple.kind).to.equal(Control);
				expect(baseKind.$.green.kind).to.equal(Anchor);

				expect(baseKind.$.purple.content).to.equal('Purple');
				expect(baseKind.$.green.content).to.equal('Green');

				expect(baseKind.$.purple.classes).to.equal('purple');
				expect(baseKind.$.green.classes).to.equal('green');

				expect(subKind.$.purple.kind).to.equal(Button);
				expect(subKind.$.green.kind).to.equal(Button);

				expect(subKind.$.purple.content).to.equal('Overridden purple');
				expect(subKind.$.green.content).to.equal('Overridden green');

				expect(/^.*purple over-purple$/.test(subKind.$.purple.classes)).to.be.true;
				expect(/^.*green over-green$/.test(subKind.$.green.classes)).to.be.true;

				expect(subSubKind.$.purple.kind).to.equal(Anchor);
				expect(subSubKind.$.green.kind).to.equal(Anchor);

				expect(subSubKind.$.purple.content).to.equal('Again purple');
				expect(subSubKind.$.green.content).to.equal('Again green');

				expect(/^.*purple over-purple again-purple$/.test(subSubKind.$.purple.classes)).to.be.true;
				expect(/^.*green over-green again-green$/.test(subSubKind.$.green.classes)).to.be.true;

				expect(subSubKind.$.purple.style.indexOf('background: again-purple;')).to.be.at.least(0);
				expect(subSubKind.$.green.style.indexOf('background: again-green;')).to.be.at.least(0);

				expect(subKind.$.green.newMethod).to.not.exist;
			}
		});
	});
});