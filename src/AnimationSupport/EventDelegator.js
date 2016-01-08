require('enyo');

var
	dispatcher = require('../dispatcher'),
	emitter = require('../EventEmitter');


var eventsMap = {
	vdrag: "drag",
	vscroll: "scroll",
	vmousewheel: "mousewheel",
	vtouch: "touchmove",
	drag: "vdrag",
	scroll: "vscroll",
	mousewheel: "vmousewheel",
	touchmove: "vtouch"
};
/**
* This module handles the animation events for the character.
* If the character has opted to have animations handled by animation framework,
* then it can add "handleAnimationEvents" as true as its property.
* The character can also mention which events he wants to be handled by the framework by
* providing list of animation events in "animationEvents" block like;
* { 
*	name: "myKind",
*	animationEvents: [
*		"scroll",
*		"mousewheel",
*		"touchstart",
*		"touchmove",
*		"touchend"
*	]
* }
*
* By default these events are handled within the framework(others for now have to be handled by the application).
* 
* This module is here temporarily, need to have a proper mechanism 
* like dispatcher to handle animation related events along with application events.
* 
* @module enyo/AnimationSupport/EventDelegator
*/
var EventDelegator = {

	/**
	* Attaches the evnet handlers to the character either its own events or
	* else default events with the framework. As of now only these events are 
	* supported;
	* - scroll
	* - touch
	* - mousewheel
	* @public
	*/
	register: function (events) {
		events = events || {};
		for (var key in events) {
			this.addRemoveListener(charc, key, events[key]);
		}
	},

	/**
	* Detaches the evnet handlers from the character either its own events or
	* else default events from with the framework. As of now only these events are 
	* supported;
	* - scroll
	* - touch
	* - mousewheel
	* @public
	*/
	deRegister: function (charc) {
		var events = charc.handleAnimationEvents || {};
		for (var key in events) {
			this.addRemoveListener(charc, key, events[key], true);
		}
	},

	/**
	* @private
	*/
	addRemoveListener: function(charc, name, callback, remove) {
		var d = remove ? dispatcher.stopListening : dispatcher.listen,
			e = eventsMap[name];
		d(charc.hasNode(), e, charc.bindSafely(this[e + 'Event'], charc));

		var fn = remove ? emitter.off : emitter.on;
		fn.apply(emitter, [name, charc[callback], charc]);
	},

	/**
	* @private
	*/
	emitEvent: function(charc, data) {
		return emitter.vemit.call(emitter, data);
	},

	/**
	* @private
	*/
	touchstartEvent: function (sender, inEvent) {
		sender.touchX = inEvent.targetTouches[0].pageX;
		sender.touchY = inEvent.targetTouches[0].pageY;
	},

	/**
	* @private
	*/
	touchmoveEvent: function (sender, inEvent) {
		var x = inEvent.targetTouches[0].pageX,
			y = inEvent.targetTouches[0].pageY;
			
		if(x !== 0 || y !== 0) {
			/*sender.animDelta[0] = sender.touchX - x;
			sender.animDelta[1] = sender.touchY - y;
			sender.animDelta[2] = 0;*/

			// var o = {
			// 	dX: (sender.touchX - x),
			// 	dY: (sender.touchY - y),
			// 	dZ: 0
			// };
			// sender.setAnimationDelta(o);
			// sender.touchX = x;
			// sender.touchY = y;

			// this.eventName = eventsMap[inEvent.type];

			console.log(inEvent.targetTouches[0]);

			inEvent.dX = inEvent.deltaX;
			inEvent.dY = inEvent.deltaY;
			inEvent.dZ = 0;
			inEvent.vtype = eventsMap[inEvent.type];

			inSender.setAnimationDelta(inEvent);
			inSender._virtualEvent = eventsMap[inEvent.type];
		}
	},

	/**
	* @private
	*/
	touchendEvent: function (sender, ev) {
		sender.touchX = 0;
		sender.touchY = 0;
	},
	
	/**
	* @private
	*/
	scrollEvent: function (inSender, inEvent) {
		inEvent.dX = inEvent.deltaX;
		inEvent.dY = inEvent.deltaY;
		inEvent.dZ = 0;
		inEvent.vtype = eventsMap[inEvent.type];

		inSender.setAnimationDelta(inEvent);
		inSender._virtualEvent = eventsMap[inEvent.type];
	},

	/**
	* @private
	*/
	dragstartEvent: function (inSender, inEvent) {
		this.dragLeft = inEvent.offsetX,
		this.dragTop = inEvent.offsetY;
	},

	/**
	* @private
	*/
	dragEvent: function (inSender, inEvent) {
		var dragLeft = inEvent.offsetX,
			dragTop = inEvent.offsetY;
		if (dragLeft && dragTop) {
			this.deltaX = this.dragLeft - dragLeft;
			this.deltaY = this.dragTop - dragTop;
			
			this.dragLeft = dragLeft,
			this.dragTop = dragTop;

			/*this.animDelta[0] = this.deltaX;
			this.animDelta[1] = this.deltaY;
			this.animDelta[2] = 0;*/

			var o = {
				dX: this.deltaX,
				dY: this.deltaY,
				dZ: 0
			};
			this.setAnimationDelta(o);

			this.eventName = eventsMap[inEvent.type];
		}
	},

	/**
	* @private
	*/
	mousewheelEvent: function (sender, inEvent) {
		inEvent.dX = inEvent.deltaX;
		inEvent.dY = inEvent.deltaY;
		inEvent.dZ = 0;
		inEvent.vtype = eventsMap[inEvent.type];
		sender.setAnimationDelta(inEvent);
	}
};

module.exports = EventDelegator;