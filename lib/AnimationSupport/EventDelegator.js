require('enyo');

var
	dispatcher = require('../dispatcher');

var EventDelegator = {

	/**
	 * @private
	 */
	eventArray: [
		"scroll",
		"mousewheel",
		"touchstart",
		"touchmove",
		"touchend"
	],
	
	/**
	 * @public
	 */
	register: function (charc) {
		var events = charc.animationEvents || this.eventArray;
		for (var i = 0, l = events.length; i < l; i++) {
			this.addRemoveListener(charc, events[i]);
		}
	},

	/**
	 * @public
	 */
	deRegister: function (charc) {
		var events = charc.animationEvents || this.eventArray;
		for (var i = 0, l = events.length; i < l; i++) {
			this.addRemoveListener(charc, events[i], true);
		}
	},

	addRemoveListener: function(charc, name, remove) {
		var d = remove ? dispatcher.stopListening : dispatcher.listen;
		d(charc.hasNode(), name, charc.bindSafely(this[name + 'Event'], charc));
	},

	touchstartEvent: function (sender, ev) {
		sender.touchX = ev.targetTouches[0].pageX;
		sender.touchY = ev.targetTouches[0].pageY;
	},

	touchmoveEvent: function (sender, ev) {
		var x = ev.targetTouches[0].pageX,
			y = ev.targetTouches[0].pageY;
			
		if(x !== 0 || y !== 0) {
			sender.animDelta[0] = x - sender.touchX;
			sender.animDelta[1] = y - sender.touchY;
			sender.animDelta[2] = 0;
			sender.touchX = x;
			sender.touchY = y;
		}
	},

	touchendEvent: function (sender, ev) {
		sender.touchX = 0;
		sender.touchY = 0;
	},
	
	/**
	 * @public
	 */
	scrollEvent: function (inSender, inEvent) {
		var delta = inSender.deltaY,
			scrollTop = inSender.target.scrollTop,
			scrollLeft = inSender.target.scrollLeft;

		if (this.scrollValue === 0) {
			this.scrollValue = inSender.target.scrollTop;
		}

		delta = inSender.target.scrollTop - this.scrollValue;

		this.deltaX = scrollLeft - this.deltaX;
		this.deltaY = scrollTop - this.deltaY;
		this.scrollValue = scrollTop;

		this.deltaX = scrollLeft;
		this.deltaY = scrollTop;


		this.animDelta[0] = delta;
		this.animDelta[1] = 0;
		this.animDelta[2] = 0;	
	},

	/**
	 * @public
	 */
	mousewheelEvent: function (sender, ev) {
		var d = ev.deltaY;
		sender.animDelta[0] = d/Math.abs(d);
		sender.animDelta[1] = 0;
		sender.animDelta[2] = 0;
	}
};

module.exports = EventDelegator;