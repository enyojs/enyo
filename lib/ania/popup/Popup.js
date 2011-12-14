/**
A popup is just floating elements embedded directly within the page context.
It can popup/open at a specified position, and has support for modality and click to dismiss/close.

	{kind: "Popup", components: [
		{content: "Hello World!"},
		{kind: "Selector", value: "Foo", items: ["Foo", "Bar", "Bot"]}
	]}

To open the popup at the center:

	openPopup: function() {
		this.$.popup.openAtCenter();
	}

If dismissWithClick is set to true (default) and modal is false (default), then clicking anywhere not inside the popup will dismiss/close the popup.
Also, you can close the popup programmatically by doing this:

	closePopup: function() {
		this.$.popup.close();
	}
*/
enyo.kind({
	name: "enyo.Popup",
	kind: enyo.BasicPopup,
	published: {
		/**
		Controls how the popup will be shown and hidden:
		
			auto: when open and close are called, the popup will be shown and hidden
			manual: will not be shown or hidden; use this mode when controlling popup via custom animation
			transition: will be shown when opened and hidden when a css transition completes; use this 
			mode when animating via css transitions
		*/
		showHideMode: "auto",
		//* Css class that will be applied when the popup is open
		openClassName: "",
		/**
			Show the keyboard before opening the popup. Manual keyboard mode is enabled when the popup is 
			opened and must be restored for the keyboard to work automatically. It is most common to use 
			this option when an Input should be focused when the keyboard is shown.
			In this case, implement an onOpen handler for the popup and focus the input using the method 
			forceFocusEnableKeyboard, e.g. this.$.input.forceFocusEnableKeyboard();
		*/
		showKeyboardWhenOpening: false,
		//** Specify a maximum height for the Popup
		maxHeight: "",
		//** Specify a maximum width for the Popup
		maxWidth: ""
	},
	//* @protected
	contentControlName: "client",
	preventContentOverflow: true,
	create: function() {
		this.inherited(arguments);
		this.boundsInfo = null;
	},
	destroy: function() {
		this.removeListeners();
		clearTimeout(this.openingHandle);
		this.openingHandle = null;
		this.inherited(arguments);
	},
	rendered: function() {
		this.inherited(arguments);
		this.addListeners();
	},
	teardownRender: function() {
		this.removeListeners();
		this.inherited(arguments);
	},
	addListeners: function() {
		if (this.hasNode()) {
			this.transitionEndListener = enyo.bind(this, "webkitTransitionEndHandler");
			this.node.addEventListener("webkitTransitionEnd", this.transitionEndListener, false);
		}
	},
	removeListeners: function() {
		if (this.hasNode()) {
			this.node.removeEventListener("webkitTransitionEnd", this.transitionEndListener, false);
		}
	},
	webkitTransitionEndHandler: function() {
		this.setShowing(this.isOpen);
	},
	open: function() {
		if (this.isOpen) {
			this.applyBoundsInfo();
		} else {
			this.inherited(arguments);
		}
	},
	prepareOpen: function() {
		if (this.openingHandle) {
			return;
		}
		if (this.showKeyboardWhenOpening && !this.triggeringKeyboard) {
			this._toggledKeyboard = !enyo.keyboard.isManualMode();
			enyo.call(enyo.keyboard, "forceShow");
			this.triggeringKeyboard = true;
			this.deferOpen(500);
		} else if (this.inherited(arguments)) {
			this.applyBoundsInfo();
			return true;
		}
	},
	deferOpen: function(inMs) {
		this.openingHandle = setTimeout(enyo.bind(this, "finishDeferOpen"), inMs);
	},
	finishDeferOpen: function() {
		this.openingHandle = null;
		this.open();
	},
	finishOpen: function() {
		this.triggeringKeyboard = false;
		this.inherited(arguments);
	},
	afterOpen: function() {
		if (this.openClassName) {
			this.addClass(this.openClassName);
		}
		this.inherited(arguments);
	},
	prepareClose: function() {
		if (this.openClassName) {
			this.removeClass(this.openClassName);
		}
		this.boundsInfo = null;
		this.inherited(arguments);
		this.clearSizeCache();
	},
	renderOpen: function() {
		if (this.showHideMode != "manual") {
			this.inherited(arguments);
		}
	},
	renderClose: function() {
		if (this.showHideMode == "auto") {
			this.inherited(arguments);
		}
	},
	resizeHandler: function() {
		if (this.isOpen) {
			var args = arguments;
			// FIXME: Wait a beat to resize. We need to do this to dismiss correctly via a click 
			// when the device keyboard hides as the result of the click.
			// This is because the keyboard hides on mouse up and if it is in resize window mode, the
			// window resizes, prompting this resize handler to be called. Resizing a popup can result
			// in it moving position and this can move the button the user clicked on at mouseup time.
			// Moving a button underneath the mouse at mouse up time can prevent a click from firing.
			// Avoid this issue by deferring resize slightly; we only need the space between mouseup and click.
			enyo.asyncMethod(this, function() {
				this.applyBoundsInfo();
				this.inherited(args);
			});
		}
	},
	offsetChangedHandler: function() {
		if (this.isOpen) {
			this.applyBoundsInfo();
		}
	},
	//* @public
	/**
	Open at the location specified by a location relative to the viewport

	inRect {Object} rectangle specifying where to open the popup. May contain left, top or 
	right, bottom properties. If both are specified left,top is used.
	*/
	openAt: function(inRect, inReposition) {
		this.setBoundsInfo("applyBounds", arguments);
		this.open();
	},
	/**
	Open at the location of a mouse event (inEvent). The popup's position is automatically constrained
	so that it does not display outside the viewport.
	
	inEvent {Object} Dom mouse event object at the position of which, popup will open

	inOffset {Object} Object which may contain left and top properties to specify an offset relative
	to the location the popup would otherwise be positioned.
	*/
	openAtEvent: function(inEvent, inOffset) {
		this.setBoundsInfo("applyAtEventBounds", arguments);
		this.open();
	},
	/**
	Open at the location of the specified control. If there is space, the popup's top, left corner 
	will be displayed at the top, left position of the control.
	Otherwise, the popup's bottom, right will be displayed at the bottom, right of the control.

	inControl {Control} Control at whose location popup will open.

	inOffset {Object} Object which may contain left and top properties to specify an offset relative
	to the location the popup would otherwise be positioned.
	*/
	openAtControl: function(inControl, inOffset) {
		this.setBoundsInfo("applyAtControlBounds", arguments);
		this.open();
	},
	/**
	Open at the bottom, right of the specified control.
	*/
	openAroundControl: function(inControl, inAlwaysBelow, inAlign) {
		this.setBoundsInfo("applyAroundControlBounds", arguments);
		this.open();
	},
	// inDimensions can have {top, left, right, bottom, width, height}
	//
	openNear: function(inDimensions, inAround, inAlwaysBelow) {
		this.setBoundsInfo("applyNearBounds", arguments);
		this.open();
	},
	/**
	Open in the center of the viewport
	*/
	openAtCenter: function() {
		this.setBoundsInfo("applyCenterBounds", arguments);
		this.open();
	},
	//* @protected
	applyBounds: function(inRect, inReposition) {
		var r = inRect || {};
		if (inReposition) {
			r = this.clampPosition(enyo.mixin(r, this.calcSize()));
		}
		this.applyPosition(r);
		this.applyClampedSize(r);
	},
	applyAtEventBounds: function(inEvent, inOffset) {
		var p = {
			left: inEvent.centerX || inEvent.clientX || inEvent.pageX,
			top: inEvent.centerY || inEvent.clientY || inEvent.pageY
		};
		if (inOffset) {
			p.left += inOffset.left || 0;
			p.top += inOffset.top || 0;
		}
		var p = this.clampPosition(enyo.mixin(p, this.calcSize()));
		this.applyBounds(p);
	},
	applyCenterBounds: function() {
		this.applyBounds(this.calcCenterPosition());
	},
	applyAtControlBounds: function(inControl, inOffset) {
		var o = enyo.mixin({width: 0, height: 0, top: 0, left: 0}, inOffset);
		var co = inControl.getOffset();
		o.top += co.top;
		o.left += co.left;
		var n = inControl.hasNode();
		if (n) {
			o.width += n.offsetWidth;
			o.height += n.offsetHeight;
		}
		this.applyNearBounds(o);
	},
	applyAroundControlBounds: function(inControl, inAlwaysBelow, inAlign) {
		// we position to the bottom right of the node.
		var co = inControl.getOffset();
		var o = {};
		var n = inControl.hasNode();
		var w, h;
		if (n) {
			h = n.offsetHeight;
			w = n.offsetWidth;
		}
		var vp = this.calcViewport();
		o.top = co.top + h;
		// need to specify right, not left so that width can be naturally determined.
		if (inAlign == "left") {
			o.left = co.left;
		} else {
			o.right = vp.width - (co.left + w);
		}
		o.width = w;
		o.height = h;
		this.applyNearBounds(o, true, inAlwaysBelow);
	},
	applyNearBounds: function(inDimensions, inAround, inAlwaysBelow) {
		var d = inDimensions;
		var o = enyo.clone(d);
		o.width = null;
		o.height = null;
		var s = this.calcSize();
		var vp = this.calcViewport();
		if (!inAlwaysBelow) {
			// if placing at top would push off screen and top is more than halfway
			// then position using bottom
			if ((d.top + s.height > vp.height) && (d.top > vp.height/2)) {
				var oh = d.height || 0;
				oh = inAround ? -oh : oh;
				o.bottom = vp.height - (d.top + oh);
				delete o.top;
			}
			// if placing at left would push off screen and left is more than halfway
			// then position using right
			if ((d.left + s.width > vp.width) && (d.left > vp.width/2)) {
				o.right = vp.width - (d.left - (d.width || 0));
				delete o.left;
			}
		}
		this.applyBounds(o);
	},
	// track the method name and arguments used to open the popup.
	setBoundsInfo: function(inMethod, inArguments) {
		// FIXME: was this important? removing it allows popups to be re-positioned via calls to various open methods.
		//if (!this.boundsInfo) {
			var args = inArguments ? enyo.cloneArray(inArguments) : [];
			this.boundsInfo = {method: inMethod, args: args};
		//}
	},
	applyBoundsInfo: function() {
		var bi = this.boundsInfo;
		if (bi) {
			this.clearSizeCache();
			this[bi.method].apply(this, bi.args);
		}
	},
	calcCenterPosition: function() {
		var s = this.calcSize();
		var vp = this.calcViewport();
		var o = {
			left: Math.max(0, (vp.width - s.width) / 2),
			top: Math.max(0, (vp.height - s.height) / 2)
		};
		return o;
	},
	// size and position
	getContentControl: function() {
		return this.$[this.contentControlName] || this;
	},
	applyMaxSize: function(inWidthCss, inHeightCss) {
		var s = this.getContentControl();
		var h = this.preventContentOverflow ? " overflow: hidden;" : "";
		s.addStyles("max-width: " + inWidthCss + "; max-height: " + inHeightCss + ";" + h);
	},
	// we want to user specified max dimensions to win over clamped ones, if possible
	// track if we have clamped height or width
	applyClampedSize: function(inRect) {
		var max = this.clampSize(inRect);
		max.width = this.getMaxWidth() || max.width + "px";
		max.height = this.getMaxHeight() || max.height + "px";
		this.applyMaxSize(max.width, max.height);
	},
	/**
	Position, relative to the viewport, at the location specified by inRect.
	inRect may contain top, left or right, bottom coordinates. 
	If both are specified, top, left is preferred.
	*/
	applyPosition: function(inRect) {
		var r = inRect;
		if (r.left !== undefined) {
			this.applyStyle("left", r.left + "px");
			this.applyStyle("right", "auto");
		} else if (r.right !== undefined) {
			this.applyStyle("right", r.right + "px");
			this.applyStyle("left", "auto");
		}
		if (r.top !== undefined) {
			this.applyStyle("top", r.top + "px");
			this.applyStyle("bottom", "auto");
		} else if (r.bottom !== undefined) {
			this.applyStyle("bottom", r.bottom + "px");
			this.applyStyle("top", "auto");
		}
	},
	// returns a position which ensures popup with inRect.width, inRect.height will not overflow viewport
	clampPosition: function(inRect) {
		var p = {}, r=inRect;
		var vp = this.calcViewport();
		if (r.right) {
			p.right = Math.max(0, Math.min(vp.width - r.width, r.right));
		} else {
			p.left =  Math.max(0, Math.min(vp.width - r.width, r.left));
		}
		if (r.bottom) {
			p.bottom = Math.max(0, Math.min(vp.height - r.height, r.bottom));
		} else {
			p.top = Math.max(0, Math.min(vp.height - r.height, r.top));
		}
		return p;
	},
	// returns a size which ensures popup at inPosition will not overflow viewport
	clampSize: function(inDimensions) {
		var d = inDimensions || {};
		var vp = this.calcViewport();
		var s = {
			width: vp.width - (d.left || d.right || 0),
			height: vp.height - (d.top || d.bottom || 0)
		};
		if (d.width) {
			s.width = Math.min(d.width, s.width);
		}
		if (d.height) {
			s.height = Math.min(d.height, s.height);
		}
		//
		// adjust by content v. this size delta
		var d = this.calcContentSizeDelta();
		s.height -= d.height;
		s.width -= d.width;
		return s;
	},
	calcContentSizeDelta: function() {
		var d = {height: 0, width: 0};
		var c = this.getContentControl();
		if (c != this) {
			// adjust by the popup's pad/border
			var ns = this.calcSize();
			d.height = ns.offsetHeight - ns.clientHeight;
			d.width = ns.offsetWidth - ns.clientWidth;
			// then offset by content control's margin
			var m = enyo.dom.calcMarginExtents(c.hasNode());
			if (m) {
				d.height += m.t + m.b;
				d.width += m.l + m.r;
			}
		}
		return d;
	},
	// measure the size of the viewport.
	calcViewport: function() {
		// memoize
		if (this._viewport) {
			return this._viewport;
		} else {
			var vp;
			if (this.parent && this.parent.hasNode()) {
				vp = enyo.calcModalControlBounds(this.parent);
			} else {
				vp = enyo.getModalBounds();
			}
			return this._viewport = vp;
		}
	},
	// measure the size of the popup.
	calcSize: function() {
		if (!this.generated) {
			this.render();
		}
		// memoize
		if (this._size) {
			return this._size;
		} else if (this.hasNode()) {
			// briefly show node so we can measure it.
			this.beginMeasureSize();
			var s = {h: 0, w: 0};
			// FIXME: measure border (equivalent to enyo.dom.fetchBorderExtents?)
			s.height = s.offsetHeight = this.node.offsetHeight;
			s.width = s.offsetWidth = this.node.offsetWidth;
			s.clientHeight = this.node.clientHeight;
			s.clientWidth = this.node.clientWidth;
			this.finishMeasureSize();
			return (this._size = s);
		}
	},
	beginMeasureSize: function() {
		if (this.hasNode()) {
			var h = this._measuredWhenHidden = (this.node.style.display == "none");
			if (h) {
				this.node.style.display = "block";
			}
		}
	},
	finishMeasureSize: function() {
		if (this.hasNode()) {
			if (this._measuredWhenHidden) {
				this.node.style.display = "none";
			}
		}
	},
	clearSizeCache: function() {
		this._viewport = null;
		this._size = null;
	}
});