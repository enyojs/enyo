require('enyo');

/**
* Contains the declaration for the {@link module:enyo/TextArea~TextArea} kind.
* @module enyo/TextArea
*/

var
	kind = require('../kind');
var
	Input = require('../Input');

/**
* {@link module:enyo/TextArea~TextArea} implements an HTML [&lt;textarea&gt;]{@glossary textarea}
* element with cross-platform support for change [events]{@glossary event}.
*
* For more information, see the documentation on
* [Text Fields]{@linkplain $dev-guide/building-apps/controls/text-fields.html}
* in the Enyo Developer Guide.
*
* @class TextArea
* @extends module:enyo/Input~Input
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:enyo/TextArea~TextArea.prototype */ {

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
	tag: 'textarea',

	/**
	* @private
	*/
	classes: 'enyo-textarea',

	/**
	* [TextArea]{@link module:enyo/TextArea~TextArea} does use the [value]{@link module:enyo/Input~Input#value} attribute;
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
	}),

	// Accessibility

	/**
	* @private
	*/
	ariaObservers: [
		{to: 'aria-multiline', value: true},
		{from: 'disabled', to: 'aria-disabled'}
	]
});
