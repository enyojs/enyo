var
	kind = require('../kind'),
	Collection = require('../Collection');

var
	RelationalModel = require('./RelationalModel');

/**
* Private class for a collection with a default model kind of
* {@link enyo.RelationalModel} as opposed to {@link enyo.Model}.
* 
* @class RelationalCollection
* @extends enyo.Collection
* @private
*/
module.exports = kind(
	/** @lends RelationalCollection.prototype */ {
		
	/**
	* @private
	*/
	kind: Collection,
	
	/**
	* @private
	*/
	model: RelationalModel
});