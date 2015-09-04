var
	Async = require('enyo/Async');

describe('Async', function () {

	describe('usage', function () {
		var a;

		beforeEach(function () {
			a = new Async();
		});

		afterEach(function () {
			a.destroy();
			a = null;
		});

		describe('Async fail', function () {
			it('should fail', function (done) {
				a.response(this, function (inSender, inValue) {
					done(new Error('Error response should not be passed to success handler'));
				})
				.error(this, function () {
					done();
				})
				.fail('foo');
			});
		});

		describe('Async inner fail', function () {
			it('should fail', function (done) {
				a.response(this, function (inSender, inValue) {
					inSender.fail('always fail');
				})
				.error(this, function () {
					done();
				})
				.fail('foo');
			});
		});

		describe('Async inner fail recover', function () {
			var fail = false;

			it('should recover', function (done) {
				a.response(this, function (inSender, inValue) {
					inSender.fail('first response always fails');
				})
				.error(function(inSender) {
					inSender.recover();
					return 'recovery response';
				})
				.response(this, function(inSender, inValue) {
					expect(inValue).to.equal('recovery response');
					done();
				})
				.respond('foo');
			});
		});
	});
});