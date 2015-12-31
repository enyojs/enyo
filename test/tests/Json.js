var
	json = require('enyo/json');

describe('JSON', function () {

	describe('usage', function () {

		describe('simple parse', function () {
			var obj;

			before(function () {
				obj = json.parse('{"foo":"bar"}');
			});

			after(function () {
				obj = null;
			});

			it ('should parse correctly', function () {
				expect(obj.foo).to.equal('bar');
			});
		});

		describe('parse reviver', function () {

			var dates = '{"hired":"2012-01-01T12:00:00Z","fired":"2012-01-02T12:00:00Z"}',
				parsed;

			before(function () {
				parsed = json.parse(dates, function (key, value) {
					var a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
					if (a) {
						return new Date(
								Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6])
						);
					}
					return value;
				});
			});

			after(function () {
				dates = parsed = null;
			});

			it ('should parse and revive correctly', function () {
				expect(parsed.hired).to.be.an.instanceOf(Date);
			});
		});
	});
});