require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Repeater~Repeater} kind.
* @module enyo/Repeater
*/

var
	kind = require('./kind'),
	utils = require('./utils');
var
	Control = require('./Control');

/**
* The extended {@glossary event} [object]{@glossary Object} that is provided
* when the [onSetupItem]{@link module:enyo/Repeater~Repeater#onSetupItem} event is fired.
*
* @typedef {Object} enyo.Repeater~SetupItemEvent
* @property {Number} index - The item's index.
* @property {Object} item - The item control, for decoration.
*/

/**
* Fires when each item is created.
*
* @event module:enyo/Repeater~Repeater#onSetupItem
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {module:enyo/Repeater~Repeater~SetupItemEvent} event - An [object]{@glossary Object} containing
*	event information.
* @public
*/
	
/**
* Sometimes client [controls]{@link module:enyo/Control~Control} are intermediated with null-controls.
* These overrides reroute [events]{@glossary event} from such controls to the nominal
* [delegate]{@glossary delegate}, as would happen in the absence of intermediation.
* 
* @class OwnerProxy
* @extends module:enyo/Control~Control
* @private
*/
var OwnerProxy = kind(
	/** @lends module:enyo/OwnerProxy~OwnerProxy.prototype */ {

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	tag: null,

	/**
	* @method
	* @private
	*/
	decorateEvent: kind.inherit(function (sup) {
		return function(inEventName, inEvent, inSender) {
			if (inEvent) {
				// preserve an existing index property.
				if (utils.exists(inEvent.index)) {
					// if there are nested indices, store all of them in an array
					// but leave the innermost one in the index property
					inEvent.indices = inEvent.indices || [inEvent.index];
					inEvent.indices.push(this.index);
				} else {
					// for a single level, just decorate the index property
					inEvent.index = this.index;
				}
				// update delegate during bubbling to account for proxy
				// by moving the delegate up to the repeater level
				if (inEvent.delegate && inEvent.delegate.owner === this) {
					inEvent.delegate = this.owner;
				}
			}
			sup.apply(this, arguments);
		};
	})
});

/**
* {@link module:enyo/Repeater~Repeater} is a simple [control]{@link module:enyo/Control~Control} for making lists of items.
*
* The [components]{@link module:enyo/Component~Component} of a repeater are copied for each item created,
* and are wrapped in a control that keeps the state of the item index.
* 
* ```javascript
* {kind: 'Repeater', count: 2, onSetupItem: 'setImageSource', components: [
*	{kind: 'Image'}
* ]}
* 
* setImageSource: function(inSender, inEvent) {
*	var index = inEvent.index;
*	var item = inEvent.item;
*	item.$.image.setSrc(this.imageSources[index]);
*	return true;
* }
* ```
* 
* Be sure to return `true` from your `onSetupItem` handler to avoid having other 
* {@glossary event} handlers further up the tree try to modify your item control.
* 
* For more information, see the documentation on
* [Lists]{@linkplain $dev-guide/building-apps/layout/lists.html} in the
* Enyo Developer Guide.
*
* @class Repeater
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:enyo/Repeater~Repeater.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.Repeater',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	published: 
		/** @lends module:enyo/Repeater~Repeater.prototype */ {
		
		/**
		* The number of items to be repeated.
		* 
		* @type {Number}
		* @default 0
		* @public
		*/
		count: 0
	},

	/**
	* @private
	*/
	events: {
		onSetupItem: ''
	},

	/**
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.countChanged();
		};
	}),
	
	/**
	* @method
	* @private
	*/
	initComponents: kind.inherit(function (sup) {
		return function() {
			this.itemComponents = this.components || this.kindComponents;
			this.components = this.kindComponents = null;
			sup.apply(this, arguments);
		};
	}),

	/**
	* @private
	*/
	countChanged: function () {
		this.build();
	},

	/**
	* @private
	*/
	itemAtIndex: function (idx) {
		return this.controlAtIndex(idx);
	},

	/** 
	* Renders the [collection]{@link module:enyo/Collection~Collection} of items. This will delete any
	* existing items and recreate the [repeater]{@link module:enyo/Repeater~Repeater} if called after
	* the repeater has been rendered. This is called automatically when the
	* [count]{@link module:enyo/Repeater~Repeater#count} property changes. To set the `count` property
	* and force a re-render, such as when a [data model]{@link module:enyo/Model~Model} changes,
	* use `set('count', newCount, true)`, where the last parameter forces the change
	* handler to be called, even if the `count` remains the same.
	*
	* @fires module:enyo/Repeater~Repeater#onSetupItem
	* @public
	*/
	build: function () {
		this.destroyClientControls();
		for (var i=0, c; i<this.count; i++) {
			c = this.createComponent({kind: OwnerProxy, index: i});
			// do this as a second step so 'c' is the owner of the created components
			c.createComponents(this.itemComponents);
			// invoke user's setup code
			this.doSetupItem({index: i, item: c});
		}
		this.render();
	},
	/**
	* Renders a specific item in the [collection]{@link module:enyo/Collection~Collection}. This does not
	* destroy the item, but just calls the `onSetupItem` {@glossary event} handler again
	* for it, so any state stored in the item is preserved.
	*
	* @param {Number} idx - The index of the item to render.
	* @fires module:enyo/Repeater~Repeater#onSetupItem
	* @public
	*/
	renderRow: function (idx) {
		var c = this.itemAtIndex(idx);
		this.doSetupItem({index: idx, item: c});
	},

	/**
	* A legacy method that sets the number of items to be repeated and effectively forces a 
	* rebuild of the [repeater]{@link module:enyo/Repeater~Repeater}, regardless of whether or not the count has
	* changed.
	*
	* @param {Number} count - The number of items to be repeated.
	* @public
	*/
	setCount: function (count) {
		this.set('count', count, {force: true});
	},

	// Accessibility

	/**
	* @default list
	* @type {String}
	* @see enyo/AccessibilitySupport~AccessibilitySupport#accessibilityRole
	* @public
	*/
	accessibilityRole: 'list'
});
