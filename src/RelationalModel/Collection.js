/**
* Contains the declaration for the {@link module:enyo/RelationalModel~Collection} kind.
* @module enyo/RelationalModel/Collection
* @private
*/

var
	kind = require('../kind'),
	Collection = require('../Collection');

var
	Model = require('./Model');

/**
* Private class for a collection with a default model kind of
* {@link module:enyo/RelationalModel~RelationalModel} as opposed to {@link module:enyo/Model~Model}.
* 
* @class Collection
* @name module:enyo/RelationalModel~Collection
* @extends module:enyo/Collection~Collection
* @private
*/
module.exports = kind(
	/** @lends module:enyo/RelationalModel~Collection.prototype */ {
		
	/**
	* @private
	*/
	name: 'Collection',
	
	/**
	* @private
	*/
	kind: Collection,
	
	/**
	* @private
	*/
	model: Model
});
