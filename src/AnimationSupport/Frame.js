/*jslint white: true*/
require('enyo');

var 
	Dom = require('../dom'),
	Vector = require('./Vector'),
	utils =  require('../utils'),
	Matrix = require('./Matrix');

var
	BORDER = {'border-radius': 1, 'border-top-left-radius': 1, 'border-top-right-radius': 1, 'border-bottom-left-radius': 1, 'border-bottom-right-radius': 1, 'border-image-slice': 1},
	COLOR = {'color': 1, 'background-color': 1, 'border-color': 1, 'border-top-color': 1, 'border-left-color': 1, 'border-right-color': 1, 'border-bottom-color': 1, 'fill': 1, 'flood-color': 1,'lighting-color': 1, 'stop-color': 1, 'outline-color': 1},
	INT_UNIT = {'z-index': 1},
	OPACITY = {'opacity': 1, 'flood-opacity': 1, 'stop-opacity': 1, 'fill-opacity': 1, 'stroke-opacity': 1},
	TRANSFORM = {translate: 1, translateX: 1, translateY: 1, translateZ: 1, rotateX: 1, rotateY: 1, rotateZ: 1, rotate: 1, skew: 1, scale: 1, perspective: 1};

/**
 * Frame is a module responsible for providing animation features required for a frame.
 * This module exposes bunch of animation API's like  matrix calculation,
 * fetching initial DOM properties and also applying style updates to DOM.
 * 
 * These methods need to be merged with DOM API's of enyo.
 * 
 * @module enyo/AnimationSupport/Frame
 */
var frame = module.exports = {
	/**
	 * Calculate matrix3d of a frame based on transformation vectors.
	 * @public
	 * @param  {Number[]} trns Translate vector
	 * @param  {Number[]} rot  Rotate quaternion vector
	 * @param  {Number[]} sc   Scale vector
	 * @param  {Number[]} sq   Skew vector
	 * @param  {Number[]} per  Perspective vector
	 * @return {Number[]}      Final Matrix3d for particular frame
	 */
	recomposeMatrix: function (trns, rot, sc, sq, per) {
		var i,
			x = rot[0],
			y = rot[1],
			z = rot[2],
			w = rot[3],
			m = Matrix.identity(),
			sM = Matrix.identity(),
			rM = Matrix.identity();

		// apply perspective
		if(per) {
			m[3] = per[0];
			m[7] = per[1];
			m[11] = per[2];
			m[15] = per[3];
		}

		m[12] = trns[0];
		m[13] = trns[1];
		m[14] = trns[2];

		// apply rotate
		rM[0] = 1 - 2 * (y * y + z * z);
		rM[1] = 2 * (x * y - z * w);
		rM[2] = 2 * (x * z + y * w);
		rM[4] = 2 * (x * y + z * w);
		rM[5] = 1 - 2 * (x * x + z * z);
		rM[6] = 2 * (y * z - x * w);
		rM[8] = 2 * (x * z - y * w);
		rM[9] = 2 * (y * z + x * w);
		rM[10] = 1 - 2 * (x * x + y * y);

		m = Matrix.multiply(m, rM);

		// apply skew
		if (sq[2]) {
			sM[9] = sq[2];
			m = Matrix.multiply(m, sM);
		}

		if (sq[1]) {
			sM[9] = 0;
			sM[8] = sq[1];
			m = Matrix.multiply(m, sM);
		}

		if (sq[0]) {
			sM[8] = 0;
			sM[4] = sq[0];
			m = Matrix.multiply(m, sM);
		}

		// apply scale
		for (i = 0; i < 12; i += 4) {
			m[0 + i] *= sc[0];
			m[1 + i] *= sc[1];
			m[2 + i] *= sc[2];
		}
		return m;
	},

	/**
	 * Decompose transformation vectors into various properties out of matrix3d.
	 * @public
	 * @param  {Number[]} matrix Matrix3d
	 * @param  {Object}   ret    To store various transformation properties like translate, rotate, scale, skew and perspective.
	 * @return {Boolean}         true, if matrix exists else false.
	 */
	decomposeMatrix: function (matrix, ret) {
		var i,
			tV = [],
			rV = [],
			pV = [],
			skV = [],
			scV = [],
			row = [],
			pdum3 = {};

		if (matrix[15] === 0) return false;

		for (i = 0; i < 16; i++)
			matrix[0] /= matrix[15];

		//TODO: decompose perspective
		pV = [0, 0, 0, 0];

		for (i = 0; i < 3; i++)
			tV[i] = matrix[12 + i];

		for (i = 0; i < 12; i += 4) {
			row.push([
				matrix[0 + i],
				matrix[1 + i],
				matrix[2 + i]
			]);
		}

		scV[0] = Vector.len(row[0]);
		row[0] = Vector.normalize(row[0]);
		skV[0] = Vector.dot(row[0], row[1]);
		row[1] = Vector.combine(row[1], row[0], 1.0, -skV[0]);

		scV[1] = Vector.len(row[1]);
		row[1] = Vector.normalize(row[1]);
		skV[0] /= scV[1];

		// Compute XZ and YZ shears, orthogonalized 3rd row
		skV[1] = Vector.dot(row[0], row[2]);
		row[2] = Vector.combine(row[2], row[0], 1.0, -skV[1]);
		skV[2] = Vector.dot(row[1], row[2]);
		row[2] = Vector.combine(row[2], row[1], 1.0, -skV[2]);

		// Next, get Z scale and normalize 3rd row.
		scV[2] = Vector.len(row[2]);
		row[2] = Vector.normalize(row[2]);
		skV[1] /= scV[2];
		skV[2] /= scV[2];

		pdum3 = Vector.cross(row[1], row[2]);
		if (Vector.dot(row[0], pdum3) < 0) {
			for (i = 0; i < 3; i++) {
				scV[i] *= -1;
				row[i][0] *= -1;
				row[i][1] *= -1;
				row[i][2] *= -1;
			}
		}

		rV[0] = 0.5 * Math.sqrt(Math.max(1 + row[0][0] - row[1][1] - row[2][2], 0));
		rV[1] = 0.5 * Math.sqrt(Math.max(1 - row[0][0] + row[1][1] - row[2][2], 0));
		rV[2] = 0.5 * Math.sqrt(Math.max(1 - row[0][0] - row[1][1] + row[2][2], 0));
		rV[3] = 0.5 * Math.sqrt(Math.max(1 + row[0][0] + row[1][1] + row[2][2], 0));

		if (row[2][1] > row[1][2]) rV[0] = -rV[0];
		if (row[0][2] > row[2][0]) rV[1] = -rV[1];
		if (row[1][0] > row[0][1]) rV[2] = -rV[2];

		ret.translate = tV;
		ret.rotate = rV;
		ret.scale = scV;
		ret.skew = skV;
		ret.perspective = pV;
		return true;
	},

	/**
	 * Clones an array based on offset value.
	 * @public
	 * @param  {Object} v      Object with transformation properties like translate, rotate, scale, skew and perspective.
	 * @param  {Number} offset Determine how many Object to copy.
	 * @return {Number[]}      Array with sliced value based on offset.
	 */
	copy: function (v, offset) {
		return Array.prototype.slice.call(v, offset || 0);
	},

	/**
	 * Validates if property is a transform property.
	 * @public
	 * @param  {String} transform Any transform property, for which we want to identify whether or not the property is transform.
	 * @return {Number}           Value of the required transform property.
	 */
	isTransform: function (transform) {
		return TRANSFORM[transform];
	},

	/**
	 * Applies transformation to DOM element with the Matrix3d values.
	 * @public
	 * @param  {enyo.Component} actor	Component to be animated.
	 * @param  {Number[]}    m   Matrix3d
	 */
	accelerate: function (actor, m) {
		m = m ? m : Matrix.identity();
		frame.setTransformProperty(actor, m);
	},

	/**
	 * Reform matrix 2D to 3D
	 * @public
	 * @param  {Number[]} v Matrix(2d)
	 * @return {Number[]}   Matrix3d
	 */
	parseMatrix: function (v) {
		var m = Matrix.identity();
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
	 * Converts comma separated values to array.
	 * @public
	 * @param  {String}   val Value of required animation in any property.
	 * @return {Number[]}     Create array from val.
	 */
	parseValue: function (val) {
		return val.toString().split(",").map(function(v) {
			return parseFloat(v, 10);
		});
	},

	parseShortHand: function (val, length) {
		var res;
		if (val.indexOf('rgb') === 0) {
			res = this.parseValue(val.split(')')[0].replace(/^\w*\(/, '').concat(val.split(')')[1]));
		} else {
			res = this.parseValue(val.split('rgb(')[1].replace(')',',').concat(val.split('rgb(')[0]).replace(/, $/,''));
		}
		return res.concat(Array(length - res.length).fill(0));
	},

	/**
	 * Gets a matrix for DOM element.
	 * @public
	 * @param  {HTMLElement} style CSS style declaration.
	 * @return {Number[]}          Matrix3d
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
	 * Gets a style property applied from the DOM element.
	 * @public
	 * @param  {HTMLElement}  style Computed style of a DOM.
	 * @param  {String}       key   Property name for which style has to be fetched.
	 * @return {Number|HTMLElement} 
	 */
	getStyleValue: function (style, key) {
		var v = style.getPropertyValue(key) || style[key];
		if (!v || v === "auto") {
			return 0;
		}
		if (key === 'box-shadow') {
			if (v === 'none') return Array(7).fill(0);
			return v.split(')')[0].replace(/^\w*\(/, '').concat(v.split(')')[1].split(' ').join(','));
		}
		if (COLOR[key]) {
			return v.replace(/^\w*\(/, '').replace(')', '');
		}
		if (isNaN(v)) {
			return 0;
		}
		v = parseFloat(v, 10);
		return v;
	},

	/**
	 * Applies style property to DOM element.
	 * @public
	 * @param {enyo.Component} 	actor	Component to be animated.
	 * @param {String}      	prop 	CSS property to be applied.
	 * @param {Number}      val  Value of the property applied.
	 */
	setProperty: function (actor, prop, val) {
		if (COLOR[prop]) {
			val = val.map(function(v) { return parseInt(v, 10);});
			val = 'rgb('+ val + ')';
		} else if(INT_UNIT[prop]) {
			val = parseInt(val[0], 10);
		} else if (BORDER[prop]) {
			val = val[0] + '%';
		} else if (OPACITY[prop]) {
			val = val[0].toFixed(6);
			val = (val <= 0) ? '0.000001' : val;
		} else if (prop === 'box-shadow') {
			val = 'rgb('+ val.slice(0, 3).map(function(v) { return parseInt(v, 10);})
				+ ') ' + val.slice(3).map(function(v) {return v + 'px'}).join(' ');
		} else {
			val = val[0] + 'px';
		}
		
		actor.addStyles(prop + ':' + val + ';');
	},

	/**
	 * Applies transform property to DOM element.
	 * @public
	 * @param {enyo.Component} 	actor 	Component to be animated.
	 * @param {Number[]}    	matrix		Matrix3d
	 */
	setTransformProperty: function (actor, matrix) {
		var mat = Matrix.toString(matrix);
		/*element.style.transform = mat;
		element.style.webkitTransform = mat;
		element.style.MozTransform = mat;
		element.style.msTransform = mat;
		element.style.OTransform = mat;*/
		actor.addStyles('transform:' + mat + ';'
		      + 'webkitTransform:' + mat + ';'
		      + 'MozTransform:' + mat + ';'
		      + 'msTransform' + mat + ';'
		      + 'OTransform' + mat + ';');
	},

	/**
	 * Get DOM node animation properties.
	 * @public
	 * @param  {HTMLElement} node    DOM node
	 * @param  {Object}      props   Properties to fetch from DOM.
	 * @param  {Object}      initial Default properties to be applied.
	 * @return {Object}              Object with various animation properties.
	 */     
	getComputedProperty: function (node, props, initial) {
		if(!node) return;

		var eP = {},
			sP = initial ? utils.mixin({}, initial) : {},
			tP = {},
			dP = {},
			m, k, u, v,
			s = initial ? undefined : Dom.getComputedStyle(node);

		for (k in props) {
			v = sP[k];
			if (!this.isTransform(k)) {
				v = v || this.getStyleValue(s || Dom.getComputedStyle(node), k);
				sP[k] = this.parseValue(v);
				if (k === 'box-shadow' || COLOR[k]) {
					eP[k] = this.parseShortHand(props[k], sP[k].length);
				} else {
					eP[k] = this.parseValue(props[k]);
				}
			} else {
				v = this.parseValue(props[k]);
				//tP[k] = k == 'rotate' ? Vector.toQuant(v) : v;
				tP[k] = v;
			}
		}

		if (initial) {
			dP.translate = initial.translate;
			dP.rotate = initial.rotate.length < 4 ? Vector.toQuant(initial.rotate) : initial.rotate;
			dP.scale = initial.scale;
			dP.skew = initial.skew;
			dP.perspective = initial.perspective;
		} else {
			m = this.getMatrix(s || Dom.getComputedStyle(node)) || Matrix.identity();
			this.decomposeMatrix(m, dP);
		}

		for(k in dP) {
			sP[k] = dP[k];
			eP[k] = tP[k] || dP[k];
		}
		return {_startAnim: sP, _endAnim: eP, _transform: dP, currentState: dP, matrix: m, props: props};
	},

	/**
	 * Get DOM node animation distance.
	 * @public
	 * @param  {HTMLElement} prop       DOM node properties.
	 * @param  {Object}      initalProp Initial properties to fetch from DOM.
	 * @param  {Object}      finalProp  Final properties to be applied.
	 * @return {Object}                 Total computed distance to animate.
	 */
	getComputedDistance: function (prop, initalProp, finalProp) {
		var k, sV, eV, dst, tot = 0;
		for (k in prop) {
			sV = (k === 'rotate' ? Vector.quantToVector(initalProp[k]) : initalProp[k]);
			eV = finalProp[k];
			dst = Vector.distance(eV, sV);
			tot += dst;
		}
		return tot;
	}
};