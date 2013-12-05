//* @protected
(function() {
	enyo.dom.calcCanAccelerate = function() {
		/* Android 2 is a liar: it does NOT support 3D transforms, even though Perspective is the best check */
		if (enyo.platform.android <= 2) {
			return false;
		}
		var p$ = ["perspective", "WebkitPerspective", "MozPerspective", "msPerspective", "OPerspective"];
		for (var i=0, p; (p=p$[i]); i++) {
			if (typeof document.body.style[p] != "undefined") {
				return true;
			}
		}
		return false;
	};
	var cssTransformProps = ["transform", "-webkit-transform", "-moz-transform", "-ms-transform", "-o-transform"];
	var styleTransformProps = ["transform", "webkitTransform", "MozTransform", "msTransform", "OTransform"];
	enyo.dom.getCssTransformProp = function() {
		if (this._cssTransformProp) {
			return this._cssTransformProp;
		}
		var i = enyo.indexOf(this.getStyleTransformProp(), styleTransformProps);
		this._cssTransformProp = cssTransformProps[i];
		return this._cssTransformProp;
	};
	enyo.dom.getStyleTransformProp = function() {
		if (this._styleTransformProp || !document.body) {
			return this._styleTransformProp;
		}
		for (var i = 0, p; (p = styleTransformProps[i]); i++) {
			if (typeof document.body.style[p] != "undefined") {
				this._styleTransformProp = p;
				return this._styleTransformProp;
			}
		}
	};
	enyo.dom.domTransformsToCss = function(inTransforms) {
		var n, v, text = '';
		for (n in inTransforms) {
			v = inTransforms[n];
			if ((v !== null) && (v !== undefined) && (v !== "")) {
				text +=  n + '(' + v + ') ';
			}
		}
		return text;
	};
	enyo.dom.transformsToDom = function(inControl) {
		var t = this.domTransformsToCss(inControl.domTransforms);
		var st = inControl.hasNode() ? inControl.node.style : null;
		var ds = inControl.domStyles;
		var sp = this.getStyleTransformProp();
		var cp = this.getCssTransformProp();
		if (sp && cp) {
			ds[cp] = t;
			if (st) {
				// Optimization: set transform directly to node when available
				st[sp] = t;
				inControl.invalidateStyles();
			} else {
				inControl.domStylesChanged();
			}
		}
	};
	//* @public
	/**
		Returns true if the platform supports CSS3 Transforms
	*/
	enyo.dom.canTransform = function() {
		return Boolean(this.getStyleTransformProp());
	};
	/**
		Returns true if platform supports CSS3 3D Transforms.

		Typically used like this:

			if (enyo.dom.canAccelerate()) {
				enyo.dom.transformValue(this.$.slidingThing, "translate3d", x + "," + y + "," + "0")
			} else {
				enyo.dom.transformValue(this.$.slidingThing, "translate", x + "," + y);
			}

	*/
	enyo.dom.canAccelerate = function() {
		return this.accelerando !== undefined ? this.accelerando: document.body && (this.accelerando = this.calcCanAccelerate());
	};
	/**
		Applies a series of transforms to _inControl_, using the platform's prefixed transform property.

		**Note:** Transforms are not commutative, so order is important

		Transform values are updated by successive calls:

			enyo.dom.transform(control, {translate: "30px, 40px", scale: 2, rotate: "20deg"});
			enyo.dom.transform(control, {scale: 3, skewX: "-30deg"});

		is equivalent to:

			enyo.dom.transform(control, {translate: "30px, 40px", scale: 3, rotate: "20deg", skewX: "-30deg"});

		When applying these transforms in webkit browser, this is equivalent to:

			control.applyStyle("-webkit-transform", "translate(30px, 40px) scale(3) rotate(20deg) skewX(-30deg)");

		And in firefox, this is equivalent to:

			control.applyStyle("-moz-transform", "translate(30px, 40px) scale(3) rotate(20deg) skewX(-30deg)");

	*/
	enyo.dom.transform = function(inControl, inTransforms) {
		var d = inControl.domTransforms = inControl.domTransforms || {};
		enyo.mixin(d, inTransforms);
		this.transformsToDom(inControl);
	};

	/**
		Apply a single transform to _inControl_.

		Example:

			tap: function(inSender, inEvent) {
				var c = inEvent.originator;
				var r = c.rotation || 0;
				r = (r + 45) % 360;
				c.rotation = r;
				enyo.dom.transformValue(c, "rotate", r);
			}

		This will rotate the tapped control by 45 degrees clockwise.
	*/
	enyo.dom.transformValue = function(inControl, inTransform, inValue) {
		var d = inControl.domTransforms = inControl.domTransforms || {};
		d[inTransform] = inValue;
		this.transformsToDom(inControl);
	};
	//* @protected
	/**
		Applies a transform that should trigger GPU compositing for _inControl_
	*/
	enyo.dom.accelerate = function(inControl, inValue) {
		var v = inValue == "auto" ? this.canAccelerate() : inValue;
		this.transformValue(inControl, "translateZ", v ? 0 : null);
	};
})();
