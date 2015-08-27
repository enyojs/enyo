var
	dispatcher = require('../dispatcher'),
	utils = require('../utils'),
	ready = require('../ready'),
	Signals = require('../Signals');

/**
* Normalizes and provides fullscreen support for [controls]{@link module:enyo/Control~Control},
* based on the [fullscreen]{@glossary fullscreen} API.
*
* @module enyo/Control/fullscreen
* @public
*/
module.exports = function (Control) {
	var floatingLayer = Control.floatingLayer;
	var fullscreen = {
		
		/**
		* Reference to the current fullscreen [control]{@link module:enyo/Control~Control}.
		*
		* @private
		*/
		fullscreenControl: null,

		/**
		* Reference to the current fullscreen element (fallback for platforms
		* without native support).
		*
		* @private
		*/
		fullscreenElement: null,

		/** 
		* Reference to that [control]{@link module:enyo/Control~Control} that requested fullscreen.
		* 
		* @private
		*/
		requestor: null,

		/** 
		* Native accessor used to get reference to the current fullscreen element.
		*
		* @private
		*/
		elementAccessor:
			('fullscreenElement' in document) ? 'fullscreenElement' :
			('mozFullScreenElement' in document) ? 'mozFullScreenElement' :
			('webkitFullscreenElement' in document) ? 'webkitFullscreenElement' :
			null,

		/** 
		* Native accessor used to request fullscreen.
		*
		* @private
		*/
		requestAccessor:
			('requestFullscreen' in document.documentElement) ? 'requestFullscreen' :
			('mozRequestFullScreen' in document.documentElement) ? 'mozRequestFullScreen' :
			('webkitRequestFullscreen' in document.documentElement) ? 'webkitRequestFullscreen' :
			null,

		/** 
		* Native accessor used to cancel fullscreen.
		*
		* @private
		*/
		cancelAccessor:
			('cancelFullScreen' in document) ? 'cancelFullScreen' :
			('mozCancelFullScreen' in document) ? 'mozCancelFullScreen' :
			('webkitCancelFullScreen' in document) ? 'webkitCancelFullScreen' :
			null,

		/**
		* Determines whether the platform supports the [fullscreen]{@glossary fullscreen} API.
		* 
		* @returns {Boolean} Returns `true` if platform supports all of the 
		*	[fullscreen]{@glossary fullscreen} API, `false` otherwise.
		* @public
		*/
		nativeSupport: function() {
			return (this.elementAccessor !== null && this.requestAccessor !== null && this.cancelAccessor !== null);
		},

		/** 
		* Normalizes `getFullscreenElement()`.
		*
		* @public
		*/
		getFullscreenElement: function() {
			return (this.nativeSupport()) ? document[this.elementAccessor] : this.fullscreenElement;
		},

		/** 
		* Returns current fullscreen [control]{@link module:enyo/Control~Control}.
		*
		* @public
		*/
		getFullscreenControl: function() {
			return this.fullscreenControl;
		},

		/**
		* Normalizes `requestFullscreen()`.
		*
		* @public
		*/
		requestFullscreen: function(ctl) {
			if (this.getFullscreenControl() || !(ctl.hasNode())) {
				return false;
			}

			this.requestor = ctl;

			// Only use native request if platform supports all of the API
			if (this.nativeSupport()) {
				ctl.hasNode()[this.requestAccessor]();
			} else {
				this.fallbackRequestFullscreen();
			}

			return true;
		},

		/** 
		* Normalizes `cancelFullscreen()`.
		*
		* @public
		*/
		cancelFullscreen: function() {
			if (this.nativeSupport()) {
				document[this.cancelAccessor]();
			} else {
				this.fallbackCancelFullscreen();
			}
		},

		/** 
		* Fallback support for setting fullscreen element (done by browser on platforms with
		* native support).
		*
		* @private
		*/
		setFullscreenElement: function(node) {
			this.fullscreenElement = node;
		},

		/** 
		* Sets current fullscreen [control]{@link module:enyo/Control~Control}.
		*
		* @private
		*/
		setFullscreenControl: function(ctl) {
			this.fullscreenControl = ctl;
		},

		/** 
		* Fallback fullscreen request for platforms without fullscreen support.
		*
		* @private
		*/
		fallbackRequestFullscreen: function() {
			var control = this.requestor;

			if (!control) {
				return;
			}

			// Get before node to allow us to exit floating layer to the proper position
			control.prevAddBefore = control.parent.controlAtIndex(control.indexInContainer() + 1);

			// Render floating layer if we need to
			if (!floatingLayer.hasNode()) {
				floatingLayer.render();
			}

			control.addClass('enyo-fullscreen');
			control.appendNodeToParent(floatingLayer.hasNode());
			control.resize();

			this.setFullscreenControl(control);
			this.setFullscreenElement(control.hasNode());
		},

		/** 
		* Fallback cancel fullscreen for platforms without fullscreen support.
		*
		* @private
		*/
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

			control.removeClass('enyo-fullscreen');

			if (!beforeNode) {
				control.appendNodeToParent(parentNode);
			} else {
				control.insertNodeInParent(parentNode, beforeNode);
			}

			control.resize();

			this.setFullscreenControl(null);
			this.setFullscreenElement(null);
		},

		/** 
		* Listens for fullscreen change {@glossary event} and broadcasts it as a
		* normalized event.
		*
		* @private
		*/
		detectFullscreenChangeEvent: function() {
			this.setFullscreenControl(this.requestor);
			this.requestor = null;

			// Broadcast change
			Signals.send('onFullscreenChange');
		}
	};

	/**
	* Normalizes platform-specific fullscreen change [events]{@glossary event}.
	*
	* @private
	*/
	ready(function() {
		// no need for IE8 fallback, since it won't ever send this event
		if (document.addEventListener) {
			document.addEventListener('webkitfullscreenchange', utils.bind(fullscreen, 'detectFullscreenChangeEvent'), false);
			document.addEventListener('mozfullscreenchange',    utils.bind(fullscreen, 'detectFullscreenChangeEvent'), false);
			document.addEventListener('fullscreenchange',       utils.bind(fullscreen, 'detectFullscreenChangeEvent'), false);
		}
	});

	/**
	* If this platform doesn't have native support for fullscreen, add an escape handler to mimic 
	* native behavior.
	*/
	if(!fullscreen.nativeSupport()) {
		dispatcher.features.push(
			function(e) {
				if (e.type === 'keydown' && e.keyCode === 27) {
					fullscreen.cancelFullscreen();
				}
			}
		);
	}

	return fullscreen;
};