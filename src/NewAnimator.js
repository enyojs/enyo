require('enyo');

var
	kind = require('./kind'),
	utils = require('./utils');

var
	CoreObject = require('./CoreObject'),
	Loop = require('./Loop');

module.exports = kind.singleton({
	name: 'enyo.NewAnimator',
	kind: CoreObject,
	animate: function(fn, duration) {
		var t0 = utils.perfNow(),
			cb = function() {
				var t = utils.perfNow(),
					p = Math.min(1, ((t - t0) / duration));

				fn(p);

				if (p < 1) {
					Loop.request(cb);
				}
			};

		Loop.request(cb);
	}
});
