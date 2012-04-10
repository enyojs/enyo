//* @protected
enyo.mixin(enyo.dom, {
	canAccelerate: function() {
		return this.accelerando !== undefined ? this.accelerando: document.body && (this.accelerando = this.calcCanAccelerate());
	},
	calcCanAccelerate: function() {
		/* Android 2 is a liar: it does NOT support 3D transforms, even though Perspective is the best check */
		if (enyo.platform.android <= 2) {
			return false;
		}
		var p$ = ["perspective", "msPerspective", "MozPerspective", "WebkitPerspective", "OPerspective"];
		for (var i=0, p; p=p$[i]; i++) {
			if (typeof document.body.style[p] != "undefined") {
				return true;
			}
		}
		return false;
	},
	cssTransformProps: ["-webkit-transform", "-moz-transform", "-ms-transform", "-o-transform", "transform"],
	styleTransformProps: ["webkitTransform", "MozTransform", "msTransform", "OTransform", "transform"],
	getCssTransformProp: function() {
		if (this._cssTransformProp) {
			return this._cssTransformProp;
		}
		var i = enyo.indexOf(this.getStyleTransformProp(), this.styleTransformProps);
		return this._cssTransformProp = this.cssTransformProps[i];
	},
	getStyleTransformProp: function() {
		if (this._styleTransformProp || !document.body) {
			return this._styleTransformProp;
		}
		for (var i = 0, p; p = this.styleTransformProps[i]; i++) {
			if (typeof document.body.style[p] != "undefined") {
				return this._styleTransformProp = p;
			}
		}
	},
	transformValue: function(inControl, inTransform, inValue) {
		var d = inControl.domTransforms = inControl.domTransforms || {};
		d[inTransform] = inValue;
		this.transformsToDom(inControl);
	},
	accelerate: function(inControl, inValue) {
		var v = inValue == "auto" ? this.canAccelerate() : inValue;
		if (v) {
			this.transformValue(inControl, "translateZ", 0);
		}
	},
	transform: function(inControl, inTransforms) {
		var d = inControl.domTransforms = inControl.domTransforms || {};
		enyo.mixin(d, inTransforms);
		this.transformsToDom(inControl);
	},
	domTransformsToCss: function(inTransforms) {
		var n, v, text = '';
		for (n in inTransforms) {
			v = inTransforms[n];
			if ((v !== null) && (v !== undefined) && (v !== "")) {
				text +=  n + '(' + v + ') ';
			}
		}
		return text;
	},
	transformsToDom: function(inControl) {
		var t = this.domTransformsToCss(inControl.domTransforms);
		var st = inControl.hasNode() ? inControl.node.style : null;
		var ds = inControl.domStyles;
		var sp = this.getStyleTransformProp();
		var cp = this.getCssTransformProp();
		if (sp && cp) {
			ds[cp] = t;
			if (st) {
				st[sp] = t;
			} else {
				inControl.domStylesChanged();
			}
		}
	}
});
