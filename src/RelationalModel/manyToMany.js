/**
* Contains the declaration for the {@link module:moonstone/RelationalModel~manyToMany} kind.
* @module enyo/RelationalModel
*/

var
	kind = require('../kind');

var
	toMany = require('./toMany');

/**
* Represents a relationship of data from many [models]{@link module:enyo/Model~Model} to many
* models. This is an internally-used class.
*
* @class manyToMany
* @extends module:enyo/RelationalModel~toMany
* @protected
*/
var manyToMany = module.exports = kind(
	/** @lends module:enyo/RelationalModel~manyToMany.prototype */ {
	
	/**
	* @private
	*/
	kind: toMany,
	
	/**
	* @private
	*/
	name: 'enyo.manyToMany',
	
	/**
	* The default [options]{@link module:enyo/RelationalModel~RelationOptions} overloaded for this
	* [kind]{@glossary kind}.
	*
	* @see module:enyo/RelationalModel~toMany#options
	* @type module:enyo/RelationalModel~RelationOptions
	* @property {String} inverseType=enyo.manyToMany - This is the **required** type.
	* @public
	*/
	options: {
		inverseType: null // set after the fact
	},
	
	/**
	* @private
	*/
	checkRelation: function (model) {
		var Ctor = this.model,
			inst = this.instance,
			key = this.key,
			inverseKey = this.inverseKey,
			related = inverseKey && model.get(inverseKey),
			rel = model.getRelation(inverseKey),
			// id = inst.get(inst.primaryKey),
			isOwner = this.isOwner;
		
		if (related && related.has(inst)) {
		// if (related && (related.has(inst) || related.find(function (model) { return model.attributes[model.primaryKey] == id; }))) {
			
			// if the relation isn't found it probably wasn't defined and we need
			// to automatically generate it based on what we know
			if (!rel) {
				model.relations.push((rel = new manyToMany(model, {
					key: inverseKey,
					inverseKey: key,
					parse: false,
					create: false,
					isOwner: !isOwner,
					model: Ctor,
					related: inst
				})));
			}
			
			// if (rel.related !== inst) rel.setRelated(inst);
			// if (!rel.related.has(inst)) rel.related.add(inst);
			return true;
		}
		
		return false;
	},
	
	/**
	* @private
	*/
	_changed: kind.inherit(function (sup) {
		return function (sender, e, props) {
			var related = this.related,
				inst = this.instance,
				inverseKey = this.inverseKey,
				isOwner = this.isOwner,
				model,
				i;
			
			// this is a very tricky scenario that we need to be very careful about to try
			// and avoid unnecessary work (when possible) and to keep out of an infinite
			// loop of notifications
			if (sender === related) {
				
				// we are attempting to distinguish between the occassions we can encounter
				// this method here if our related collection emits an add, remove or change
				// event -- if it is change we know it stemmed from a model already
				// contained by it
				if (e == 'change') {
					// we need to figure out if the thing that changed makes us no longer
					// related to them
					// console.log('_changed');
				} else if (e == 'add') {
					// in this case we added a/some model/models that should probably be
					// updated to know about our instance as well
					for (i = 0; (model = props.models[i]); ++i) {
						model.get(inverseKey).add(inst, {merge: false});
					}
				} else if (e == 'remove') {
					// in this case we removed a/some model/models that should probably be
					// updated to know about the removal as well
					for (i = 0; (model = props.models[i]); ++i) {
						
						// this event will be caught in the event that the model was destroyed
						// but should that happen the other collections will also have done
						// this already (or will do it) but if the model is already destroyed
						// it won't be able to retrieve its relations anymore so we can
						// safely skip it
						if (!model.destroyed) model.get(inverseKey).remove(inst);
					}
				}
				
				// manyToMany is a special case that requires us to propagate the changes from
				// either end as changes to the parent model unlike toMany and toOne that
				// exclusively rely on the isOwner field and safely assuming uni-directional
				// ownership - but blindly setting isOwner to true on all manyToMany relations
				// won't work either because of the repercussions on other aspects of the
				// relationship so we should propagate changes but only on add/remove events
				// so we don't cause an infinite loop of change events and we fake the ownership
				// flag when necessary to get it to emit the change as it is encountered in this
				// scope only
				if (e == 'add' || e == 'remove') {
					// force it to be true for this call
					this.isOwner = true;
					sup.apply(this, arguments);
					// return it to whatever it was originally
					this.isOwner = isOwner;
				}
				
			} else sup.apply(this, arguments);
		};
	})
});

manyToMany.prototype.options.inverseType = manyToMany;
