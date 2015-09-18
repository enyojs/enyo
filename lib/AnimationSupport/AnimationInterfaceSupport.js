require('enyo');

var
	kind = require('../kind'),
	animator = require('./Core'),
	frame = require('./Frame'),
	utils = require('../utils'),
	dispatcher = require('../dispatcher');

var extend = kind.statics.extend;

kind.concatenated.push('animation');

var AnimationInterfaceSupport = {

	/**
	 * @private
	 */
	patterns: [],

	/**
	 * @private
	 */
	checkX: 0,

	/**
	 * @private
	 */
	checkY: 0,
	
	/**
	 * @private
	 */
	deltaX: 0,

	/**
	 * @private
	 */
	deltaY: 0,

	/**
	 * @private
	 */
	translateX: 0,

	/**
	 * @private
	 */
	translateY: 0,

	/**
	 * @private
	 */
	scrollValue: 0,

	/**
	 * @private
	 */
	deltaValueX: 0,

	/**
	 * @private
	 */
	deltaValueY: 0,

	/**
	 * @private
	 */
	checkDragStartX: 0,

	/**
	 * @private
	 */
	checkDragStartY: 0,

	/**
	 * @private
	 */
	deltaDragValueX: 0,

	/**
	 * @private
	 */
	deltaDragValueY: 0,

	/**
	 * @private
	 */
	eventArray: [
		"dragstart",
		"dragend",
		"drag",
		"flick",
		"down",
		"move",
		"scroll",
		"mousewheel",
		"touchstart",
		"touchmove",
		"touchend"
	],
	
	/**
	 * @public
	 */
	initialize: function () {
		var i, eventArrayLength = this.eventArray.length;
		for (i = 0; i < eventArrayLength; i++) {
			dispatcher.listen(this.node, this.eventArray[i], this.bindSafely(this.detectTheEvent) );
		} 
	},

	detectTheEvent: function (inSender, inEvent) {
		var eventType = inSender.type;
		switch (eventType) {
			case "dragstart":
				this.touchDragStart(inSender, inEvent, inSender.pageX, inSender.pageY);
				break;			
			case "drag":
				this.touchDragMove(inSender, inEvent, inSender.pageX, inSender.pageY);
				break;
			case "dragend":
				this.touchDragEnd(inSender, inEvent);
				break;
			case "flick":
				this.handleMyEvent(inSender, inEvent);
				break;
			case "down":
				this.handleMyEvent(inSender, inEvent);
				break;
			case "move":
				this.handleMyEvent(inSender, inEvent);
				break;
			case "scroll":
				this.scrollEvent(inSender, inEvent);
				break;
			case "mousewheel":
				this.mousewheelEvent(inSender, inEvent);
				break;
			case "touchstart":
				this.touchDragStart(inSender, inEvent, inSender.targetTouches[0].pageX, inSender.targetTouches[0].pageY);
				break;
			case "touchmove":
				this.touchDragMove(inSender, inEvent, inSender.targetTouches[0].pageX, inSender.targetTouches[0].pageY);
				break;
			case "touchend":
				this.touchDragEnd(inSender, inEvent);
				break;
			default:
				this.handleMyEvent(inSender, inEvent); 
		}
	},

	touchDragStart: function (inSender, inEvent, x, y) {
		this.checkX = x;
		this.checkY = y;
	},

	touchDragMove: function (inSender, inEvent, x, y) {
		var currentX = x,
			currentY = y;

		if(currentX != 0 || currentY != 0) {
			this.deltaValueX = this.checkX - currentX;
			this.deltaValueY = this.checkY - currentY;

			var finalX = -1 * this.deltaValueX,
				finalY = -1 * this.deltaValueY;

			//call commonTasks function with delta values
			this.commonTasks(this.deltaValueX, this.deltaValueX, this.deltaValueY);
		}
	},

	touchDragEnd: function (inSender, inEvent) {
		this.checkX = 0;
		this.checkY = 0;
		this.deltaValueX = 0;
		this.deltaValueY = 0; 
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

		//call commonTasks function with delta values
		this.commonTasks(delta, (-1 * this.deltaX), (-1 * this.deltaY));
		
		this.deltaX = scrollLeft;
		this.deltaY = scrollTop;
	},

	/**
	 * @public
	 */
	mousewheelEvent: function (inSender, inEvent) {
		var delta = inSender.deltaY,
			deltaX = inSender.wheelDeltaX,
			deltaY = inSender.wheelDeltaY;

		//call commonTasks function with delta values
		this.commonTasks(delta, (-1 * deltaX), (-1 * deltaY));
	},

	/**
	 * @public
	 */
	commonTasks: function (delta, deltax, deltay) {
		if (delta !== 0) {
			delta = delta / Math.abs(delta);
		}

		this.translateX = this.translateX - deltax;
		this.translateY = this.translateY - deltay;

		//Call specific interface
		if (patterns[0].name ==="Fadeable") {
			patterns[0].fadeByDelta.call(this, delta);
		} else if (patterns[0].name === "Flippable") {
			patterns[0].doFlip.call(this, delta);
		} else if (patterns[0].name === "Slideable") {
			patterns[0].slide.call(this, {translate: this.translateX + ", " + this.translateY + ", 0"} );
		}
	},

	/**
	 * @public
	 */
	handleMyEvent: function (inSender, inEvent) {
		/*TODO:*/
	},

	/**
	 * @public
	 */
	commitAnimation: function () {
		var i, len;
		if (patterns && Object.prototype.toString.call(patterns) === "[object Array]") {
			len = patterns.length;
			for (i = 0; i < len; i++) {
				if (typeof patterns[i].triggerEvent === 'function') {
					//patterns[i].triggerEvent();
				}
				
			}
		}
	},

	/**
	 * @private
	 */
	rendered: kind.inherit (function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.initialize();
		};
	})
};

module.exports = AnimationInterfaceSupport;

/**
	Hijacking original behaviour as in other Enyo supports.
*/
var sup = kind.concatHandler;

/**
 * @private
 */
kind.concatHandler = function (ctor, props, instance) {
	sup.call(this, ctor, props, instance);
	var aPattern = props.pattern;
	if (aPattern && Object.prototype.toString.call(aPattern) === "[object Array]") {
		var proto = ctor.prototype || ctor;
		extend(AnimationInterfaceSupport, proto);

		patterns = aPattern;
		var len = patterns.length;
		for (var i = 0; i < len; i++) {
			extend(patterns[i], proto);
		}
		animator.register(proto);
	}
};