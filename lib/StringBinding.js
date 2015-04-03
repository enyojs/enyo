require('enyo');

var
	kind = require('./kind');

var
	Binding = require('./Binding');

/**
* A {@link enyo.Binding} designed to only propagate a {@glossary String}. If it is not the
* correct type, it will instead propagate an empty {@glossary String}.
*
* @class enyo.StringBinding
* @extends enyo.Binding
* @public
*/
module.exports = kind(
	/** @lends enyo.StringBinding.prototype */ {
	
	name: 'enyo.StringBinding',
	
	/**
	* @private
	*/
	kind: Binding,
	
	/**
	* @private
	*/
	transform: function (value) {
		return (typeof value == 'string') ? value : '';
	}
});