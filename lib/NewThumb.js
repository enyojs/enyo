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
		name: 'enyo.NewScrollThumb',

		/**
		* The orientation of the scroll indicator bar; 'v' for vertical or 'h' for horizontal.
		* 
		* @type {String}
		* @default 'v'
		* @public
		*/
		axis: 'v',

		autoHide: true,

		delay: 200,

		/**
		* Minimum size of the indicator.
		* 
		* @private
		*/
		minSize: enyo.ri.scale(4),

		/**
		* Size of the indicator's corners.
		* 
		* @private
		*/
		cornerSize: enyo.ri.scale(6),

		/**
		* @private
		*/
		enabled: false,

		/**
		* @private
		*/
		classes: 'enyo-new-thumb',

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);

				var a = this.axis,
					v = (a === 'v'),
					xfm = (this.xfm = enyo.dom.canTransform()),
					acc;

				if (xfm) {
					acc = (this.acc = enyo.dom.canAccelerate()),
					this.mtxType = (acc ? 'matrix3d' : 'matrix');
					this.mtxFn = a + (acc ? '3dMatrix' : '2dMatrix');
				}
				else {
					this.sizeProp = v ? 'height' : 'width';
					this.posProp = v ? 'top' : 'left';
				}

				this.dimension = v ? 'height' : 'width';
				this.offsetSizeProp = v ? 'offsetHeight' : 'offsetWidth';
				this.enabledProp = v ? 'vEnabled' : 'hEnabled';
				this.sizeRatioProp = v ? 'ySizeRatio' : 'xSizeRatio';
				this.posRatioProp = v ? 'yPosRatio' : 'xPosRatio';

				this.addClass('enyo-' + a + 'thumb');
				if (this.autoHide) {
					this.addClass('hidden');
				}

				this._updateEnablement = this.bindSafely(this.updateEnablement);
				this._updateVisibility = this.bindSafely(this._updateVisibility);
				this._update = this.bindSafely(this.update);
				this.scrollerChanged();
			};
		}),

		scrollerChanged: function(was) {
			if (was) {
				was.off('scrollabilityChanged', this._updateEnablement);
				was.off('metricsChanged', this._update);
				was.off('stateChanged', this._updateVisibility);
			}
			if (this.scroller) {
				this.scroller.on('scrollabilityChanged', this._updateEnablement);
			}
		},

		updateEnablement: function() {
			var s = this.scroller,
				was = this.enabled,
				is = (this.enabled = s[this.enabledProp]);

			if (is && !was) {
				s.on('metricsChanged', this._update);
				if (this.autoHide) {
					s.on('stateChanged', this._updateVisibility);
				}
			}
			
			if (was && !is) {
				s.off('metricsChanged', this._update);
				s.off('stateChanged', this._updateVisibility);
				this.hide();
			}
		},

		_updateVisibility: function() {
			var s = this.scroller;

			if (s.isScrolling) {
				this.removeClass('hidden');
				this.stopJob('hide');
			}
			else {
				this.show();
			}
		},

		rendered: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				this.calculateMetrics();
			};
		}),

		calculateMetrics: function () {
			this.extent = this.parent.getBounds()[this.dimension];
			this.minSizeRatio = this.minSize / this.extent;
			this.naturalSize = this.hasNode()[this.offsetSizeProp];
		},

		/**
		* Updates the scroll indicator bar based on the scroll bounds of the strategy, the available
		* scroll area, and whether there is overscrolling. If the scroll indicator bar is not
		* needed, it will be not be displayed.
		* 
		* @param {enyo.ScrollStrategy} strategy - The scroll strategy to update from.
		* @public
		*/
		update: function () {
			var sc = this.scroller,
				ex = this.extent,
				mr = this.minSizeRatio,
				sr = Math.max(mr, sc[this.sizeRatioProp]),
				pr = sc[this.posRatioProp],
				s, p;

			if (pr < 0) {
				sr = Math.max(mr, sr + pr);
				pr = 0;
			}
			else if (pr > 1) {
				sr = Math.max(mr, sr - (pr - 1));
				pr = 1;
			}

			pr = pr - (sr * pr);

			s = Math.round(sr * ex);
			p = Math.round(pr * ex);

			if (this.xfm) {
				enyo.dom.transformValue(this, this.mtxType, this[this.mtxFn](p, s));
			}
			else {
				if (s !== this._s) {
					this.applyStyle(this.sizeProp, s + 'px');
					this._s = s;
				}
				if (p !== this._p) {
					this.applyStyle(this.posProp, p + 'px');
					this._p = p;
				}
			}
		},

		/**
		* Override `show()` to give fade effect.
		* 
		* @private
		*/
		show: function (delay) {
			if (this.enabled) {
				this.removeClass('hidden');
				if (this.autoHide) {
					this.stopJob('hide');
					this.startJob('hide', this.hide, delay || this.delay);
				}
			}
		},

		/**
		* Hides the control.
		*
		* @private
		*/
		hide: function () {
			this.stopJob('hide');
			this.addClass('hidden');
		},

		v2dMatrix: function (p, s) {
			return '1, 0, 0, ' + (s / this.naturalSize) + ', 0,' + p;
		},

		v3dMatrix: function(p, s) {
			return '1, 0, 0, 0, 0,' + (s / this.naturalSize) + ', 0, 0, 0, 0, 1, 0, 0, ' + p + ', 1, 1';
		},

		h2dMatrix: function(p, s) {
			return (s / this.naturalSize) + ', 0, 0, 1, ' + p + ', 0';
		},

		h3dMatrix: function(p, s) {
			return (s / this.naturalSize) + ', 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ' + p + ', 0, 1, 1';
		}

	});

})(enyo, this);
