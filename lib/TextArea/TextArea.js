require('enyo');

/**
* Contains the declaration for the {@link enyo.TextArea} kind.
* @module enyo/TextArea
*/

var
	kind = require('../kind'),
	options = require('../options');
var
	Input = require('../Input'),
	TextAreaAccessibilitySupport = require('./TextAreaAccessibilitySupport');

/**
* {@link enyo.TextArea} implements an HTML [&lt;textarea&gt;]{@glossary textarea}
* element with cross-platform support for change [events]{@glossary event}.
*
* For more information, see the documentation on
* [Text Fields]{@linkplain $dev-guide/building-apps/controls/text-fields.html}
* in the Enyo Developer Guide.
*
* @namespace enyo
* @class enyo.TextArea
* @extends enyo.Input
* @ui
* @definedby module:enyo/TextArea
* @public
*/
module.exports = kind(
	/** @lends enyo.TextArea.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.TextArea',

	/**
	* @private
	*/
	kind: Input,

	/**
	* @private
	*/
	mixins: options.accessibility ? [TextAreaAccessibilitySupport] : null,

	/**
	* @private
	*/
	tag: 'textarea',

	/**
	* @private
	*/
	classes: 'enyo-textarea',

	/**
	* [TextArea]{@link enyo.TextArea} does use the [value]{@link enyo.Input#value} attribute;
	* it needs to be kicked when rendered.
	*
	* @method
	* @private
	*/
	rendered: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.valueChanged();
		};
	})
});
