enyo.kind({
	name: "JSONTest",
	kind: enyo.TestSuite,
	testJsonStringifyExists: function() {
		enyo.json.stringify();
		this.finish();
	},
	testJsonParseExists: function() {
		enyo.json.parse();
		this.finish();
	},
	testJsonParseSimple: function() {
		var obj = enyo.json.parse('{"foo":"bar"}'), err;
		if (!obj.foo || obj.foo !== "bar") {
			err = "JSON string did not parse correctly";
		}
		this.finish(err);
	},
	testJsonParseReviver: function() {
		var dates = '{"hired":"2012-01-01T12:00:00Z","fired":"2012-01-02T12:00:00Z"}',
		parsed = enyo.json.parse(dates, function(key, value) {
			var a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
			if ( a ) {
				return new Date(
					Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6])
				);
			}
			return value;
		}),
		err;
		if (!(parsed.hired instanceof Date)) {
			err = "JSON string did not parse and revive correctly";
		}
		this.finish(err);
	}
});