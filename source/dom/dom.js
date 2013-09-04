//* @public

/**
	Allow bootstrapping in environments that do not have a window object right away.
*/
enyo.requiresWindow = function(inFunction) {
	inFunction();
};

enyo.dom = {
	/**
		Shortcut for _document.getElementById_ if _id_ is a string, otherwise returns _id_.
		Uses _window.document_ unless a document is specified in the (optional) _doc_
		parameter.

			// find 'node' if it's a string id, or return it unchanged if it's already a node reference
			var domNode = enyo.dom.byId(node);
	*/
	byId: function(id, doc){
		return (typeof id == "string") ? (doc || document).getElementById(id) : id;
	},
	/**
		return string with ampersand, less-than, and greater-than characters
		replaced with HTML entities, e.g.

			'&lt;code&gt;"This &amp; That"&lt;/code&gt;'

		becomes

			'&amp;lt;code&amp;gt;"This &amp;amp; That"&amp;lt;/code&amp;gt;'
	*/
	escape: function(inText) {
		return inText !== null ? String(inText).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
	},
	/**
		Returns an object describing the geometry of this node, like so:

			{left: _offsetLeft_, top: _offsetTop_, width: _offsetWidth_, height: _offsetHeight_}
	*/
	getBounds: function(n) {
		if (n) {
			return {left: n.offsetLeft, top: n.offsetTop, width: n.offsetWidth, height: n.offsetHeight};
		}
		else {
			return null;
		}
	},
	//* @protected
	// this is designed to be copied into the computedStyle object
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
	getComputedStyle: function(inNode) {
		if(enyo.platform.ie < 9 && inNode && inNode.currentStyle) {
			//simple window.getComputedStyle polyfill for IE8
			var computedStyle = enyo.clone(inNode.currentStyle);
			computedStyle.getPropertyValue = this._ie8GetComputedStyle;
			computedStyle.setProperty = function() {
				return inNode.currentStyle.setExpression.apply(inNode.currentStyle, arguments);
			};
			computedStyle.removeProperty = function() {
				return inNode.currentStyle.removeAttribute.apply(inNode.currentStyle, arguments);
			};
			return computedStyle;
		} else {
			return window.getComputedStyle && inNode && window.getComputedStyle(inNode, null);
		}
	},
	getComputedStyleValue: function(inNode, inProperty, inComputedStyle) {
		var s   = inComputedStyle || this.getComputedStyle(inNode),
			nIE = enyo.platform.ie;

		s = s ? s.getPropertyValue(inProperty) : null;

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
				switch (inProperty) {
				case 'width':
					s = inNode.offsetWidth;
					break;
				case 'height':
					s = inNode.offsetHeight;
					break;
				}
			}
		}

		return s;
	},
	getFirstElementByTagName: function(inTagName) {
		var e = document.getElementsByTagName(inTagName);
		return e && e[0];
	},
	applyBodyFit: function() {
		var h = this.getFirstElementByTagName("html");
		if (h) {
			this.addClass(h, "enyo-document-fit");
		}
		enyo.dom.addBodyClass("enyo-body-fit");
		enyo.bodyIsFitting = true;
	},
	getWindowWidth: function() {
		if (window.innerWidth) {
			return window.innerWidth;
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
	getWindowHeight: function() {
		if (window.innerHeight) {
			return window.innerHeight;
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
	// moved from FittableLayout.js into common protected code
	_ieCssToPixelValue: function(inNode, inValue) {
		var v = inValue;
		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
		var s = inNode.style;
		// store style and runtime style values
		var l = s.left;
		var rl = inNode.runtimeStyle && inNode.runtimeStyle.left;
		// then put current style in runtime style.
		if (rl) {
			inNode.runtimeStyle.left = inNode.currentStyle.left;
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
	_pxMatch: /px/i,
	getComputedBoxValue: function(inNode, inProp, inBoundary, inComputedStyle) {
		var s = inComputedStyle || this.getComputedStyle(inNode);
		if (s && (!enyo.platform.ie || enyo.platform.ie >= 9)) {
			var p = s.getPropertyValue(inProp + "-" + inBoundary);
			return p === "auto" ? 0 : parseInt(p, 10);
		} else if (inNode && inNode.currentStyle) {
			var v = inNode.currentStyle[inProp + enyo.cap(inBoundary)];
			if (!v.match(this._pxMatch)) {
				v = this._ieCssToPixelValue(inNode, v);
			}
			return parseInt(v, 0);
		}
		return 0;
	},
	//* @public
	//* Gets the boundaries of a node's margin or padding box.
	calcBoxExtents: function(inNode, inBox) {
		var s = this.getComputedStyle(inNode);
		return {
			top: this.getComputedBoxValue(inNode, inBox, "top", s),
			right: this.getComputedBoxValue(inNode, inBox, "right", s),
			bottom: this.getComputedBoxValue(inNode, inBox, "bottom", s),
			left: this.getComputedBoxValue(inNode, inBox, "left", s)
		};
	},
	//* Gets the calculated padding of a node.
	calcPaddingExtents: function(inNode) {
		return this.calcBoxExtents(inNode, "padding");
	},
	//* Gets the calculated margin of a node.
	calcMarginExtents: function(inNode) {
		return this.calcBoxExtents(inNode, "margin");
	},
	/**
		Returns an object like `{top: 0, left: 0, bottom: 100, right: 100, height: 10, width: 10}`
		that represents the object's position relative to `relativeToNode` (suitable for absolute
		positioning within that parent node). Negative values mean part of the object is not visible.
		If you leave `relativeToNode` undefined (or it is not a parent element), then the position
		will be relative to the viewport and suitable for absolute positioning in a floating layer.
	*/
	calcNodePosition: function(inNode, relativeToNode) {
		// Parse upward and grab our positioning relative to the viewport
		var top = 0,
			left = 0,
			node = inNode,
			width = node.offsetWidth,
			height = node.offsetHeight,
			transformProp = enyo.dom.getStyleTransformProp(),
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
				if (node !== inNode) {
					if (node.currentStyle) {
						// Oh IE, we do so love working around your incompatibilities
						borderLeft = parseInt(node.currentStyle.borderLeftWidth, 10);
						borderTop = parseInt(node.currentStyle.borderTopWidth, 10);
					} else if (window.getComputedStyle) {
						borderLeft = parseInt(window.getComputedStyle(node, '').getPropertyValue('border-left-width'), 10);
						borderTop = parseInt(window.getComputedStyle(node, '').getPropertyValue('border-top-width'), 10);
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
	setInnerHtml: function(node, html) {
		node.innerHTML = html;
	},
	//* check a DOM node for a specific CSS class
	hasClass: function(node, s) {
		if (!node || !node.className) { return; }
		return (' ' + node.className + ' ').indexOf(' ' + s + ' ') >= 0;
	},
	//* uniquely add a CSS class to a DOM node
	addClass: function(node, s) {
		if (node && !this.hasClass(node, s)) {
			var ss = node.className;
			node.className = (ss + (ss ? ' ' : '') + s);
		}
	},
	//* remove a CSS class from a DOM node if it exists
	removeClass: function(node, s) {
		if (node && this.hasClass(node, s)) {
			var ss = node.className;
			node.className = (' ' + ss + ' ').replace(' ' + s + ' ', ' ').slice(1, -1);
		}
	},
	//*@public
	//* add a class to document.body. This defers the actual class change
	//* if nothing has been rendered into body yet.
	addBodyClass: function(s) {
		if (!enyo.exists(enyo.roots)) {
			if (enyo.dom._bodyClasses) {
				enyo.dom._bodyClasses.push(s);
			} else {
				enyo.dom._bodyClasses = [s];
			}
		}
		else {
			enyo.dom.addClass(document.body, s);
		}
	},
	//*@protected
	flushBodyClasses: function() {
		if (enyo.dom._bodyClasses) {
			for (var i = 0, c; (c=enyo.dom._bodyClasses[i]); ++i) {
				enyo.dom.addClass(document.body, c);
			}
			enyo.dom._bodyClasses = null;
		}
	},
	//*@protected
	_bodyClasses: null
};

// override setInnerHtml for Windows 8 HTML applications
if (typeof window.MSApp !== "undefined") {
	enyo.dom.setInnerHtml = function(node, html) {
		window.MSApp.execUnsafeLocalFunction(function() {
			node.innerHTML = html;
		});
	};
}

// use faster classList interface if it exists
if (document.head && document.head.classList) {
	enyo.dom.hasClass = function(node, s) {
		if (node) {
			return node.classList.contains(s);
		}
	};
	enyo.dom.addClass = function(node, s) {
		if (node) {
			return node.classList.add(s);
		}
	};
	enyo.dom.removeClass = function (node, s) {
		if (node) {
			return node.classList.remove(s);
		}
	};
}