require('enyo');

var
	kind = require('./kind');
var
	Input = require('./Input');

/**
* {@link enyo.TextArea} implements an HTML [&lt;textarea&gt;]{@glossary textarea}
* element with cross-platform support for change [events]{@glossary event}.
*
* For more information, see the documentation on
* [Text Fields]{@linkplain $dev-guide/building-apps/controls/text-fields.html}
* in the Enyo Developer Guide.
*
* @class enyo.TextArea
* @extends enyo.Input
* @ui
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