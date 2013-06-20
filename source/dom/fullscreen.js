enyo.ready(function() {
	
	enyo.fullscreen = {
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
		//* Return true if platform supports all of the fullscreen API
		nativeSupport: function() {
			return (this.elementAccessor && this.requestAccessor && this.cancelAccessor);
		},
		//* Normalize _getFullscreenElement()_
		getFullscreenElement: function() {
			return (this.nativeSupport()) ? document[this.elementAccessor] : this.fullscreenElement;
		},
		//* Fallback support for setting fullscreen element (done by browser on platforms with native support)
		setFullscreenElement: function(inNode) {
			this.fullscreenElement = inNode;
		},
		//* Return current fs control
		getFullscreenControl: function() {
			return this.fullscreenControl;
		},
		//* Set current fs control
		setFullscreenControl: function(inControl) {
			var fsControl = this.getFullscreenControl();
			
			if (fsControl) {
				fsControl.setFullscreen(false);
			}
			
			if (inControl) {
				inControl.setFullscreen(true);
			}
			
			this.fullscreenControl = inControl;
		},
		
		//// Request Fullscreen ////
		
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
		//* Fallback fullscreen request for platforms without fullscreen support
		fallbackRequestFullscreen: function() {
			var control = this.requestor;
			
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
			control.setFullscreen(true);
		},
		
		//// Cancel Fullscreen ////
		
		//* Normalize _cancelFullscreen()_
		cancelFullscreen: function() {
			if (this.nativeSupport()) {
				document[this.cancelAccessor]();
			} else {
				this.fallbackCancelFullscreen();
			}
		},
		//* Fallback cancel fullscreen for platforms without fullscreen support
		fallbackCancelFullscreen: function() {
			var control = this.fullscreenControl,
				beforeNode,
				parentNode
			;
			
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
			control.setFullscreen(false);
		},
		
		//// Detect Native Fullscreen Changes ////
		
		//* Listen for fs change event and broadcast as normalized event
		detectFullscreenChangeEvent: function() {
			this.setFullscreenControl(this.requestor);
			this.requestor = null;
			
			// Broadcast change
			enyo.Signals.send("onFullscreenChange");
		}
	};
	
	//* Normalize platform-specific fs change events
	document.addEventListener("webkitfullscreenchange", enyo.bind(enyo.fullscreen, "detectFullscreenChangeEvent"), false);
	document.addEventListener("mozfullscreenchange", 	enyo.bind(enyo.fullscreen, "detectFullscreenChangeEvent"), false);
	document.addEventListener("fullscreenchange", 		enyo.bind(enyo.fullscreen, "detectFullscreenChangeEvent"), false);
});