require('enyo');

var
	dispatcher = require('../dispatcher'),
	animation = require('./Core');


var EventDelegator = {

	/**
	 * @private
	 */
	eventArray: [
		// "dragstart",
		// "dragend",
		// "drag",
		// "flick",
		// "down",
		// "move",
		// "scroll",
		"mousewheel",
		"touchstart",
		"touchmove",
		"touchend"
	],
	
	/**
	 * @public
	 */
	register: function (charc) {
		var i, len = this.eventArray.length;
		for (i = 0; i < len; i++) {
			dispatcher.listen(charc.node, this.eventArray[i], charc.bindSafely(this.detectTheEvent));
		}
	},

	/**
	 * @public
	 */
	deRegister: function (charc) {
		var i, len = this.eventArray.length;
		for (i = 0; i < len; i++) {
			dispatcher.stopListening(charc.node, this.eventArray[i], charc.bindSafely(this.detectTheEvent));
		}
	},

	detectTheEvent: function (ev) {
		var eventType = ev.type;
		switch (eventType) {
		case "dragstart":
			EventDelegator.touchDragStart(this, ev, ev.pageX, ev.pageY);
			break;			
		case "drag":
			EventDelegator.touchDragMove(this, ev, ev.pageX, ev.pageY);
			break;
		case "dragend":
			EventDelegator.touchDragEnd(this, ev);
			break;
		case "flick":
			EventDelegator.handleMyEvent(this, ev);
			break;
		case "down":
			EventDelegator.handleMyEvent(this, ev);
			break;
		case "move":
			EventDelegator.handleMyEvent(this, ev);
			break;
		case "scroll":
			EventDelegator.scrollEvent(this, ev);
			break;
		case "mousewheel":
			EventDelegator.mousewheelEvent(this, ev);
			break;
		case "touchstart":
			EventDelegator.touchDragStart(this, ev, ev.targetTouches[0].pageX, ev.targetTouches[0].pageY);
			break;
		case "touchmove":
			EventDelegator.touchDragMove(this, ev, ev.targetTouches[0].pageX, ev.targetTouches[0].pageY);
			break;
		case "touchend":
			EventDelegator.touchDragEnd(this, ev);
			break;
		default:
			EventDelegator.handleMyEvent(this, ev); 
		}
	},

	touchDragStart: function (inSender, inEvent, x, y) {
		this.checkX = x;
		this.checkY = y;
	},

	touchDragMove: function (inSender, inEvent, x, y) {
		var deltaX = x,
			deltaY = y;
			
		if(x !== 0 || y !== 0) {
			deltaX = this.checkX - x;
			deltaY = this.checkY - y;
			if(!inSender.animDelta[0]) inSender.animDelta[0] = -deltaX;
			if(!inSender.animDelta[1]) inSender.animDelta[1] = -deltaY;
			inSender.animDelta[2] = 0;

			if (inSender.handleAnimationEvents && typeof inSender.handleAnimationEvents != 'function') {
				animation.register(inSender);
			}
		}
		
	},

	touchDragEnd: function (inSender, inEvent, x, y) {
		this.checkX = 0;
		this.checkY = 0;
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

		// this.translateX = this.translateX + this.deltaX;
		// this.translateY = this.translateY + this.deltaY;

		// //call commonTasks function with delta values
		// //this.commonTasks(delta, (this.translateX), (this.translateY));
		//   this.setAnimateOne = delta;
		//   this.setAnimateTwo =   this.translateX;
		//   this.setAnimateThree =   this.translateY;

		
		this.deltaX = scrollLeft;
		this.deltaY = scrollTop;


		this.animDelta[0] = delta;
		this.animDelta[1] = 0;
		this.animDelta[2] = 0;	
	},

	/**
	 * @public
	 */
	mousewheelEvent: function (inSender, inEvent) {
		var delta = inEvent.deltaY;

		inSender.animDelta[0] = delta;
		inSender.animDelta[1] = 0;
		inSender.animDelta[2] = 0;

		// if (inSender.handleAnimationEvents && typeof inSender.handleAnimationEvents != 'function') {
		// 	animation.register(inSender);
		// }
		
	}
};

module.exports = EventDelegator;