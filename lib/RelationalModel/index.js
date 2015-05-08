require('enyo');

var
	RelationalModel = require('./RelationalModel'),
	toOne = require('./toOne'),
	toMany = require('./toMany'),
	manyToMany = require('./manyToMany');

RelationalModel.defineRelationType('toOne', toOne, true);
RelationalModel.defineRelationType('toMany', toMany);
RelationalModel.defineRelationType('manyToMany', manyToMany);

module.exports = RelationalModel;