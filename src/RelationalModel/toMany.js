/**
 * Contains the declaration for the {@link module:enyo/RelationalModel~toMany} kind.
 * @module enyo/RelationalModel
 */

var
	kind = require('../kind'),
	utils = require('../utils'),
	Collection = require('../Collection'),
	Relation = require('../Relation'),
	Store = require('../Store');

var
	RelationalCollection = require('./RelationalCollection'),
	toOne = require('./toOne');

/**
* Represents a relationship of data from one [model]{@link module:enyo/Model~Model} to many
* models. This is an internally-used class.
*
* @class toMany
* @extends module:enyo/Relation~Relation
* @protected
*/
var toMany = module.exports = kind(
	/** @lends module:enyo/RelationalModel~toMany.prototype */ {
	
	/**
	* @private
	*/
	kind: Relation,
	
	/**
	* @private
	*/
	name: 'enyo.toMany',
	
	/**
	* The default [options]{@link module:enyo/RelationalModel~RelationOptions} overloaded for this
	* [kind]{@glossary kind}.
	*
	* @type module:enyo/RelationalModel~RelationOptions
	* @property {Boolean} create=true - By default, the relation should create the
	*	[collection]{@link module:enyo/Collection~Collection} automatically.
	* @property {module:enyo/Collection~Collection} collection=RelationalCollection - The
	*	[kind]{@glossary kind} of collection to use; can be the kind name or a
	*	reference to the constructor.
	* @property {Object} collectionOptions - An options hash to pass to the
	*	collection when it is being instanced.
	* @public
	*/
	options: {
		create: true,
		collection: RelationalCollection,
		collectionOptions: {}
	},
	
	/**
	* @private
	*/
	init: function () {
		/*jshint -W055 */
		var collection = this.collection,
			model = this.model,
			collectionOpts = this.collectionOptions ? utils.clone(this.collectionOptions) : {},
			inst = this.instance,
			key = this.key,
			related = this.related != null ? this.related : inst.attributes[key];
		
		if (typeof collection == 'string') collection = kind.constructorForKind(collection);
		if (typeof model == 'string') model = kind.constructorForKind(model);
		
		// since we allow the model property to be used for the collection constructor
		// we need to check for and use it if we find it
		if (model.prototype instanceof Collection) {
			collection = model;
			model = collection.prototype.model;
		}
		
		// in case we couldn't find one
		if (!model) model = collection.prototype.model;
		else collectionOpts.model = collectionOpts.model || model;
		
		// now ensure that what we found we store for reuse
		this.collection = collection instanceof Collection ? collection.ctor : collection;
		this.model = model;
		
		// ensure we've applied the requested properties to the collection
		if (collection instanceof Collection) utils.mixin(collection, collectionOpts);
		else collection = new collection(collectionOpts);
		
		// ensure we have the correct parse value
		this.parse = this.parse || model.prototype.options.parse;
		
		// create means we assume all data fetching will be done arbitrarily and we will not
		// be fetching separately from the owner
		if (this.create) {
			if (related != null) {
				if (this.parse) related = collection.parse(related);
				// we can avoid subsequent exists call because it needs to be an object
				collection.add(related);
			}
		} else {
			
			// if the fetch flag is truthy we will execute the (assumably) asynchronous
			// request now ensuring we pass in any options that might have been available
			if (this.fetch) this.fetchRelated();
		}
		
		inst.attributes[key] = this;
		
		// ensure we store our related collection now
		this.related = collection;
		
		// we need to detect these changes to propagate them onward
		collection.on('*', this._changed, this);
	
		// special overload of store allows us to more narrowly listen to particular events
		// for associated kinds
		
		// @note We only register for this if we have an inverseKey otherwise we have no
		// way of knowing the reverse relationship
		if (this.inverseKey) Store.on(model, 'add', this._changed, this);
		/*jshint +W055 */
	},
	
	/**
	* @private
	*/
	fetchRelated: function () {
		
	},
	
	/**
	* @private
	*/
	setRelated: function (data) {
		var related = this.related;
		
		// related.add(data, {purge: true, parse: true});
		related.add(data, {purge: true});
	},
	
	/**
	* @private
	*/
	findRelated: function () {
		var ctor = this.model,
			related = this.related,
			inverseKey = this.inverseKey,
			found;
		
		if (inverseKey) {
			found = Store.findLocal(ctor, this.checkRelation, {context: this});
			// we shouldn't need to update any records already present so we'll ignore
			// duplicates for efficiency
			if (found.length) {
				related.add(found, {merge: false});
			}
		}
	},
	
	/**
	* @private
	*/
	checkRelation: function (model) {
		var ctor = this.model,
			inst = this.instance,
			key = this.key,
			inverseKey = this.inverseKey,
			related = inverseKey && model.get(inverseKey),
			rev = model.getRelation(inverseKey),
			id = inst.get(inst.primaryKey),
			isOwner = this.isOwner;
			
		if (related != null && (related === inst || related == id)) {
			
			// if the relation isn't found it probably wasn't defined and we need
			// to automatically generate it based on what we know
			if (!rev && inverseKey) {
				rev = new toOne(model, {
					key: inverseKey,
					inverseKey: key,
					parse: false,
					create: false,
					isOwner: !isOwner,
					model: ctor,
					related: inst
				});
				
				model.relations.push(rev);
			}
			
			if (rev.related !== inst) rev.setRelated(inst);
			return true;
		}
		
		return false;
	},
	
	/**
	* @private
	*/
	raw: function () {
		var iJson = this.includeInJSON
			, raw;
		if (iJson === true) raw = this.related.raw();
		else if (typeof iJson == 'string') {
			raw = this.related.map(function (model) {
				return model.get(iJson);
			});
		} else if (iJson instanceof Array) {
			raw = this.related.map(function (model) {
				return utils.only(iJson, model.raw());
			});
		} else if (typeof iJson == 'function') raw = iJson.call(this.instance, this.key, this);
		return raw;
	},
	
	/**
	* @private
	*/
	_changed: function (sender, e, props) {
		// console.log('enyo.toMany._changed: ', arguments);
		
		var inst = this.instance
			, key = this.key
			, related = this.related
			, isOwner = this.isOwner
			, changed;
		
		if (sender === Store) {
			if (e == 'add') {
				if (this.checkRelation(props.model)) this.related.add(props.model, {merge: false});
			}
		} else if (sender === related) {
			if (isOwner) {
				
				// if the instance is already changing then we do not need to do anything
				// because it probably stemmed from there anyway
				if (inst._changing) return;
				
				// @todo This must be updated to be more thorough...
				inst.isDirty = true;
				changed = inst.changed || (inst.changed = {});
				inst.previous || (inst.previous = {});
				changed[key] = related;
				inst.emit('change', changed, inst);
			}
		}
	},
	
	/**
	* @private
	*/
	destroy: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			
			// @TODO: !!!
		};
	})
});

/**
* @private
*/
toMany.concat = function (ctor, props) {
	var proto = ctor.prototype;
	if (props.collectionOptions) {
		proto.collectionOptions = utils.mixin({}, [proto.collectionOptions, props.collectionOptions]);
		delete props.collectionOptions;
	}
};
