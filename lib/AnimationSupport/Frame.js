require('enyo');

var 
	Dom = require('../dom');
/**
* Frame is a module responsible for providing animation features required for a frame.
* This module exposes bunch of animation API's like transform, matrix calculation,
* fetching inital DOM properties and also applying style updates to DOM.
*
* @public
*/
var frame = module.exports = {
	/**
	* @public
	*/
	translate: function (x, y, z) {
		return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y ? y : 0, z ? z : 0, 1];
	},

	/**
	* @public
	*/
	translateX: function (x) {
		return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x ? x : 0, 0, 0, 1];
	},

	/**
	* @public
	*/
	translateY: function (y) {
		return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, y ? y : 0, 0, 1];
	},

	/**
	* @public
	*/
	translateZ: function (z) {
		return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, z ? z : 0, 1];
	},

	/**
	* @public
	*/
	scale: function (x, y, z) {
		return [x, 0, 0, 0, 0, y ? y : 1, 0, 0, 0, 0, z ? z : 1, 0, 0, 0, 0, 1];
	},

	/**
	* @public
	*/
	skew: function (a, b) {
		a = a ? Math.tan(a * Math.PI / 180): 0;
		b = b ? Math.tan(b * Math.PI / 180): 0;
		return [1, b, 0, 0, a, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	},

	/**
	* @public
	*/
	rotateX: function (a) {
		var cosa, sina;
		a = a * Math.PI / 180;
		cosa = Math.cos(a);
		sina = Math.sin(a);
		return [1, 0, 0, 0, 0, cosa, -sina, 0, 0, sina, cosa, 0, 0, 0, 0, 1];
	},

	/**
	* @public
	*/
	rotateY: function (b) {
		var cosb, sinb;
		b = b * Math.PI / 180;
		cosb = Math.cos(b);
		sinb = Math.sin(b);
		return [cosb, 0, sinb, 0, 0, 1, 0, 0, -sinb, 0, cosb, 0, 0, 0, 0, 1];
	},

	/**
	* @public
	*/
	rotateZ: function (g) {
		var cosg, sing;
		g = g * Math.PI / 180;
		cosg = Math.cos(g);
		sing = Math.sin(g);
		return [cosg, -sing, 0, 0, sing, cosg, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	},

	/**
	* @public
	*/
	rotate: function (a, b, g) {
		a = a * Math.PI / 180;
		b = b * Math.PI / 180;
		g = g * Math.PI / 180;
		var ca = Math.cos(a);
		var sa = Math.sin(a);
		var cb = Math.cos(b);
		var sb = Math.sin(b);
		var cg = Math.cos(g);
		var sg = Math.sin(g);
		var m = [
			cb * cg,
			ca * sg + sa * sb * cg,
			sa * sg - ca * sb * cg,
			0,
			-cb * sg,
			ca * cg - sa * sb * sg,
			sa * cg + ca * sb * sg,
			0,
			sb,
			-sa * cb,
			ca * cb,
			0,
			0, 0, 0, 1
		];
		return m;
	},

	/**
	* @public
	*/
	multiply: function(m1, m2) {
		return [
			m1[0] * m2[0] + m1[4] * m2[1] + m1[8] * m2[2],
			m1[1] * m2[0] + m1[5] * m2[1] + m1[9] * m2[2],
			m1[2] * m2[0] + m1[6] * m2[1] + m1[10] * m2[2],
			0,
			m1[0] * m2[4] + m1[4] * m2[5] + m1[8] * m2[6],
			m1[1] * m2[4] + m1[5] * m2[5] + m1[9] * m2[6],
			m1[2] * m2[4] + m1[6] * m2[5] + m1[10] * m2[6],
			0,
			m1[0] * m2[8] + m1[4] * m2[9] + m1[8] * m2[10],
			m1[1] * m2[8] + m1[5] * m2[9] + m1[9] * m2[10],
			m1[2] * m2[8] + m1[6] * m2[9] + m1[10] * m2[10],
			0,
			m1[0] * m2[12] + m1[4] * m2[13] + m1[8] * m2[14] + m1[12],
			m1[1] * m2[12] + m1[5] * m2[13] + m1[9] * m2[14] + m1[13],
			m1[2] * m2[12] + m1[6] * m2[13] + m1[10] * m2[14] + m1[14],
			1
		];
	},

	/**
	* @public
	*/
	formatMatrix: function(m) {
		var matrix = 'matrix3d(';
		for (var i = 0; i < 15; i++) {
			matrix += (m[i] < 0.000001 && m[i] > -0.000001) ? '0,' : m[i] + ',';
		}
		matrix += m[15] + ')';
		return matrix;
	},

	/**
	* @public
	*/
	isTransform: function(transform) {
		return this.TRANSFORM[transform];
	},

	/**
	* @public
	*/
	parseMatrix: function (v) {
		var m = this.IDENTIY;
		v = v.replace(/^\w*\(/, '').replace(')', '');
		v = this.parseValue(v);
		if (v.length <= 6) {
			m[0] = v[0];
			m[1] = v[1];
			m[4] = v[2];
			m[5] = v[3];
			m[12] = v[4];
			m[13] = v[5];
		} else {
			m = v;
		}
		return m;
	},

	/**
	* @public
	*/
	parseValue: function (val) {
		return val.toString().split(",").map(function(v) {
			return parseFloat(v, 10);
		});
	},

	/**
	* @public
	*/
	getMatrix: function (style) {
		var m = style.getPropertyValue('transform') ||
				style.getPropertyValue('-moz-transform') ||
				style.getPropertyValue('-webkit-transform') ||
				style.getPropertyValue('-ms-transform') ||
				style.getPropertyValue('-o-transform');
		if (m === undefined || m === null || m == "none") {
			return "";
		}
		return this.parseMatrix(m);
	},

	/**
	* @public
	*/
	getStyleValue: function (style, key) {
		var v = style.getPropertyValue(key);
		if (v === undefined || v === null || v == "auto" || isNaN(v)) {
			return 0;
		}
		if (frame.COLOR[key]) {
			return v.replace(/^\w*\(/, '').replace(')', '');
		}
		v = parseFloat(v, 10);
		return v;
	},

	/**
	* @public
	*/
	accelerate: function (ele, m) {
		m = m ? m : this.IDENTIY;
		this.setTransformProperty(ele, m);
	},

	/**
	* @public
	*/
	setProperty: function (element, elProperty, elValue) {
		if (this.COLOR[elProperty]) {
			elValue = elValue.map(function(v) {
				return parseInt(v, 10);
			});
			element.style[elProperty] =  "rgb("+ elValue + ")";
		} else if (elProperty == "opacity") {
			var opacity = elValue[0].toFixed(6);
			opacity = (opacity <= 0) ? '0.000001' : opacity;
			element.style.opacity = opacity;
		} else {
			element.style[elProperty] = elValue[0] + "px";
		}
	},

	/**
	* @public
	*/
	setTransformProperty: function (element, matrix) {
		var mat = this.formatMatrix(matrix);
		element.style.transform = mat;
		element.style.webkitTransform = mat;
		element.style.MozTransform = mat;
		element.style.msTransform = mat;
		element.style.OTransform = mat;
	},

	/**
	* @public
	*/
	getCompoutedProperty: function (node, props, inital) {
		if(!node && !props) return;

		var end = {},
			start = {},
			matrix = "",
			key, val,
			style = Dom.getComputedStyle(node);

		//initilize start and end values
		for (key in this.TRANSFORM) {
			if (props[key]) {
				start[key] = inital ? inital[key] : undefined;
				end[key] = undefined;
			}
		}

		for (key in props) {
			val = start[key];
			if (!val) {
				if (this.isTransform(key)) {
					matrix = this.getMatrix(style);
					val = "";
				} else {
					val = this.getStyleValue(style, key);
				}
			}
			end[key] = this.parseValue(props[key]);
			start[key] = this.parseValue(val);
		}

		return {_start: start, _end: end, _matrix: matrix};
	}
};

/**
* @private
*/
frame.TRANSFORM = {
	"translate": 1,
	"translateX": 1,
	"translateY": 1,
	"translateZ": 1,
	"rotateX": 1,
	"rotateY": 1,
	"rotateZ": 1,
	"rotate": 1,
	"skew": 1,
	"scale": 1
};

/**
* @private
*/
frame.COLOR = {
	"color" : 1,
	"background-color": 1
};

/**
* @private
*/
frame.IDENTIY = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];