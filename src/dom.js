/**
* Contains methods for working with DOM
* @module enyo/dom
*/
require('enyo');

var
	roots = require('./roots'),
	utils = require('./utils'),
	platform = require('./platform');

var dom = module.exports = {

	/**
	* Shortcut for `document.getElementById()` if `id` is a string; otherwise,
	* returns `id`. Uses `global.document` unless a document is specified in the
	* (optional) `doc` parameter.
	*
	* ```javascript
	* var
	* 	dom = require('enyo/dom');
	*
	* // find 'node' if it's a string id, or return it unchanged if it's already a node reference
	* var domNode = dom.byId(node);
	* ```
	*
	* @param {String} id - The document element ID to get.
	* @param {Node} [doc] - A [node]{@glossary Node} to search in. Default is the whole
	*	document.
	* @returns {Element} A reference to a DOM element.
	* @public
	*/
	byId: function(id, doc){
		return (typeof id == 'string') ? (doc || document).getElementById(id) : id;
	},

	/**
	* Returns a string with ampersand, less-than, and greater-than characters replaced with HTML
	* entities, e.g.,
	* ```
	* '&lt;code&gt;'This &amp; That'&lt;/code&gt;'
	* ```
	* becomes
	* ```
	* '&amp;lt;code&amp;gt;'This &amp;amp; That'&amp;lt;/code&amp;gt;'
	* ```
	*
	* @param {String} text - A string with entities you'd like to escape/convert.
	* @returns {String} A string that is properly escaped (the above characters.)
	* @public
	*/
	escape: function(text) {
		return text !== null ? String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
	},

	/**
	* Returns an object describing the geometry of this node.
	*
	* @param {Node} n - The [node]{@glossary Node} to measure.
	* @returns {Object} An object containing the properties `top`, `left`,
	* `height`, and `width`.
	* @public
	*/
	getBounds: function(n) {
		if (n) {
			return {left: n.offsetLeft, top: n.offsetTop, width: n.offsetWidth, height: n.offsetHeight};
		}
		else {
			return null;
		}
	},

	/**
	* This is designed to be copied into the `computedStyle` object.
	*
	* @private
	*/
	_ie8GetComputedStyle: function(prop) {
		var re = /(\-([a-z]){1})/g;
		if (prop === 'float') {
			prop = 'styleFloat';
		} else if (re.test(prop)) {
			prop = prop.replace(re, function () {
				return arguments[2].toUpperCase();
			});
		}
		return this[prop] !== undefined ? this[prop] : null;
	},

	/**
	* @private
	*/
	getComputedStyle: function(node) {
		if(platform.ie < 9 && node && node.currentStyle) {
			//simple global.getComputedStyle polyfill for IE8
			var computedStyle = utils.clone(node.currentStyle);
			computedStyle.getPropertyValue = this._ie8GetComputedStyle;
			computedStyle.setProperty = function() {
				return node.currentStyle.setExpression.apply(node.currentStyle, arguments);
			};
			computedStyle.removeProperty = function() {
				return node.currentStyle.removeAttribute.apply(node.currentStyle, arguments);
			};
			return computedStyle;
		} else {
			return global.getComputedStyle && node && global.getComputedStyle(node, null);
		}
	},

	/**
	* @private
	*/
	getComputedStyleValue: function(node, property, computedStyle) {
		var s   = computedStyle || this.getComputedStyle(node),
			nIE = platform.ie;

		s = s ? s.getPropertyValue(property) : null;

		if (nIE) {
			var oConversion = {
				'thin'   : (nIE > 8 ? 2 : 1) + 'px',
				'medium' : (nIE > 8 ? 4 : 3) + 'px',
				'thick'  : (nIE > 8 ? 6 : 5) + 'px',
				'none'   : '0'
			};
			if (typeof oConversion[s] != 'undefined') {
				s = oConversion[s];
			}

			if (s == 'auto') {
				switch (property) {
				case 'width':
					s = node.offsetWidth;
					break;
				case 'height':
					s = node.offsetHeight;
					break;
				}
			}
		}

		return s;
	},

	/**
	* @private
	*/
	getFirstElementByTagName: function(tagName) {
		var e = document.getElementsByTagName(tagName);
		return e && e[0];
	},

	/**
	* @private
	*/
	applyBodyFit: function() {
		var h = this.getFirstElementByTagName('html');
		if (h) {
			this.addClass(h, 'enyo-document-fit');
		}
		dom.addBodyClass('enyo-body-fit');
		dom.bodyIsFitting = true;
	},

	/**
	* @private
	*/
	getWindowWidth: function() {
		if (global.innerWidth) {
			return global.innerWidth;
		}
		if (document.body && document.body.offsetWidth) {
			return document.body.offsetWidth;
		}
		if (document.compatMode=='CSS1Compat' &&
			document.documentElement &&
			document.documentElement.offsetWidth ) {
			return document.documentElement.offsetWidth;
		}
		return 320;
	},

	/**
	* @private
	*/
	getWindowHeight: function() {
		if (global.innerHeight) {
			return global.innerHeight;
		}
		if (document.body && document.body.offsetHeight) {
			return document.body.offsetHeight;
		}
		if (document.compatMode=='CSS1Compat' &&
			document.documentElement &&
			document.documentElement.offsetHeight ) {
			return document.documentElement.offsetHeight;
		}
		return 480;
	},

	/**
	* The proportion by which the `body` tag differs from the global size, in both X and Y
	* dimensions. This is relevant when we need to scale the whole interface down from 1920x1080
	* (1080p) to 1280x720 (720p), for example.
	*
	* @private
	*/
	_bodyScaleFactorY: 1,
	_bodyScaleFactorX: 1,
	updateScaleFactor: function() {
		var bodyBounds = this.getBounds(document.body);
		this._bodyScaleFactorY = bodyBounds.height / this.getWindowHeight();
		this._bodyScaleFactorX = bodyBounds.width / this.getWindowWidth();
	},

	/**
	* @private
	*/
	// Workaround for lack of compareDocumentPosition support in IE8
	// Code MIT Licensed, John Resig; source: http://ejohn.org/blog/comparing-document-position/
	compareDocumentPosition: function(a, b) {
		return a.compareDocumentPosition ?
		a.compareDocumentPosition(b) :
		a.contains ?
			(a != b && a.contains(b) && 16) +
			(a != b && b.contains(a) && 8) +
			(a.sourceIndex >= 0 && b.sourceIndex >= 0 ?
				(a.sourceIndex < b.sourceIndex && 4) +
				(a.sourceIndex > b.sourceIndex && 2) :
				1) +
			0 :
			0;
	},

	/**
	* @private
	*/
	// moved from FittableLayout.js into common protected code
	_ieCssToPixelValue: function(node, value) {
		var v = value;
		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
		var s = node.style;
		// store style and runtime style values
		var l = s.left;
		var rl = node.runtimeStyle && node.runtimeStyle.left;
		// then put current style in runtime style.
		if (rl) {
			node.runtimeStyle.left = node.currentStyle.left;
		}
		// apply given value and measure its pixel value
		s.left = v;
		v = s.pixelLeft;
		// finally restore previous state
		s.left = l;
		if (rl) {
			s.runtimeStyle.left = rl;
		}
		return v;
	},

	/**
	* @private
	*/
	_pxMatch: /px/i,
	getComputedBoxValue: function(node, prop, boundary, computedStyle) {
		var s = computedStyle || this.getComputedStyle(node);
		if (s && (!platform.ie || platform.ie >= 9)) {
			var p = s.getPropertyValue(prop + '-' + boundary);
			return p === 'auto' ? 0 : parseInt(p, 10);
		} else if (node && node.currentStyle) {
			var v = node.currentStyle[prop + utils.cap(boundary)];
			if (!v.match(this._pxMatch)) {
				v = this._ieCssToPixelValue(node, v);
			}
			return parseInt(v, 0);
		}
		return 0;
	},

	/**
	* Gets the boundaries of a [node's]{@glossary Node} `margin` or `padding` box.
	*
	* @param {Node} node - The [node]{@glossary Node} to measure.
	* @param {Node} box - The boundary to measure from ('padding' or 'margin').
	* @returns {Object} An object containing the properties `top`, `right`, `bottom`, and
	*	`left`.
	* @public
	*/
	calcBoxExtents: function(node, box) {
		var s = this.getComputedStyle(node);
		return {
			top: this.getComputedBoxValue(node, box, 'top', s),
			right: this.getComputedBoxValue(node, box, 'right', s),
			bottom: this.getComputedBoxValue(node, box, 'bottom', s),
			left: this.getComputedBoxValue(node, box, 'left', s)
		};
	},

	/**
	* Gets the calculated padding of a node. Shortcut for
	* {@link module:enyo/dom#calcBoxExtents}.
	*
	* @param {Node} node - The [node]{@glossary Node} to measure.
	* @returns {Object} An object containing the properties `top`, `right`, `bottom`, and
	*	`left`.
	* @public
	*/
	calcPaddingExtents: function(node) {
		return this.calcBoxExtents(node, 'padding');
	},

	/**
	* Gets the calculated margin of a node. Shortcut for
	* {@link module:enyo/dom#calcBoxExtents}.
	*
	* @param {Node} node - The [node]{@glossary Node} to measure.
	* @returns {Object} An object containing the properties `top`, `right`, `bottom`, and
	*	`left`.
	* @public
	*/
	calcMarginExtents: function(node) {
		return this.calcBoxExtents(node, 'margin');
	},
	/**
	* Returns an object like `{top: 0, left: 0, bottom: 100, right: 100, height: 10, width: 10}`
	* that represents the object's position relative to `relativeToNode` (suitable for absolute
	* positioning within that parent node). Negative values mean part of the object is not
	* visible. If you leave `relativeToNode` as `undefined` (or it is not a parent element), then
	* the position will be relative to the viewport and suitable for absolute positioning in a
	* floating layer.
	*
	* @param {Node} node - The [node]{@glossary Node} to measure.
	* @param {Node} relativeToNode - The [node]{@glossary Node} to measure the distance from.
	* @returns {Object} An object containing the properties `top`, `right`, `bottom`, `left`,
	*	`height`, and `width`.
	* @public
	*/
	calcNodePosition: function(targetNode, relativeToNode) {
		// Parse upward and grab our positioning relative to the viewport
		var top = 0,
			left = 0,
			node = targetNode,
			width = node.offsetWidth,
			height = node.offsetHeight,
			transformProp = dom.getStyleTransformProp(),
			xregex = /translateX\((-?\d+)px\)/i,
			yregex = /translateY\((-?\d+)px\)/i,
			borderLeft = 0, borderTop = 0,
			totalHeight = 0, totalWidth = 0,
			offsetAdjustLeft = 0, offsetAdjustTop = 0;

		if (relativeToNode) {
			totalHeight = relativeToNode.offsetHeight;
			totalWidth = relativeToNode.offsetWidth;
		} else {
			totalHeight = (document.body.parentNode.offsetHeight > this.getWindowHeight() ? this.getWindowHeight() - document.body.parentNode.scrollTop : document.body.parentNode.offsetHeight);
			totalWidth = (document.body.parentNode.offsetWidth > this.getWindowWidth() ? this.getWindowWidth() - document.body.parentNode.scrollLeft : document.body.parentNode.offsetWidth);
		}

		if (node.offsetParent) {
			do {
				// Adjust the offset if relativeToNode is a child of the offsetParent
				// For IE 8 compatibility, have to use integer 8 instead of Node.DOCUMENT_POSITION_CONTAINS
				if (relativeToNode && this.compareDocumentPosition(relativeToNode, node.offsetParent) & 8) {
					offsetAdjustLeft = relativeToNode.offsetLeft;
					offsetAdjustTop = relativeToNode.offsetTop;
				}
				// Ajust our top and left properties based on the position relative to the parent
				left += node.offsetLeft - (node.offsetParent ? node.offsetParent.scrollLeft : 0) - offsetAdjustLeft;
				if (transformProp && xregex.test(node.style[transformProp])) {
					left += parseInt(node.style[transformProp].replace(xregex, '$1'), 10);
				}
				top += node.offsetTop - (node.offsetParent ? node.offsetParent.scrollTop : 0) - offsetAdjustTop;
				if (transformProp && yregex.test(node.style[transformProp])) {
					top += parseInt(node.style[transformProp].replace(yregex, '$1'), 10);
				}
				// Need to correct for borders if any exist on parent elements
				if (node !== targetNode) {
					if (node.currentStyle) {
						// Oh IE, we do so love working around your incompatibilities
						borderLeft = parseInt(node.currentStyle.borderLeftWidth, 10);
						borderTop = parseInt(node.currentStyle.borderTopWidth, 10);
					} else if (global.getComputedStyle) {
						borderLeft = parseInt(global.getComputedStyle(node, '').getPropertyValue('border-left-width'), 10);
						borderTop = parseInt(global.getComputedStyle(node, '').getPropertyValue('border-top-width'), 10);
					} else {
						// No computed style options, so try the normal style object (much less robust)
						borderLeft = parseInt(node.style.borderLeftWidth, 10);
						borderTop = parseInt(node.style.borderTopWidth, 10);
					}
					if (borderLeft) {
						left += borderLeft;
					}
					if (borderTop) {
						top += borderTop;
					}
				}
				// Continue if we have an additional offsetParent, and either don't have a relativeToNode or the offsetParent is contained by the relativeToNode (if offsetParent contains relativeToNode, then we have already calculated up to the node, and can safely exit)
				// For IE 8 compatibility, have to use integer 16 instead of Node.DOCUMENT_POSITION_CONTAINED_BY
			} while ((node = node.offsetParent) && (!relativeToNode || this.compareDocumentPosition(relativeToNode, node) & 16));
		}
		return {
			'top': top,
			'left': left,
			'bottom': totalHeight - top - height,
			'right': totalWidth - left - width,
			'height': height,
			'width': width
		};
	},

	/**
	* Sets the `innerHTML` property of the specified `node` to `html`.
	*
	* @param {Node} node - The [node]{@glossary Node} to set.
	* @param {String} html - An HTML string.
	* @public
	*/
	setInnerHtml: function(node, html) {
		node.innerHTML = html;
	},

	/**
	* Checks a [DOM]{@glossary Node} [node]{@glossary Node} for a specific CSS class.
	*
	* @param {Node} node - The [node]{@glossary Node} to set.
	* @param {String} s - The class name to check for.
	* @returns {(Boolean|undefined)} `true` if `node` has the `s` class; `undefined`
	* if there is no `node` or it has no `className` property.
	* @public
	*/
	hasClass: function(node, s) {
		if (!node || !s || !node.className) { return; }
		return (' ' + node.className + ' ').indexOf(' ' + s + ' ') >= 0;
	},

	/**
	* Uniquely adds a CSS class to a DOM node.
	*
	* @param {Node} node - The [node]{@glossary Node} to set.
	* @param {String} s - The class name to add.
	* @public
	*/
	addClass: function(node, s) {
		if (node && s && !this.hasClass(node, s)) {
			var ss = node.className;
			node.className = (ss + (ss ? ' ' : '') + s);
		}
	},

	/**
	* Removes a CSS class from a DOM node if it exists.
	*
	* @param {Node} node - The [node]{@glossary Node} from which to remove the class.
	* @param {String} s - The class name to remove from `node`.
	* @public
	*/
	removeClass: function(node, s) {
		if (node && s && this.hasClass(node, s)) {
			var ss = node.className;
			node.className = (' ' + ss + ' ').replace(' ' + s + ' ', ' ').slice(1, -1);
		}
	},

	/**
	* Adds a class to `document.body`. This defers the actual class change if nothing has been
	* rendered into `body` yet.
	*
	* @param {String} s - The class name to add to the document's `body`.
	* @public
	*/
	addBodyClass: function(s) {
		if (!utils.exists(roots.roots) || roots.roots.length === 0) {
			if (dom._bodyClasses) {
				dom._bodyClasses.push(s);
			} else {
				dom._bodyClasses = [s];
			}
		}
		else {
			dom.addClass(document.body, s);
		}
	},

	/**
	* Returns an object describing the absolute position on the screen, relative to the top left
	* corner of the screen. This function takes into account account absolute/relative
	* `offsetParent` positioning, `scroll` position, and CSS transforms (currently
	* `translateX`, `translateY`, and `matrix3d`).
	*
	* ```javascript
	* {top: ..., right: ..., bottom: ..., left: ..., height: ..., width: ...}
	* ```
	*
	* Values returned are only valid if `hasNode()` is truthy. If there's no DOM node for the
	* object, this returns a bounds structure with `undefined` as the value of all fields.
	*
	* @param {Node} n - The [node]{@glossary Node} to measure.
	* @returns {Object} An object containing the properties `top`, `right`, `bottom`, `left`,
	*	`height`, and `width`.
	* @public
	*/
	getAbsoluteBounds: function(targetNode) {
		return utils.clone(targetNode.getBoundingClientRect());
	},

	/**
	* @private
	*/
	flushBodyClasses: function() {
		if (dom._bodyClasses) {
			for (var i = 0, c; (c=dom._bodyClasses[i]); ++i) {
				dom.addClass(document.body, c);
			}
			dom._bodyClasses = null;
		}
	},

	/**
	* @private
	*/
	_bodyClasses: null,

	/**
	* Convert to various unit formats. Useful for converting pixels to a resolution-independent
	* measurement method, like "rem". Other units are available if defined in the
	* {@link module:enyo/dom#unitToPixelFactors} object.
	*
	* ```javascript
	* var
	* 	dom = require('enyo/dom');
	*
	* // Do calculations and get back the desired CSS unit.
	* var frameWidth = 250,
	*     frameWithMarginInches = dom.unit( 10 + frameWidth + 10, 'in' ),
	*     frameWithMarginRems = dom.unit( 10 + frameWidth + 10, 'rem' );
	* // '2.8125in' == frameWithMarginInches
	* // '22.5rem' == frameWithMarginRems
	* ```
	*
	* @param {(String|Number)} pixels - The the pixels or math to convert to the unit.
	*	("px" suffix in String format is permitted. ex: `'20px'`)
	* @param {(String)} toUnit - The name of the unit to convert to.
	* @returns {(Number|undefined)} Resulting conversion, in case of malformed input, `undefined`
	* @public
	*/
	unit: function (pixels, toUnit) {
		if (!toUnit || !this.unitToPixelFactors[toUnit]) return;
		if (typeof pixels == 'string' && pixels.substr(-2) == 'px') pixels = parseInt(pixels.substr(0, pixels.length - 2), 10);
		if (typeof pixels != 'number') return;

		return (pixels / this.unitToPixelFactors[toUnit]) + '' + toUnit;
	},

	/**
	* Object that stores all of the pixel conversion factors to each keyed unit.
	*
	* @public
	*/
	unitToPixelFactors: {
		'rem': 12,
		'in': 96
	}
};

// override setInnerHtml for Windows 8 HTML applications
if (typeof global.MSApp !== 'undefined') {
	dom.setInnerHtml = function(node, html) {
		global.MSApp.execUnsafeLocalFunction(function() {
			node.innerHTML = html;
		});
	};
}

// use faster classList interface if it exists
if (document.head && document.head.classList) {
	dom.hasClass = function(node, s) {
		if (node) {
			return node.classList.contains(s);
		}
	};
	dom.addClass = function(node, s) {
		if (node) {
			return node.classList.add(s);
		}
	};
	dom.removeClass = function (node, s) {
		if (node) {
			return node.classList.remove(s);
		}
	};
}

/**
* Allows bootstrapping in environments that do not have a global object right away.
*
* @param {Function} func - The function to run
* @public
*/
dom.requiresWindow = function(func) {
	func();
};


var cssTransformProps = ['transform', '-webkit-transform', '-moz-transform', '-ms-transform', '-o-transform'],
	styleTransformProps = ['transform', 'webkitTransform', 'MozTransform', 'msTransform', 'OTransform'];

/**
* @private
*/
dom.calcCanAccelerate = function() {
	/* Android 2 is a liar: it does NOT support 3D transforms, even though Perspective is the best check */
	if (platform.android <= 2) {
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
dom.getCssTransformProp = function() {
	if (this._cssTransformProp) {
		return this._cssTransformProp;
	}
	var i = utils.indexOf(this.getStyleTransformProp(), styleTransformProps);
	this._cssTransformProp = cssTransformProps[i];
	return this._cssTransformProp;
};

/**
* @private
*/
dom.getStyleTransformProp = function() {
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
dom.domTransformsToCss = function(inTransforms) {
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
dom.transformsToDom = function(control) {
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
* Returns `true` if the platform supports CSS3 Transforms.
*
* @returns {Boolean} `true` if platform supports CSS `transform` property;
* otherwise, `false`.
* @public
*/
dom.canTransform = function() {
	return Boolean(this.getStyleTransformProp());
};

/**
* Returns `true` if platform supports CSS3 3D Transforms.
*
* Typically used like this:
* ```
* if (dom.canAccelerate()) {
* 	dom.transformValue(this.$.slidingThing, 'translate3d', x + ',' + y + ',' + '0')
* } else {
* 	dom.transformValue(this.$.slidingThing, 'translate', x + ',' + y);
* }
* ```
*
* @returns {Boolean} `true` if platform supports CSS3 3D Transforms;
* otherwise, `false`.
* @public
*/
dom.canAccelerate = function() {
	return (this.accelerando !== undefined) ? this.accelerando : document.body && (this.accelerando = this.calcCanAccelerate());
};

/**
* Applies a series of transforms to the specified {@link module:enyo/Control~Control}, using
* the platform's prefixed `transform` property.
*
* **Note:** Transforms are not commutative, so order is important.
*
* Transform values are updated by successive calls, so
* ```javascript
* dom.transform(control, {translate: '30px, 40px', scale: 2, rotate: '20deg'});
* dom.transform(control, {scale: 3, skewX: '-30deg'});
* ```
*
* is equivalent to:
* ```javascript
* dom.transform(control, {translate: '30px, 40px', scale: 3, rotate: '20deg', skewX: '-30deg'});
* ```
*
* When applying these transforms in a WebKit browser, this is equivalent to:
* ```javascript
* control.applyStyle('-webkit-transform', 'translate(30px, 40px) scale(3) rotate(20deg) skewX(-30deg)');
* ```
*
* And in Firefox, this is equivalent to:
* ```javascript
* control.applyStyle('-moz-transform', 'translate(30px, 40px) scale(3) rotate(20deg) skewX(-30deg)');
* ```
*
* @param {module:enyo/Control~Control} control - The {@link module:enyo/Control~Control} to transform.
* @param {Object} transforms - The set of transforms to apply to `control`.
* @public
*/
dom.transform = function(control, transforms) {
	var d = control.domTransforms = control.domTransforms || {};
	utils.mixin(d, transforms);
	this.transformsToDom(control);
};

/**
* Applies a single transform to the specified {@link module:enyo/Control~Control}.
*
* Example:
* ```
* tap: function(inSender, inEvent) {
* 	var c = inEvent.originator;
* 	var r = c.rotation || 0;
* 	r = (r + 45) % 360;
* 	c.rotation = r;
* 	dom.transformValue(c, 'rotate', r);
* }
* ```
*
* This will rotate the tapped control by 45 degrees clockwise.
*
* @param {module:enyo/Control~Control} control - The {@link module:enyo/Control~Control} to transform.
* @param {String} transform - The name of the transform function.
* @param {(String|Number)} value - The value to apply to the transform.
* @public
*/
dom.transformValue = function(control, transform, value) {
	var d = control.domTransforms = control.domTransforms || {};
	d[transform] = value;
	this.transformsToDom(control);
};

/**
* Applies a transform that should trigger GPU compositing for the specified
* {@link module:enyo/Control~Control}. By default, the acceleration is only
* applied if the browser supports it. You may also optionally force-set `value`
* directly, to be applied to `translateZ(value)`.
*
* @param {module:enyo/Control~Control} control - The {@link module:enyo/Control~Control} to accelerate.
* @param {(String|Number)} [value] - An optional value to apply to the acceleration transform
*	property.
* @public
*/
dom.accelerate = function(control, value) {
	var v = value == 'auto' ? this.canAccelerate() : value;
	this.transformValue(control, 'translateZ', v ? 0 : null);
};


/**
 * The CSS `transition` property name for the current browser/platform, e.g.:
 *
 * * `-webkit-transition`
 * * `-moz-transition`
 * * `transition`
 *
 * @type {String}
 * @private
 */
dom.transition = (platform.ios || platform.android || platform.chrome || platform.androidChrome || platform.safari)
	? '-webkit-transition'
	: (platform.firefox || platform.firefoxOS || platform.androidFirefox)
		? '-moz-transition'
		: 'transition';
