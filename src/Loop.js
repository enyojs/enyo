require('enyo');

/**
* This module returns the Loop singleton
* @module enyo/Loop
*/
var
	kind = require('./kind');

var
	CoreObject = require('./CoreObject');

module.exports = kind.singleton({
	/** @lends module:enyo/Loop */

	/**
	* @private
	*/
	name: 'enyo.Loop',
	/**
	* @private
	*/
	kind: CoreObject,
	qs: [ [], [] ],
	qi: 0,
	/**
	* @private
	*/
	initLoopCallback: function () {
		this.lcb = this.bindSafely(function () {
			var i = this.qi,
				q = this.qs[i];

			this.qi = i ? 0 : 1;

			while (q.length) {
				(q.shift())();
			}
		});
		return this.lcb;
	},
	/**
	* @private
	*/
	trigger: function () {
		global.requestAnimationFrame(this.lcb || this.initLoopCallback());
	},
	/**
	* @private
	*/
	request: function (cb) {
		var q = this.qs[this.qi];
		q.push(cb);
		this.trigger();
	}
});
