/**
* Contains the declaration for the {@link module:enyo/RelationalModel~toOne} kind.
* @module enyo/RelationalModel
*/

var
	kind = require('../kind'),
	utils = require('../utils'),
	Model = require('../Model'),
	Relation = require('../Relation'),
	Store = require('../Store');

/**
* Represents a relationship of data from one [model]{@link module:enyo/Model~Model} to another
* model. This is an internally-used class.
*
* @class toOne
* @extends module:enyo/Relation~Relation
* @protected
*/
var toOne = module.exports = kind(
	/** @lends module:enyo/RelationalModel~toOne.prototype */ {
	
	/**
	* @private
	*/
	kind: Relation,
	
	/**
	* @private
	*/
	name: 'enyo.toOne',
	
	/**
	* The default [options]{@link module:enyo/RelationalModel~RelationOptions} overloaded for this
	* [kind]{@glossary kind}.
	*
	* @type module:enyo/RelationalModel~RelationOptions
	* @property {String} inverseType=enyo.toOne - This can be `'enyo.toOne'` or `'enyo.toMany'`.
	* @property {Object} modelOptions - An options hash to pass to the related instance if
	*	`create` is `true`.
	* @public
	*/
	options: {
		inverseType: null, // set after the fact
		modelOptions: null
	},
	
	/**
	* @private
	*/
	init: function () {
		
		var model = this.model,
			inverseType = this.inverseType,
			inst = this.instance,
			key = this.key,
			// isOwner = this.isOwner,
			related = this.related == null ? inst.attributes[key] : this.related,
			modelOptions = this.modelOptions,
			id,
			found;
		
		// ensure we have a valid model constructor
		if (typeof model == 'string') model = kind.constructorForKind(model);
		
		// ensure our inverse type constructor is correct
		if (typeof inverseType == 'string') inverseType = kind.constructorForKind(inverseType);
		
		// ensure we've got the correct related if any
		if (related || related === 0) this.related = related;
		
		// the instance attribute for the designated key will actually point to this relation
		inst.attributes[key] = this;
		this.inverseType = inverseType;
		
		// if we have a related value now check to see if it is something we should attempt
		// to resolve
		if (related != null) {
			
			// just make sure that no one stuck an instance in here
			if (!(related instanceof Model)) {
			
				// try and figure out what the assumed id for the related model is if possible
				if (typeof related == 'object') id = related[model.prototype.primaryKey];
				else if (typeof related == 'string' || typeof related == 'number') id = related;
				
				if (id != null) found = Store.resolve(model, id);
				
				// if we found an instance we store it and make sure to update the local
				// reference here
				if (found) related = this.related = found;
			}
		}
		
		// if this is the owner side of the relation we may need to create the instance
		// for our relation if it wasn't found already
		if (related == null || !(related instanceof Model)) {
			if (this.create) {
				
				// if the only information we have about the thing is a string or number
				// then we facade a data hash so the model has the opportunity to work
				// as expected
				if (related != null && typeof related != 'object') {
					id = related;
					related = {};
					related[model.prototype.primaryKey] = id;
				}
				
				// if the parse flag is true then we force a parse operation on model
				// creation regardless of its own flags
				if (this.parse) {
					if (!modelOptions) modelOptions = {};
					modelOptions.parse = true;
				}
				/*jshint -W055 */
				// we create the empty instance so we can separately deal with the
				// various ways the related data could be handed to us (could be id or data)
				found = model = new model(related, null, modelOptions);
				/*jshint +W055 */
				this.related = model;
			}
		}
		
		if (!found) Store.on(model, 'add', this._changed, this);
		
		// last but not least we begin to listen for changes on our model instance
		inst.on('change', this._changed, this);
	},
	
	/**
	* @private
	*/
	setRelated: kind.inherit(function (sup) {
		return function (related) {
			var val;
			
			if (related && related instanceof Model) {
				return sup.apply(this, arguments);
			} else if (related != null) {
				val = related;
				related = this.getRelated();
				
				// the only thing we can do is assume the value is intended to be the primary
				// key of the model just like we would had it been passed into the constructor
				if (this.create && related) related.set(related.primaryKey, val);
				// otherwise we allow it to be set and try and find the model from this new
				// criterion but we don't do all the notifications for it as code expecting
				// an instance may be disappointed (e.g. break, die, suicide, self-destruct...)
				else {
					this.related = related;
					related = this.findRelated();
					// if it was found by this new value somehow we allow the original
					// set to take place so it will notify everyone
					if (related && related instanceof Model) return sup.call(this, related);
				}
			}
			
			// @TODO: This ignores cases that it might be set as null or undefined which
			// would clear the related but most of the code assumes there will always be
			// a value for related but it seems _possible_ that this behavior may be
			// necessary so would need to find a way to handle that
		};
	}),
	
	/**
	* @private
	*/
	fetchRelated: function () {
	},
	
	/**
	* @private
	*/
	findRelated: function () {
		
		var related = this.related,
			// inst = this.instance,
			isOwner = this.isOwner,
			found,
			rev;
			
		if (related && related instanceof this.model) found = related;
		else {
			
			// we need to search for the related instance if we can
			found = Store.findLocal(
				this.model,
				this.checkRelation,
				{all: false, context: this}
			);
		}
		
		if (found) {
			
			// if we are the owner end we may have a listener on the store and can
			// safely remove it
			Store.off(this.model, 'add', this._changed, this);
			
			// update our related value
			this.related = found;
			
			// if we can/need to we will establish the other end of this relationship
			if (this.inverseKey) {
				rev = found.getRelation(this.inverseKey);
				
				// if there isn't one then we go ahead and create it implicitly
				if (!rev) {
					rev = new this.inverseType(found, {
						key: this.inverseKey,
						inverseKey: this.key,
						parse: false,
						create: false,
						model: this.instance.ctor,
						related: this.instance
					});
					
					found.relations.push(rev);
				}
				
				// now we ensure that the instances are pointing at eachother
				switch (rev.kindName) {
				case 'enyo.toOne':
					if (rev.related !== this.instance) rev.setRelated(this.instance);
					break;
				case 'enyo.toMany':
					rev.related.add(this.instance, {merge: false});
					break;
				}
			}
			
			if (isOwner) found.on('change', this._changed, this);
		}
		
		return found;
	},
	
	/**
	* @private
	*/
	checkRelation: function (model) {
		var related = this.related,
			inst = this.instance,
			id = inst.get(inst.primaryKey),
			inverseKey = this.inverseKey,
			pkey = model.get(model.primaryKey);
		
		return (related && (
				model.euid == related ||
				pkey == related ||
				pkey == related[inst.primaryKey]
			) || (id != null && model.get(inverseKey) == id)
		);
	},
	
	/**
	* @private
	*/
	raw: function () {
		var iJson = this.includeInJSON,
			raw = '';
		if (this.related) {
			if (iJson === true) raw = this.related.raw();
			else if (typeof iJson == 'string') raw = this.related.get(iJson);
			else if (iJson instanceof Array) raw = utils.only(iJson, this.related.raw());
			else if (typeof iJson == 'function') raw = iJson.call(this.instance, this.key, this);
		}
		return raw;
	},
	
	/**
	* @private
	*/
	_changed: function (sender, e, props) {
		var key = this.key,
			inst = this.instance,
			isOwner = this.isOwner,
			changed;
		
		if (sender === this.instance) {
			if (e == 'change') {
				if (key in props) this.findRelated();
			}
		} else if (sender === this.related) {
			if (e == 'change' && isOwner) {
				
				// if the instance is already changing then we do not need to do anything
				// because it probably stemmed from there anyway
				if (inst._changing) return;
				
				// @todo This must be updated to be more thorough...
				inst.isDirty = true;
				changed = inst.changed || (inst.changed = {});
				inst.previous || (inst.previous = {});
				changed[key] = this.related;
				inst.emit('change', changed, inst);
			}
		}
	}
});

toOne.prototype.options.inverseType = toOne;
