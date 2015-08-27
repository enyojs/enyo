require('enyo');

/**
* Contains the declaration for the {@link module:enyo/DragAvatar~DragAvatar} kind.
* @module enyo/DragAvatar
*/

var
	kind = require('./kind');
var
	Control = require('./Control'),
	Component = require('./Component');

/**
* @private
*/
var Avatar = kind({
	kind: Control,
	style: 'position: absolute; z-index: 10; pointer-events: none; cursor: move;',
	showing: false,
	showingChanged: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			document.body.style.cursor = this.showing ? 'move' : null;
		};
	})
});

/**
* {@link module:enyo/DragAvatar~DragAvatar} creates a control to follow the pointer when dragging. It
* automatically displays the avatar control when the user drags, and updates its
* position relative to the current pointer location.
*
* ```javascript
* enyo.kind({
*	name: 'App',
*	handlers: {
*		ondrag: 'drag',
*		ondragfinish: 'dragFinish',
*	},
*	components: [
*		{name: 'dragAvatar', kind: 'DragAvatar',
*			components: [{tag: 'img', src: 'images/icon.png'}]
*		}
*	],
*	drag: function(inSender, inEvent) {
*		this.$.dragAvatar.drag(inEvent);
*	},
*	dragFinish: function(inSender, inEvent) {
*		this.$.dragAvatar.hide();
*	}
* });
* ```
*
* @class DragAvatar
* @extends module:enyo/Component~Component
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:enyo/DragAvatar~DragAvatar.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.DragAvatar',

	/**
	* @private
	*/
	kind: Component,

	/**
	* @private
	*/
	published: 
		/** @lends module:enyo/DragAvatar~DragAvatar.prototype */ {
		
		/**
		* Current visibility state of the [DragAvatar]{@link module:enyo/DragAvatar~DragAvatar}.
		* 
		* @type {Boolean}
		* @default false
		* @public
		*/
		showing: false,

		/**
		* Distance (in pixels) along the horizontal axis between the current drag position and 
		* where the avatar control is displayed.
		*
		* @type {Number}
		* @default 20
		* @public
		*/
		offsetX: 20,

		/**
		* Distance (in pixels) along the vertical axis between the current drag position and 
		* where the avatar control is displayed.
		*
		* @type {Number}
		* @default 20
		* @public
		*/
		offsetY: 30
	},
	
	/**
	* @method
	* @private
	*/
	initComponents: kind.inherit(function (sup) {
		return function() {
			this.avatarComponents = this.components;
			this.components = null;
			sup.apply(this, arguments);
		};
	}),

	/**
	* @private
	*/
	requireAvatar: function () {
		// FIXME: there is nobody to call teardownRender on this.avatar
		// if document.body.innerHTML has been written over, his node is invalid
		// we should have a trap for this condition here
		if (!this.avatar) {
			this.avatar = this.createComponent({kind: Avatar, parentNode: document.body, showing: false, components: this.avatarComponents}).render();
		}
	},

	/**
	* @private
	*/
	showingChanged: function () {
		this.avatar.setShowing(this.showing);
		document.body.style.cursor = this.showing ? 'move' : null;
	},

	/**
	* Instantiates the avatar control (if necessary), determines correct position, and calls 
	* [show()]{@link module:enyo/DragAvatar~DragAvatar#show} to make it visible.
	*
	* @param {Object} e - An [object]{@glossary Object} containing {@glossary event}
	* information.
	* @public
	*/
	drag: function (e) {
		this.requireAvatar();
		this.avatar.setBounds({top: e.pageY - this.offsetY, left: e.pageX + this.offsetX});
		this.show();
	},

	/**
	* Shows the [DragAvatar]{@link module:enyo/DragAvatar~DragAvatar}.
	* 
	* @public
	*/
	show: function () {
		this.setShowing(true);
	},

	/**
	* Hides the [DragAvatar]{@link module:enyo/DragAvatar~DragAvatar}.
	* 
	* @public
	*/
	hide: function () {
		this.setShowing(false);
	}
});
