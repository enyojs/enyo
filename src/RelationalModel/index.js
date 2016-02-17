require('enyo');

/**
* Entry point for the {@link module:enyo/RelationalModel/RelationalModel~RelationalModel} kind.
* @module enyo/RelationalModel
*/

var
	RelationalModel = require('./RelationalModel'),
	toOne = require('./toOne'),
	toMany = require('./toMany'),
	manyToMany = require('./manyToMany');

RelationalModel.defineRelationType('toOne', toOne, true);
RelationalModel.defineRelationType('toMany', toMany);
RelationalModel.defineRelationType('manyToMany', manyToMany);

module.exports = RelationalModel;
