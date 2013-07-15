enyo.fullscreen = {

	//* @protected

	//* Reference to the current fs control
	fullscreenControl: null,
	//* Reference to the current fs element (fallback for platforms w/o native support)
	fullscreenElement: null,
	//* Reference to control that requested fs
	requestor: null,
	//* Native accessor used to get reference to the current fs element
	elementAccessor:
		("fullscreenElement" in document) ? "fullscreenElement" :
		("mozFullScreenElement" in document) ? "mozFullScreenElement" :
		("webkitFullscreenElement" in document) ? "webkitFullscreenElement" :
		null,
	//* Native accessor used to request fs
	requestAccessor:
		("requestFullscreen" in document.documentElement) ? "requestFullscreen" :
		("mozRequestFullScreen" in document.documentElement) ? "mozRequestFullScreen" :
		("webkitRequestFullscreen" in document.documentElement) ? "webkitRequestFullscreen" :
		null,
	//* Native accessor used to cancel fs
	cancelAccessor:
		("cancelFullScreen" in document) ? "cancelFullScreen" :
		("mozCancelFullScreen" in document) ? "mozCancelFullScreen" :
		("webkitCancelFullScreen" in document) ? "webkitCancelFullScreen" :
		null,

	//* @public

	//* Return true if platform supports all of the fullscreen API
	nativeSupport: function() {
		return (this.elementAccessor !== null && this.requestAccessor !== null && this.cancelAccessor !== null);
	},
	//* Normalize _getFullscreenElement()_
	getFullscreenElement: function() {
		return (this.nativeSupport()) ? document[this.elementAccessor] : this.fullscreenElement;
	},
	//* Return current fs control
	getFullscreenControl: function() {
		return this.fullscreenControl;
	},
	//* Normalize _requestFullscreen()_
	requestFullscreen: function(inControl) {
		if (this.getFullscreenControl() || !(inControl.hasNode())) {
			return false;
		}

		this.requestor = inControl;

		// Only use native request if platform supports all of the API
		if (this.nativeSupport()) {
			inControl.hasNode()[this.requestAccessor]();
		} else {
			this.fallbackRequestFullscreen();
		}

		return true;
	},
	//* Normalize _cancelFullscreen()_
	cancelFullscreen: function() {
		if (this.nativeSupport()) {
			document[this.cancelAccessor]();
		} else {
			this.fallbackCancelFullscreen();
		}
	},

	//* @protected

	//* Fallback support for setting fullscreen element (done by browser on platforms with native support)
	setFullscreenElement: function(inNode) {
		this.fullscreenElement = inNode;
	},
	//* Set current fs control
	setFullscreenControl: function(inControl) {
		this.fullscreenControl = inControl;
	},
	//* Fallback fullscreen request for platforms without fullscreen support
	fallbackRequestFullscreen: function() {
		var control = this.requestor;

		if (!control) {
			return;
		}

		// Get before node to allow us to exit floating layer to the proper position
		control.prevAddBefore = control.parent.controlAtIndex(control.indexInContainer() + 1);

		// Render floating layer if we need to
		if (!enyo.floatingLayer.hasNode()) {
			enyo.floatingLayer.render();
		}

		control.addClass("enyo-fullscreen");
		control.appendNodeToParent(enyo.floatingLayer.hasNode());
		control.resized();

		this.setFullscreenControl(control);
		this.setFullscreenElement(control.hasNode());
	},
	//* Fallback cancel fullscreen for platforms without fullscreen support
	fallbackCancelFullscreen: function() {
		var control = this.fullscreenControl,
			beforeNode,
			parentNode
		;

		if (!control) {
			return;
		}

		// Find beforeNode based on _this.addBefore_ and _this.prevAddBefore_
		beforeNode = (control.prevAddBefore) ? control.prevAddBefore.hasNode() : null;
		parentNode = control.parent.hasNode();
		control.prevAddBefore = null;

		control.removeClass("enyo-fullscreen");

		if (!beforeNode) {
			control.appendNodeToParent(parentNode);
		} else {
			control.insertNodeInParent(parentNode, beforeNode);
		}

		control.resized();

		this.setFullscreenControl(null);
		this.setFullscreenElement(null);
	},
	//* Listen for fs change event and broadcast as normalized event
	detectFullscreenChangeEvent: function() {
		this.setFullscreenControl(this.requestor);
		this.requestor = null;

		// Broadcast change
		enyo.Signals.send("onFullscreenChange");
	}
};

//* Normalize platform-specific fs change events
enyo.ready(function() {
	// no need for IE8 fallback, since it won't ever send this event
	if (document.addEventListener) {
		document.addEventListener("webkitfullscreenchange", enyo.bind(enyo.fullscreen, "detectFullscreenChangeEvent"), false);
		document.addEventListener("mozfullscreenchange",    enyo.bind(enyo.fullscreen, "detectFullscreenChangeEvent"), false);
		document.addEventListener("fullscreenchange",       enyo.bind(enyo.fullscreen, "detectFullscreenChangeEvent"), false);
	}
});

//* If this platform doesn't have native support for fullscreen, add an escape handler to mimic native behavior
if(!enyo.fullscreen.nativeSupport()) {
	enyo.dispatcher.features.push(
		function(e) {
			if (e.type === "keydown" && e.keyCode === 27) {
				enyo.fullscreen.cancelFullscreen();
			}
		}
	);
}
