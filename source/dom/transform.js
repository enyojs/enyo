(function(enyo, scope) {
	/**
	* @namespace enyo.dom
	*/
	var cssTransformProps = ['transform', '-webkit-transform', '-moz-transform', '-ms-transform', '-o-transform'],
		styleTransformProps = ['transform', 'webkitTransform', 'MozTransform', 'msTransform', 'OTransform'];

	/**
	* @private
	*/
	enyo.dom.calcCanAccelerate = function() {
		/* Android 2 is a liar: it does NOT support 3D transforms, even though Perspective is the best check */
		if (enyo.platform.android <= 2) {
			return false;
		}
		var p$ = ['perspective', 'WebkitPerspective', 'MozPerspective', 'msPerspective', 'OPerspective'];
		for (var i=0, p; (p=p$[i]); i++) {
			if (typeof document.body.style[p] != 'undefined') {
				return true;
			}
		}
		return false;
	};
	/**
	* @private
	*/
	enyo.dom.getCssTransformProp = function() {
		if (this._cssTransformProp) {
			return this._cssTransformProp;
		}
		var i = enyo.indexOf(this.getStyleTransformProp(), styleTransformProps);
		this._cssTransformProp = cssTransformProps[i];
		return this._cssTransformProp;
	};

	/**
	* @private
	*/
	enyo.dom.getStyleTransformProp = function() {
		if (this._styleTransformProp || !document.body) {
			return this._styleTransformProp;
		}
		for (var i = 0, p; (p = styleTransformProps[i]); i++) {
			if (typeof document.body.style[p] != 'undefined') {
				this._styleTransformProp = p;
				return this._styleTransformProp;
			}
		}
	};

	/**
	* @private
	*/
	enyo.dom.domTransformsToCss = function(inTransforms) {
		var n, v, text = '';
		for (n in inTransforms) {
			v = inTransforms[n];
			if ((v !== null) && (v !== undefined) && (v !== '')) {
				text +=  n + '(' + v + ') ';
			}
		}
		return text;
	};

	/**
	* @private
	*/
	enyo.dom.transformsToDom = function(control) {
		var css = this.domTransformsToCss(control.domTransforms),
			styleProp;

		if (control.hasNode()) {
			styleProp = this.getStyleTransformProp();
		} else {
			styleProp = this.getCssTransformProp();
		}

		if (styleProp) control.applyStyle(styleProp, css);
	};

	/**
	* Returns true if the platform supports CSS3 Transforms.
	*
	* @returns {Boolean} `True` if its possible to use the CSS `transform` property, `false`
	*	otherwise.
	* @public
	*/
	enyo.dom.canTransform = function() {
		return Boolean(this.getStyleTransformProp());
	};

	/**
	* Returns true if platform supports CSS3 3D Transforms.
	*
	* Typically used like this:
	* ```
	* if (enyo.dom.canAccelerate()) {
	* 	enyo.dom.transformValue(this.$.slidingThing, 'translate3d', x + ',' + y + ',' + '0')
	* } else {
	* 	enyo.dom.transformValue(this.$.slidingThing, 'translate', x + ',' + y);
	* }
	* ```
	*
	* @returns {Boolean} `True` if platform supports CSS3 3D Transforms.
	* @public
	*/
	enyo.dom.canAccelerate = function() {
		return (this.accelerando !== undefined) ? this.accelerando : document.body && (this.accelerando = this.calcCanAccelerate());
	};

	/**
	* Applies a series of transforms to _control_, using the platform's prefixed transform property.
	*
	* **Note:** Transforms are not commutative, so order is important
	*
	* Transform values are updated by successive calls:
	* ```javascript
	* enyo.dom.transform(control, {translate: '30px, 40px', scale: 2, rotate: '20deg'});
	* enyo.dom.transform(control, {scale: 3, skewX: '-30deg'});
	* ```
	*
	* is equivalent to:
	* ```javascript
	* enyo.dom.transform(control, {translate: '30px, 40px', scale: 3, rotate: '20deg', skewX: '-30deg'});
	* ```
	*
	* When applying these transforms in webkit browser, this is equivalent to:
	* ```javascript
	* control.applyStyle('-webkit-transform', 'translate(30px, 40px) scale(3) rotate(20deg) skewX(-30deg)');
	* ```
	*
	* And in firefox, this is equivalent to:
	* ```javascript
	* control.applyStyle('-moz-transform', 'translate(30px, 40px) scale(3) rotate(20deg) skewX(-30deg)');
	* ```
	*
	* @param {enyo.Control} control The {@link enyo.Control} to transform.
	* @param {Object} transforms The set of transforms to apply to _control_.
	* @public
	*/
	enyo.dom.transform = function(control, transforms) {
		var d = control.domTransforms = control.domTransforms || {};
		enyo.mixin(d, transforms);
		this.transformsToDom(control);
	};

	/**
	* Apply a single transform to _control_.
	*
	* Example:
	* ```
	* tap: function(inSender, inEvent) {
	* 	var c = inEvent.originator;
	* 	var r = c.rotation || 0;
	* 	r = (r + 45) % 360;
	* 	c.rotation = r;
	* 	enyo.dom.transformValue(c, 'rotate', r);
	* }
	* ```
	*
	* This will rotate the tapped control by 45 degrees clockwise.
	*
	* @param {enyo.Control} control The {@link enyo.Control} to transform.
	* @param {String} transform Name of the transform function.
	* @param {(String|Number)} value The value to apply to the _transform_.
	* @public
	*/
	enyo.dom.transformValue = function(control, transform, value) {
		var d = control.domTransforms = control.domTransforms || {};
		d[transform] = value;
		this.transformsToDom(control);
	};

	/**
	* Applies a transform that should trigger GPU compositing for _control_. The acceleration, by
	* default, is only applied if the browser supports it. You may also optionally force-set _value_
	* directly, to be applied to the `translateZ(value)`.
	*
	* @param {enyo.Control} control The {@link enyo.Control} to accelerate.
	* @param {(String|Number)} [value] An optional value to apply to the acceleration transform
	*	property.
	* @public
	*/
	enyo.dom.accelerate = function(control, value) {
		var v = value == 'auto' ? this.canAccelerate() : value;
		this.transformValue(control, 'translateZ', v ? 0 : null);
	};

})(enyo, this);