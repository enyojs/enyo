require('enyo');

/**
* This modules exposes API's for controlling animations.
* @private
*/
module.exports = {

	timeline: 0,
	_cachedValue: 0,
	_frameSpeed: 0,
	_startTime: 0,

	cache: function(actor) {
		actor = actor || this;
		if(actor._frameSpeed === 0){
			actor._frameSpeed = actor._cachedValue;
		}
		this.animating = true;
	},
	
	play: function (actor) {
		actor = actor || this;
		actor._frameSpeed = 1;
		this.animating = true;
		actor._startTime = (actor.delay || 0);
	},

	resume: function(actor) {
		this.cache(actor);
		actor = actor || this;
		actor._frameSpeed *= 1;
	},

	pause: function (actor) {
		actor = actor || this;
		actor._cachedValue = actor._frameSpeed;
		actor._frameSpeed = 0;
	},

	reverse: function (actor) {
		this.cache(actor);
		actor = actor || this;
		actor._frameSpeed *= -1;
	},

	fast: function (mul, actor) {
		this.cache(actor);
		actor = actor || this;
		actor._frameSpeed *= mul;
	},

	slow: function (mul, actor) {
		this.cache(actor);
		actor = actor || this;
		actor._frameSpeed *= mul;
	},

	stop: function (actor) {
		actor = actor || this;
		actor._cachedValue = 1;
		actor._frameSpeed = 0;
		actor.timeline = 0;
	},

	rolePlay: function (t, actor) {
		actor = actor || this;
		if (!actor.timeline || actor.timeline < 0) actor.timeline = 0;
		actor.timeline += _rolePlay(t, actor._frameSpeed);
		return actor.timeline;
	}
};

function _rolePlay(t, mul) {
	return mul * t;
}