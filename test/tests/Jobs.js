var
	utils = require('enyo/utils'),
	jobs = require('enyo/jobs');

describe('Jobs', function () {

	describe('usage', function () {

		describe('Jobs', function () {

			var executed;

			function invoke(priority){
				executed[priority] = true;
			}

			before(function () {
				executed  = {
					low: false,
					normal: false,
					stopped: false
				};
			});

			after(function () {
				executed = null;
			});

			it('should block lower priority jobs', function (done) {
				// register a priority which should block all jobs lower than 5
				jobs.registerPriority(4, 'testPriority');

				jobs.add(utils.bind(this, invoke, 'low'), 'low');

				jobs.add(utils.bind(this, invoke, 'normal'));
				jobs.add(utils.bind(this, invoke, 'stopped'), 3, 'stopped');
				jobs.remove('stopped');

				expect(executed.normal).to.be.true;
				expect(executed.low).to.be.false;

				jobs.unregisterPriority('testPriority');

				setTimeout(function () {
					expect(executed.stopped).to.be.false;
					expect(executed.low).to.be.true;
					done();
				}, 20);
			});
		});
	});
});