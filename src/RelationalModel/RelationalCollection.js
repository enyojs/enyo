/**
* Contains the declaration for the {@link module:enyo/RelationalModel~RelationalCollection} kind.
* @module enyo/RelationalModel
*/

var
	kind = require('../kind'),
	Collection = require('../Collection');

var
	RelationalModel = require('./RelationalModel');

/**
* Private class for a collection with a default model kind of
* {@link module:enyo/RelationalModel~RelationalModel} as opposed to {@link module:enyo/Model~Model}.
* 
* @class RelationalCollection
* @extends module:enyo/Collection~Collection
* @private
*/
module.exports = kind(
	/** @lends module:enyo/RelationalModel~RelationalCollection.prototype */ {
		
	/**
	* @private
	*/
	name: "RelationalCollection",
	
	/**
	* @private
	*/
	kind: Collection,
	
	/**
	* @private
	*/
	model: RelationalModel
});
