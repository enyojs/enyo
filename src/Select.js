require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Select~Select} kind.
* @module enyo/Select
*/

var
	kind = require('./kind'),
	platform = require('./platform');
var
	Control = require('./Control'),
	/*jshint -W079*/
	Option = require('./Option');
	/*jshint +W079*/

/**
* {@link module:enyo/Select~Select} implements an HTML [selection]{@glossary select} widget, using
* {@link module:enyo/Option~Option} instances by default.
*
* ```javascript
* var
* 	kind = require('enyo/kind'),
* 	Select = require('enyo/Select');
*
* {kind: Select, onchange: 'selectChanged', components: [
* 	{content: 'Descending', value: 'd'},
* 	{content: 'Ascending', value: 'a'}
* ]}
*
* selectChanged: function (inSender, inEvent) {
* 	var s = inSender.getValue();
* 	if (s == 'd') {
* 		this.sortListDescending();
* 	} else {
* 		this.sortListAscending();
* 	}
* }
* ```
*
* Note: This uses the [&lt;select&gt;]{@glossary select} tag, which isn't implemented for
* native webOS applications, although it does work in the webOS Web browser.
*
* @class Select
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:enyo/Select~Select.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.Select',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	published:
		/** @lends module:enyo/Select~Select.prototype */ {

		/**
		* The index of the selected [option]{@link module:enyo/Option~Option} in the list.
		*
		* @type {Number}
		* @default null
		* @public
		*/
		selected: null,

		/**
		* The value of the selected [option]{@link module:enyo/Option~Option}.
		*
		* @type {Object}
		* @default null
		* @public
		*/
		value: null,

		/**
		* The size of the select box in rows.
		*
		* @type {Number}
		* @default 0
		* @public
		*/
		size: 0,

		/**
		* Sets whether the enyo/Select can select multiple options
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		multiple: false,

		/**
		* Sets whether the enyo/Select is disabled, or not
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		disabled: false
	},

	/**
	* @private
	*/
	handlers: {
		onchange: 'change'
	},

	/**
	* @private
	*/
	tag: 'select',

	/**
	* @private
	*/
	defaultKind: Option,

	/**
	* @method
	* @private
	*/
	rendered: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			// This makes Select.selected a higher priority than Option.selected but ensures that
			// the former works at create time
			if (this.selected !== null) {
				this.selectedChanged();
			} else {
				this.updateSelectedFromNode();
				this.updateValueFromNode();
			}
			this.sizeChanged();
			this.multipleChanged();
			this.disabledChanged();
		};
	}),

	/**
	* @private
	*/
	updateSelectedFromNode: function () {
		this.set('selected', Number(this.getNodeProperty('selectedIndex', this.selected)));
	},

	/**
	* @private
	*/
	updateValueFromNode: function () {
		this.set('value', this.getNodeProperty('value', this.value));
	},

	/**
	* Updates the `selected` option matching the current value. If the option doesn't have a value,
	* it will match its content instead.
	*
	* @private
	*/
	selectOptionByValue: function () {
		var i, controls, l, c;

		for (i = 0, controls = this.getControls(), l = controls.length; i < l; i++) {
			c = controls[i];
			// support 
			if (c.value ? c.value === this.value : c.content === this.value) {
				if (i !== this.selected) this.set('selected', i);
				break;
			}
		}
	},

	/**
	* @private
	*/
	selectedChanged: function () {
		this.setNodeProperty('selectedIndex', this.selected);
		this.updateValueFromNode();
	},

	/**
	* @private
	*/
	valueChanged: function () {
		// IE will clear selectedIndex when setting the value directly on the node so instead we
		// iterate the children, find the matching value, and update selected if necessary.
		if (platform.ie || platform.edge) {
			this.selectOptionByValue();
		}
		else {
			this.setNodeProperty('value', this.value);
			this.updateSelectedFromNode();
		}
	},

	/**
	* @private
	*/
	sizeChanged: function () {
		this.setNodeProperty('size', this.size);
	},

	/**
	* @private
	*/
	multipleChanged: function () {
		this.setNodeProperty('multiple', this.multiple);
	},

	/**
	* @private
	*/
	disabledChanged: function () {
		this.setNodeProperty('disabled', this.disabled);
	},

	/**
	* @private
	*/
	change: function () {
		this.updateSelectedFromNode();
	},

	/**
	* @method
	* @private
	*/
	render: kind.inherit(function (sup) {
		return function () {
			// work around IE bug with innerHTML setting of <select>, rerender parent instead
			// http://support.microsoft.com/default.aspx?scid=kb;en-us;276228
			if (platform.ie) {
				this.parent.render();
			} else {
				sup.apply(this, arguments);
			}
		};
	})
});
