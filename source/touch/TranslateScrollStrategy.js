(function (enyo, scope) {
	/**
	* {@link enyo.TranslateScrollStrategy} is a helper [kind]{@glossary kind} that extends
	* {@link enyo.TouchScrollStrategy}, optimizing it for scrolling environments in which effecting 
	* scroll changes with transforms using CSS translations is fastest.
	* 
	* `enyo.TranslateScrollStrategy` is not typically created in application code. Instead, it is 
	* specified as the value of the [strategyKind]{@link enyo.Scroller#strategyKind} property of 
	* an {@link enyo.Scroller} or {@link enyo.List}, or is used by the framework implicitly.
	*
	* @class enyo.TranslateScrollStrategy
	* @extends enyo.TouchScrollStrategy
	* @protected
	*/
	enyo.kind(
		/** @lends enyo.TranslateScrollStrategy.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.TranslateScrollStrategy',

		/**
		* @private
		*/
		kind: 'enyo.TouchScrollStrategy',

		/** 
		* Set to `true` to optimize the strategy to only use translation to scroll; this increases 
		* fluidity of scrolling animation. It should not be used when the 
		* [scroller]{@link enyo.Scroller} contains [controls]{@link enyo.Control} that require 
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
				{name: 'client'}
			]}
		],

		/**
		* @method
		* @private
		*/
		rendered: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				enyo.makeBubble(this.$.clientContainer, 'scroll');
				if (this.translateOptimized) {
					this.setStartPosition();
				}
			};
		}),

		/**
		* @method
		* @private
		*/
		setStartPosition: function() {
			this.startX = this.getScrollLeft();
			this.startY = this.getScrollTop();
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
		create: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				// apply initial transform so we're always composited
				enyo.dom.transformValue(this.$.client, this.translation, '0,0,0');
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
		shouldDrag: enyo.inherit(function (sup) {
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
		syncScrollMath: enyo.inherit(function (sup) {
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
		setScrollLeft: enyo.inherit(function (sup) {
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
		setScrollTop: enyo.inherit(function (sup) {
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
		getScrollLeft: enyo.inherit(function (sup) {
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
		getScrollTop: enyo.inherit(function (sup) {
			return function() {
				return this._translated ? this.scrollTop : sup.apply(this, arguments);
			};
		}),

		/**
		* @method
		* @private
		*/
		calcBoundaries: enyo.inherit(function (sup) {
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
		scrollMathStart: enyo.inherit(function (sup) {
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
		scrollMathStabilize: enyo.inherit(function (sup) {
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
		effectScroll: enyo.inherit(function (sup) {
			return function (x, y) {
				var o;
				if (this.translateOptimized || this.isScrolling()) {
					x = this.startX - x;
					y = this.startY - y;
					o = x + 'px, ' + y + 'px' + (this.accel ? ',0' : '');
					enyo.dom.transformValue(this.$.client, this.translation, o);
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
				enyo.dom.transformValue(this.$.client, this.translation, needsBoundsFix ? null : t);
				// note: this asynchronously triggers dom scroll event
				this.setScrollLeft(this.scrollLeft);
				this.setScrollTop(this.scrollTop);
				if (needsBoundsFix) {
					enyo.dom.transformValue(this.$.client, this.translation, t);
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

})(enyo, this);
