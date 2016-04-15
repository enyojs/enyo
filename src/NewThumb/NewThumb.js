require('enyo');

/**
* Contains the declaration for the {@link module:enyo/NewThumb~NewThumb} kind.
* @wip
* @public
* @module enyo/NewThumb
*/

var
	kind = require('../kind'),
	ri = require('../resolution'),
	dom = require('../dom');

var
	Control = require('../Control');

/**
* {@link module:enyo/NewThumb~NewThumb} is a simple scroll thumb designed to be
* used with any scrolling {@link module:enyo/Control~Control} whose scrolling
* behavior is provided by the {@link module:enyo/Scrollable~Scrollable} mixin.
* 
* Like all {@link module:enyo/Scrollable~Scrollable}-compatible scroll controls,
* {@link module:enyo/NewThumb~NewThumb} listens to events emitted by the scrolling
* {@link module:enyo/Control~Control} and updates its state (position, visibility,
* etc.) accordingly.
*
* To use {@link module:enyo/NewThumb~NewThumb}, simply include it in the
* {@link module:enyo/Scrollable~Scrollable#scrollControls} block of the scrolling
* control:
*
* ```javascript
* 	var
* 		kind = require('enyo/kind'),
* 		NewThumb = require('enyo/NewThumb'),
*       NewDataList = require('enyo/NewDataList');
*
* 	var MyList = kind({
*		kind: NewDataList,
*		scrollControls: [
*			{kind: NewThumb}
*		]
*	});
* ```
*
* @class NewThumb
* @extends module:enyo/Control~Control
* @wip
* @public
*/
module.exports = kind(
	/** @lends module:enyo/NewThumb~NewThumb.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.NewScrollThumb',

	kind: Control,

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
	* @public
	*/
	minSize: ri.scale(4),

	/**
	* Size of the indicator's corners.
	* 
	* @public
	*/
	cornerSize: ri.scale(6),

	/**
	* @public
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
	create: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);

			var a = this.axis,
				v = (a === 'v'),
				xfm = (this.xfm = dom.canTransform()),
				acc;

			if (xfm) {
				acc = (this.acc = dom.canAccelerate()),
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

	/**
	* @private
	*/
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

	/**
	* @private
	*/
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

	/**
	* @private
	*/
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

	/**
	* @private
	*/
	rendered: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.calculateMetrics();
		};
	}),

	/**
	* @private
	*/
	calculateMetrics: function () {
		this.extent = this.parent.getBounds()[this.dimension];
		this.minSizeRatio = this.minSize / this.extent;
		this.naturalSize = this.hasNode()[this.offsetSizeProp];
	},

	/**
	* @private
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
			dom.transformValue(this, this.mtxType, this[this.mtxFn](p, s));
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
	* Shows the thumb.
	*
	* App code should generally not need to manage thumb visibility
	* unless the {@link module:enyo/NewThumb~NewThumb#autoHide} property
	* has been set to `false`.
	* 
	* @public
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
	* Hides the thumb.
	*
	* App code should generally not need to manage thumb visibility
	* unless the {@link module:enyo/NewThumb~NewThumb#autoHide} property
	* has been set to `false`.
	* 
	* @public
	*/
	hide: function () {
		this.stopJob('hide');
		this.addClass('hidden');
	},

	/**
	* Overriding `handleResize()` to re-calculate ratio and size.
	*
	* @private
	*/
	handleResize: function () {
		Control.prototype.handleResize.apply(this, arguments);
		if (this.getAbsoluteShowing()) {
			this.calculateMetrics();
		}
	},

	/**
	* Overriding `showingChangedHandler()` to recalculate metrics on show.
	*
	* @private
	*/
	showingChangedHandler: function (sender, e) {
		Control.prototype.showingChangedHandler.apply(this, arguments);
		if (this.getAbsoluteShowing()) {
			this.calculateMetrics();
		}
	},

	/**
	* @private
	*/
	v2dMatrix: function (p, s) {
		return '1, 0, 0, ' + (s / this.naturalSize) + ', 0,' + p;
	},

	/**
	* @private
	*/
	v3dMatrix: function(p, s) {
		return '1, 0, 0, 0, 0,' + (s / this.naturalSize) + ', 0, 0, 0, 0, 1, 0, 0, ' + p + ', 1, 1';
	},

	/**
	* @private
	*/
	h2dMatrix: function(p, s) {
		return (s / this.naturalSize) + ', 0, 0, 1, ' + p + ', 0';
	},

	/**
	* @private
	*/
	h3dMatrix: function(p, s) {
		return (s / this.naturalSize) + ', 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ' + p + ', 0, 1, 1';
	}

});
