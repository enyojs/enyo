require('enyo');

/**
 * Contains the declaration for the {@link module:enyo/TranslateScrollStrategy~TranslateScrollStrategy} kind.
 * @module enyo/TranslateScrollStrategy
 */

var
	kind = require('./kind'),
	dispatcher = require('./dispatcher');

var
	TouchScrollStrategy = require('./TouchScrollStrategy'),
	Dom = require('./dom');

/**
* {@link module:enyo/TranslateScrollStrategy~TranslateScrollStrategy} is a helper [kind]{@glossary kind} that extends
* {@link module:enyo/TouchScrollStrategy~TouchScrollStrategy}, optimizing it for scrolling environments in which effecting
* scroll changes with transforms using CSS translations is fastest.
* 
* `TranslateScrollStrategy` is not typically created in application code. Instead, it is
* specified as the value of the [strategyKind]{@link module:enyo/Scroller~Scroller#strategyKind} property of
* an {@link module:enyo/Scroller~Scroller} or {@link module:layout/List~List}, or is used by the framework implicitly.
*
* @class TranslateScrollStrategy
* @extends module:enyo/TouchScrollStrategy~TouchScrollStrategy
* @protected
*/
module.exports = kind(
	/** @lends module:enyo/TranslateScrollStrategy~TranslateScrollStrategy.prototype */ {

	name: 'enyo.TranslateScrollStrategy',

	/**
	* @private
	*/
	kind: TouchScrollStrategy,

	/** 
	* Set to `true` to optimize the strategy to only use translation to scroll; this increases
	* fluidity of scrolling animation. It should not be used when the
	* [scroller]{@link module:enyo/Scroller~Scroller} contains [controls]{@link module:enyo/Control~Control} that require
	* keyboard input. This is because when `translateOptimized` is `true`, it is possible to
	* position inputs such that they will not become visible when focused.
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	translateOptimized: false,

	/**
	* @private
	*/
	components: [
		{name: 'clientContainer', classes: 'enyo-touch-scroller', components: [
			{name: 'client', classes: 'enyo-touch-scroller-client'}
		]}
	],

	/**
	* @method
	* @private
	*/
	rendered: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			dispatcher.makeBubble(this.$.clientContainer, 'scroll');
			if (this.translateOptimized) {
				// on render, the start positions should be 0 for translateOptimized because the
				// scrollNode's scrollTop/Left will always be 0 and therefore offsetting the
				// translate to account for a non-zero scrollTop/Left isn't necessary.
				this.setStartPosition(true);
			}
		};
	}),

	/**
	* Sets the start position for scrolling.
	*
	* @param {Boolean} [reset] When true, resets the start position to 0 rather than the current
	* 	scrollTop and scrollLeft.
	* @private
	*/
	setStartPosition: function (reset) {
		if (reset) {
			this.startX = this.startY = 0;
		} else {
			this.startX = this.getScrollLeft();
			this.startY = this.getScrollTop();
		}
	},

	/**
	* @private
	*/
	getScrollSize: function () {
		var n = this.$.client.hasNode();
		return {width: n ? n.scrollWidth : 0, height: n ? n.scrollHeight : 0};
	},

	/**
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			// apply initial transform so we're always composited
			Dom.transformValue(this.$.client, this.translation, '0,0,0');
		};
	}),

	/**
	* @private
	*/
	calcScrollNode: function () {
		return this.$.clientContainer.hasNode();
	},

	/**
	* @private
	*/
	maxHeightChanged: function () {
		// content should cover scroller at a minimum if there's no max-height.
		this.$.client.applyStyle('min-height', this.maxHeight ? null : '100%');
		this.$.client.applyStyle('max-height', this.maxHeight);
		this.$.clientContainer.addRemoveClass('enyo-scrollee-fit', !this.maxHeight);
	},

	/**
	* @method
	* @private
	*/
	shouldDrag: kind.inherit(function (sup) {
		return function(inEvent) {
			// stop and update drag info before checking drag status
			this.stop();
			this.calcStartInfo();
			return sup.apply(this, arguments);
		};
	}),

	/**
	* @method
	* @private
	*/
	syncScrollMath: kind.inherit(function (sup) {
		return function() {
			if (!this._translated) {
				sup.apply(this, arguments);
			}
		};
	}),

	/**
	* Sets the horizontal scroll position.
	*
	* @param {Number} left - The horizontal scroll position in pixels.
	* @method
	* @public
	*/
	setScrollLeft: kind.inherit(function (sup) {
		return function(inLeft) {
			var m, p;
			if (this.translateOptimized) {
				p = this.scrollLeft;
				m = this.$.scrollMath;
				this.stop(true);
				m.setScrollX(-inLeft);
				m.stabilize();
				if (p != -m.x) {
					// We won't get a native scroll event,
					// so need to make one ourselves
					m.doScroll();
					this.delayHideThumbs(100);
				}
			} else {
				sup.apply(this, arguments);
			}
		};
	}),

	/**
	* Sets the vertical scroll position.
	*
	* @param {Number} top - The vertical scroll position in pixels.
	* @method
	* @public
	*/
	setScrollTop: kind.inherit(function (sup) {
		return function(inTop) {
			var m, p;
			if (this.translateOptimized) {
				p = this.scrollTop;
				m = this.$.scrollMath;
				this.stop(true);
				m.setScrollY(-inTop);
				m.stabilize();
				if (p != -m.y) {
					// We won't get a native scroll event,
					// so need to make one ourselves
					m.doScroll();
					this.delayHideThumbs(100);
				}
			} else {
				sup.apply(this, arguments);
			}
		};
	}),

	/**
	* Retrieves the horizontal scroll position.
	*
	* @returns {Number} The horizontal scroll position in pixels.
	* @method
	* @public
	*/
	getScrollLeft: kind.inherit(function (sup) {
		return function() {
			return this._translated ? this.scrollLeft: sup.apply(this, arguments);
		};
	}),

	/**
	* Retrieves the vertical scroll position.
	*
	* @returns {Number} The vertical scroll position in pixels.
	* @method
	* @private
	*/
	getScrollTop: kind.inherit(function (sup) {
		return function() {
			return this._translated ? this.scrollTop : sup.apply(this, arguments);
		};
	}),

	/**
	* @method
	* @private
	*/
	calcBoundaries: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			if (this.translateOptimized && !this.isScrolling()) this.stabilize();
		};
	}),

	/**
	* @method
	* @private
	*/
	handleResize: function() {
		if (this.translateOptimized) {
			this.stabilize();
		}
	},

	/**
	* @method
	* @private
	*/
	scrollMathStart: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			if (!this._translated) {
				this.setStartPosition();
			}
		};
	}),

	/**
	* @private
	*/
	scrollMathScroll: function (sender) {
		if(!this.overscroll) { //don't overscroll past edges
			this.scrollLeft = -Math.min(sender.leftBoundary, Math.max(sender.rightBoundary, sender.x));
			this.scrollTop = -Math.min(sender.topBoundary, Math.max(sender.bottomBoundary, sender.y));
		} else {
			this.scrollLeft = -sender.x;
			this.scrollTop = -sender.y;
		}
		this.effectScroll(this.scrollLeft, this.scrollTop);
		if (this.thumb) {
			this.showThumbs();
		}
	},

	/**
	* @private
	*/
	scrollMathStabilize: kind.inherit(function (sup) {
		return function (sender) {
			if (this._translated) {
				this.scrollLeft = -sender.x;
				this.scrollTop = -sender.y;
				this.effectScroll(-sender.x, -sender.y);
				return true;
			} else {
				return sup.apply(this, arguments);
			}
		};
	}),

	/**
	* While moving, scroller uses translate.
	*
	* @private
	*/
	effectScroll: kind.inherit(function (sup) {
		return function (x, y) {
			var o;
			if (this.translateOptimized || this.isScrolling()) {
				x = this.startX - x;
				y = this.startY - y;
				o = x + 'px, ' + y + 'px' + (this.accel ? ',0' : '');
				Dom.transformValue(this.$.client, this.translation, o);
				this._translated = true;
			} else {
				sup.apply(this, arguments);
			}
		};
	}),

	/**
	* When stopped, we use `scrollLeft/scrollTop` (makes cursor positioning automagic).
	*
	* @private
	*/
	effectScrollStop: function () {
		if (!this.translateOptimized) {
			var t = '0,0' + (this.accel ? ',0' : '');
			// FIXME: normally translate3d changes not effect scrollHeight; however
			// there appear to be some dom changes (e.g. showing a node inside the scroller,
			// which do cause the scrollHeight to be changed from the translate3d.
			// In this case setting the translate3d back to 0 does not restore scrollHeight.
			// This causes a problem because setting scrollTop can produced an unexpected result if
			// scrollHeight is less than expected.
			// We detect this fault by validating scroll bounds and (1) un-apply the translate3d,
			// (2) update scrollTop/Left, and (3) re-apply a 0,0,0 translate3d to ensure compositing.
			// Luckily this corrects the problem (which appears to be a webkit bug). Note that
			// it's important to maintain a composited state (translate3d 0,0,0) or Android 4 is
			// slow to start scrolling.
			var m = this.$.scrollMath, sb = this._getScrollBounds();
			var needsBoundsFix = Boolean((sb.maxTop + m.bottomBoundary) || (sb.maxLeft + m.rightBoundary));
			Dom.transformValue(this.$.client, this.translation, needsBoundsFix ? null : t);
			// note: this asynchronously triggers dom scroll event
			this.setScrollLeft(this.scrollLeft);
			this.setScrollTop(this.scrollTop);
			if (needsBoundsFix) {
				Dom.transformValue(this.$.client, this.translation, t);
			}
			this._translated = false;
		}
	},

	/**
	* FIXME: we can fix scrolling artifacts BUGS on Android 4.04 with this heinous incantation.
	*
	* @private
	*/
	twiddle: function () {
		if (this.translateOptimized && this.scrollNode) { // this.scrollNode is not always defined and makes Motorola XOOM crash
			this.scrollNode.scrollTop = 1;
			this.scrollNode.scrollTop = 0;
		}
	}
});
