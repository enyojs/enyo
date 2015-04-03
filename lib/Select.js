require('enyo');

var
	kind = require('./kind'),
	platform = require('./platform'),
	dispatcher = require('./dispatcher');
var
	Control = require('./Control'),
	Option = require('./Option');

/**
* {@link enyo.Select} implements an HTML [selection]{@glossary select} widget, using
* {@link enyo.Option} instances by default.
*
* ```
* {kind: 'Select', onchange: 'selectChanged', components: [
*	{content: 'Descending', value: 'd'},
*	{content: 'Ascending', value: 'a'}
* ]}
* 
* selectChanged: function(inSender, inEvent) {
*	var s = inSender.getValue();
*	if (s == 'd') {
*		this.sortListDescending();
*	} else {
*		this.sortListAscending();
*	}
* }
* ```
* 
* Note: This uses the [&lt;select&gt;]{@glossary select} tag, which isn't implemented for
* native webOS applications, although it does work in the webOS Web browser.
*
* @class enyo.Select
* @extends enyo.Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends enyo.Select.prototype */ {

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
		/** @lends enyo.Select.prototype */ {
		
		/**
		* The index of the selected [option]{@link enyo.Option} in the list.
		* 
		* @type {Number}
		* @default 0
		* @public
		*/
		selected: 0,

		/**
		* The value of the selected [option]{@link enyo.Option}.
		* 
		* @type {Object}
		* @default null
		* @public
		*/
		value: null
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
		return function() {
			sup.apply(this, arguments);
			//Trick to force IE8 onchange event bubble
			if(platform.ie == 8){
				this.setAttribute('onchange', dispatcher.bubbler);
			}
			this.change();
			this.selectedChanged();
		};
	}),

	/**
	* @private
	*/
	getSelected: function () {
		return Number(this.getNodeProperty('selectedIndex', this.selected));
	},

	/**
	* @private
	*/
	selectedChanged: function () {
		this.setNodeProperty('selectedIndex', this.selected);
	},

	/**
	* @private
	*/
	change: function () {
		this.selected = this.getSelected();
		if (this.hasNode()) {
			this.set('value', this.node.value);
		}
	},

	/**
	* @method
	* @private
	*/
	render: kind.inherit(function (sup) {
		return function() {
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