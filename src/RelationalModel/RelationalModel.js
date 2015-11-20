/**
 * Contains the declaration for the {@link module:enyo/RelationalModel~RelationalModel} kind.
 * @module enyo/RelationalModel
 */

var
	kind = require('../kind'),
	utils = require('../utils');

var
	Model = require('../Model'),
	Store = require('../Store'),
	Relation = require('../Relation');

var
	defaultRelationType;

/**
* A type of {@link module:enyo/Model~Model} extended to automatically understand relationships with
* other models. You may define these relationship via the
* [relations]{@link module:enyo/RelationalModel~RelationalModel#relations} property. These relationships allow
* individual models to exist separately, but be treated as a single entity.
*
* @class RelationalModel
* @extends module:enyo/Model~Model
* @public
*/
var RelationalModel = module.exports = kind(
	/** @lends module:enyo/RelationalModel~RelationalModel.prototype */ {
	
	name: 'enyo.RelationalModel',
	
	/**
	* @private
	*/
	kind: Model,
	
	/**
	* @private
	*/

	
	/**
	* An [array]{@glossary Array} declaring relationships of this
	* [model]{@link module:enyo/RelationalModel~RelationalModel} to other models.
	* These are [hashes]{@glossary Object} of corresponding
	* [properties]{@link module:enyo/RelationalModel~RelationOptions} used to define
	* and configure individual relations. Relations may be of the type
	* {@link module:enyo/RelationalModel~toOne}, {@link module:enyo/RelationalModel~toMany},
	* or {@link module:enyo/RelationalModel~manyToMany}. Each relation must include a
	* `key` property that is the name of the local
	* [attribute]{@link module:enyo/Model~Model#attributes}. For example:
	*
	* ```javascript
	* var
	* 	kind = require('enyo/kind'),
	* 	RelationalModel = require('enyo/RelationalModel');
	*
	* module.exports = kind({
	* 	name: 'Person',
	* 	kind: RelationalModel,
	* 	relations: [
	* 		{
	* 			key: 'nicknames',
	* 			type: 'toMany',
	* 			model: 'Name',
	* 			isOwner: true,
	* 			includeInJSON: 'id'
	* 		}
	* 	]
	* });
	* ```
	*
	* @type {Array}
	* @default null
	* @public
	*/
	relations: null,
	
	/**
	* Retrieves the relation instance for a given key
	* ([attribute]{@link module:enyo/Model~Model#attributes}).
	*
	* @param {String} key - The key as defined in the
	*	[relations]{@link module:enyo/RelationalModel~RelationalModel#relations} property.
	* @returns {(Relation|undefined)} The correct relation instance, or
	* `undefined` if not found.
	* @public
	*/
	getRelation: function (key) {
		return this.relations.find(function (ln) {
			return ln instanceof Relation && ln.key == key;
		});
	},
	
	/**
	* Determines whether the requested key is the name of a relation.
	*
	* @param {String} key - The key as defined in the
	*	[relations]{@link module:enyo/RelationalModel~RelationalModel#relations} property.
	* @returns {(Relation|undefined)} The correct relation instance, or
	* `undefined` if not found.
	* @public
	*/
	isRelation: function (key) {
		return this.getRelation(key);
	},
	
	/**
	* Overloaded version of [get]{@link module:enyo/Model~Model#get} to be able to use a _path_ through
	* relations.
	*
	* @method
	* @private
	*/
	get: kind.inherit(function (sup) {
		return function (path) {
			var prop = path || (path = ''),
				rel,
				parts;
			
			if (path.indexOf('.') >= 0) {
				parts = path.split('.');
				prop = parts.shift();
			}
			
			rel = this.isRelation(prop);
			
			if (!rel) return sup.apply(this, arguments);
			else if (parts) return rel.getRelated().get(parts.join('.'));
			else return rel.getRelated();
		};
	}),
	
	/**
	* Overloaded version of [set()]{@link module:enyo/Model~Model#set} with the ability to
	* set values for related [models]{@link module:enyo/RelationalModel~RelationalModel} as well.
	*
	* @private
	*/
	set: function (path, is, opts) {
		if (!this.destroyed) {
			var attrs = this.attributes
				, prev = this.previous
				, changed
				, incoming
				, force
				, silent
				, key
				, value
				, curr
				, parts;
			
			if (typeof path == 'object') {
				incoming = path;
				opts || (opts = is);
			} else {
				incoming = {};
				incoming[path] = is;
			}
		
			if (opts === true) {
				force = true;
				opts = {};
			}
		
			opts || (opts = {});
			silent = opts.silent;
			force = force || opts.force;
			
			// ensure that recursive sub routines know we are already being updated and do not
			// need to emit an event because we will
			this._changing = true;
			
			for (key in incoming) {
				value = incoming[key];
				
				if (key.indexOf('.') > 0) {
					parts = key.split('.');
					key = parts.shift();
				}
				
				curr = attrs[key];
				if (curr && curr instanceof Relation) {
					if(parts) curr.getRelated().set(parts.join('.'), value, opts);
					else curr.setRelated(value, opts);
					if (curr.isOwner) {
						changed || (changed = this.changed = {});
						changed[key] = curr.getRelated();
					}
					continue;
				}
				
				if (value !== curr || force) {
					prev || (prev = this.previous = {});
					changed || (changed = this.changed = {});
					// assign previous value for reference
					prev[key] = curr;
					changed[key] = attrs[key] = value;
				}
			}
		
			if (changed || force) {
				// must flag this model as having been updated
				this.isDirty = true;
			
				if (!silent) this.emit('change', changed, this);
			}
		}
		
		// make sure we clear the flag
		this._changing = null;
	},
	
	/**
	* Overloaded to provide additional features for relations.
	*
	* @private
	*/
	raw: function () {
		var inc = this.includeKeys
			, attrs = this.attributes
			, keys = inc || Object.keys(attrs)
			, cpy = inc? utils.only(inc, attrs): utils.clone(attrs);
			
		keys.forEach(function (key) {
			var rel = this.isRelation(key)
				, ent = rel? rel.getRelated(): this.get(key);
			if (!rel) {
				if (typeof ent == 'function') ent.call(this);
				else if (ent && ent.raw) cpy[key] = ent.raw();
				else cpy[key] = ent;
			} else {
				var iJson = rel.includeInJSON;
				// special handling for relations as we need to ensure that
				// they are indeed supposed to be included

				// if it is a falsy value then we do nothing
				if (!iJson) delete cpy[key];
				// otherwise we leave it up to the relation to return the correct
				// value for its settings
				else cpy[key] = rel.raw();
			}
		}, this);
		
		return cpy;
	},
	
	/**
	* @private
	*/
	constructor: kind.inherit(function (sup) {
		return function (attrs, props, opts) {
			opts = opts || {};
			// we need to postpone the addition of the record to the store
			opts.noAdd = true;
			sup.call(this, attrs, props, opts);
			this.initRelations();
			Store.add(this, opts, opts.syncStore);
		};
	}),
	
	/**
	* @private
	*/
	destroy: kind.inherit(function (sup) {
		return function () {
			var relations = this.relations,
				rel,
				i = 0;
			
			// give the relations the ability to teardown during destruction
			for (; (rel = relations[i]); ++i) {
				rel.destroy();
			}
			
			// carry on before finally removing our relations reference
			sup.apply(this, arguments);
			this.relations = null;
		};
	}),
	
	/**
	* @private
	*/
	initRelations: function () {
		// if there aren't any relations we initialize the value to an empty array
		var rels = this.relations ? this.relations.slice() : [],
			rel,
			i = 0;
		
		this.relations = rels;
		
		// if there are relations then we need to ensure that we instance each one and then
		// we attempt to find their existing relations if possible
		if (rels.length) {
			
			for (; (rel = rels[i]); ++i) {
				rels[i] = new rel.type(this, rel);
			}
			
			// unfortunately we had to do this in two passes to ensure that all of the relations
			// were instanced before attempting to find the other relations
			for (i = 0; (rel = rels[i]); ++i) {
				rel.findRelated();
			}
		}
	}

});

/**
* Defines a named relation type
*
* @param  {String}  name      Name of relation type
* @param  {Relation}  type    Relation kind constructor
* @param  {Boolean} isDefault `true` if this type should be the default for type-less relations
*
* @private
*/
RelationalModel.defineRelationType = function (name, type, isDefault) {
	RelationalModel[name] = type;
	if (isDefault) defaultRelationType = type;
};

/**
* Ensures that we concatenate (sanely) the relations for any subkinds.
* 
* @name enyo.RelationalModel.concat
* @static
* @private
*/
RelationalModel.concat = function (ctor, props) {
	var proto = ctor.prototype || ctor
		, rels = proto.relations && proto.relations.slice();

	if (props.relations) {
		rels = (rels && rels.concat(props.relations)) || props.relations;
	}

	// quickly fetch the constructor for the relation once so all instances won't
	// have to look it up later, only need to do this for the incoming props as
	// it will have already been done for any existing relations from a base kind
	props.relations && props.relations.forEach(function (relation) {
		var type = /^enyo\./.test(relation.type) ? relation.type.substring(5) : relation.type;
		relation.type = RelationalModel[type] || type || defaultRelationType;
	});
	
	// remove this property so it will not be slammed on top of the root property
	delete props.relations;
	// apply our modified relations array to the prototype
	proto.relations = rels;
};

Relation.relationDefaults.model = RelationalModel;
