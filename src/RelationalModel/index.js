require('enyo');

/**
* Contains the declaration for the {@link module:enyo/RelationalModel~RelationalModel} and
* {@link module:enyo/RelationalModel~Collection} kinds.
* @module enyo/RelationalModel
*/

var
	Model = require('./Model'),
	Relation = require('./Relation'),
	toOne = require('./toOne'),
	toMany = require('./toMany'),
	manyToMany = require('./manyToMany');

Model.defineRelationType('toOne', toOne, true);
Model.defineRelationType('toMany', toMany);
Model.defineRelationType('manyToMany', manyToMany);

Relation.relationDefaults.model = Model;
Relation.relationDefaults.type = toOne;

module.exports = Model;