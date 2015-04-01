(function (enyo, scope) {
	/**
	* {@link enyo.ScrollThumb} is a helper [kind]{@glossary kind} used by 
	* {@link enyo.TouchScrollStrategy} and {@link enyo.TranslateScrollStrategy} to
	* display a small visual scroll indicator.
	* 
	* `enyo.ScrollThumb` is not typically created in application code.
	*
	* @class enyo.ScrollThumb
	* @protected
	*/
	enyo.kind(
		/** @lends enyo.ScrollThumb.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.ScrollThumb',

		/**
		* The orientation of the scroll indicator bar; 'v' for vertical or 'h' for horizontal.
		* 
		* @type {String}
		* @default 'v'
		* @public
		*/
		axis: 'v',

		/**
		* Minimum size of the indicator.
		* 
		* @private
		*/
		minSize: 4,

		/**
		* Size of the indicator's corners.
		* 
		* @private
		*/
		cornerSize: 6,

		/**
		* @private
		*/
		classes: 'enyo-thumb',

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				var v = this.axis == 'v';
				this.dimension = v ? 'height' : 'width';
				this.offset = v ? 'top' : 'left';
				this.translation = v ? 'translateY' : 'translateX';
				this.positionMethod = v ? 'getScrollTop' : 'getScrollLeft';
				this.sizeDimension = v ? 'clientHeight' : 'clientWidth';
				this.addClass('enyo-' + this.axis + 'thumb');
				this.transform = enyo.dom.canTransform();
				if (enyo.dom.canAccelerate()) {
					enyo.dom.transformValue(this, 'translateZ', 0);
				}
			};
		}),

		/** 
		* Syncs the scroll indicator bar to the [scroller]{@link enyo.Scroller} size and position,
		* as determined by the passed-in scroll strategy.
		*
		* @param {enyo.ScrollStrategy} strategy - The scroll strategy to be synced with.
		* @public
		*/
		sync: function (strategy) {
			this.scrollBounds = strategy._getScrollBounds();
			this.update(strategy);
		},

		/**
		* Updates the scroll indicator bar based on the scroll bounds of the strategy, the available
		* scroll area, and whether there is overscrolling. If the scroll indicator bar is not
		* needed, it will be not be displayed.
		* 
		* @param {enyo.ScrollStrategy} strategy - The scroll strategy to update from.
		* @public
		*/
		update: function (strategy) {
			if (this.showing) {
				var d = this.dimension, o = this.offset;
				var bd = this.scrollBounds[this.sizeDimension], sbd = this.scrollBounds[d];
				var overs = 0, overp = 0, over = 0;
				if (bd >= sbd) {
					this.hide();
					return;
				}
				if (strategy.isOverscrolling()) {
					over = strategy.getOverScrollBounds()['over' + o];
					overs = Math.abs(over);
					overp = Math.max(over, 0);
				}
				var sbo = strategy[this.positionMethod]() - over;
				// calc size & position
				var bdc = bd - this.cornerSize;
				var s = Math.floor((bd * bd / sbd) - overs);
				s = Math.max(this.minSize, s);
				var p = Math.floor((bdc * sbo / sbd) + overp);
				p = Math.max(0, Math.min(bdc - this.minSize, p));
				// apply thumb styling
				this.needed = s < bd;
				if (this.needed && this.hasNode()) {
					if (this._pos !== p) {
						this._pos = p;
						if(!this.transform) {
							//adjust top/left for browsers that don't support translations
							if(this.axis=='v') {
								this.setBounds({top:p + 'px'});
							} else {
								this.setBounds({left:p + 'px'});
							}
						} else {
							enyo.dom.transformValue(this, this.translation, p + 'px');
						}
					}
					if (this._size !== s) {
						this._size = s;
						this.applyStyle(d, s + 'px');
					}
				} else {
					this.hide();
				}
			}
		},

		/**
		* We implement `setShowing()` and cancel the [delayHide()]{@link enyo.ScrollThumb#delayHide} 
		* because [showing]{@link enyo.Control#showing} is not changed while we execute
		* `delayHide()`.
		*
		* @param {Boolean} showing - If `true`, displays the {@link enyo.ScrollThumb} if appropriate;
		*	otherwise, hides the ScrollThumb.
		* @public
		*/
		setShowing: function (showing) {
			if (showing && showing != this.showing) {
				if (this.scrollBounds[this.sizeDimension] >= this.scrollBounds[this.dimension]) {
					return;
				}
			}
			if (this.hasNode()) {
				this.cancelDelayHide();
			}
			if (showing != this.showing) {
				var last = this.showing;
				this.showing = showing;
				this.showingChanged(last);
			}
		},

		/**
		* Delays automatic hiding of the {@link enyo.ScrollThumb}.
		*
		* @param {Number} delay - The number of milliseconds to delay hiding of the
		*	{@link enyo.ScrollThumb}.
		* @public
		*/
		delayHide: function (delay) {
			if (this.showing) {
				this.startJob('hide', this.hide, delay || 0);
			}
		},

		/**
		* Cancels any pending [delayHide()]{@link enyo.ScrollThumb#delayHide} jobs.
		* 
		* @public
		*/
		cancelDelayHide: function () {
			this.stopJob('hide');
		}
	});

})(enyo, this);
