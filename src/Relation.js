require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Relation~Relation} kind.
* @module enyo/Relation
*/

var
	kind = require('./kind'),
	utils = require('./utils');

var
	Store = require('./Store');

/**
* The default options for [relations]{@link module:enyo/RelationalModel~RelationalModel#relations}.
* These may vary depending on the individual [kind]{@glossary kind} of relation.
*
* @typedef {Object} module:enyo/RelationalModel~RelationOptions
* @property {String} type=toOne - The [kind]{@glossary kind} of relation being declared.
*	Can be the name of the relation type or a reference to the constructor.
* @property {String} key=null - The [attribute]{@link module:enyo/Model~Model#attributes} name for the
*	relation being declared.
* @property {Boolean} create=false - Whether or not the relation should automatically create
*	the instance of the related kind.
* @property {Boolean} parse=false - Whether or not the relation should call the
*	[parse()]{@link module:enyo/Model~Model#parse} method on incoming data before
*	[setting]{@link module:enyo/Model~Model#set} it on the [model]{@link module:enyo/RelationalModel~RelationalModel}.
* @property {String} model=enyo.RelationalModel - The kind of the
*	reverse of the relation. This will vary depending on the type of relation being declared.
* @property {Boolean} fetch=false - Whether or not to automatically call
*	[fetch()]{@link module:enyo/Model~Model#fetch} (or {@link module:enyo/Collection~Collection#fetch}) after initialization.
* @property {String} inverseKey=null - The key of the reverse relation.
* @property {String} inverseType=null - The type of the reverse relation.
* @property {Boolean} isOwner=false - Whether or not this end of the relation owns the
*	reverse. If it does, it will update according to changes and will include the reverse end
*	in its [raw()]{@link module:enyo/Model~Model#raw} output.
* @property {(Boolean|String|String[])} includeInJSON=true - Whether or not to include the
*	relation in its `raw()` output. If a [string]{@glossary String},
*	only that key will be included; if an [array]{@glossary Array}, only those keys will
*	be included.
*/
var relationDefaults = {
	type: 'toOne',
	key: null,
	create: false,
	parse: false,
	model: null,
	fetch: false,
	inverseKey: null,
	inverseType: null,
	isOwner: false,
	includeInJSON: true
};

/**
* @class Relation
* @protected
*/
var Relation = module.exports = kind(
	/** @lends module:enyo/Relation~Relation.prototype */ {
		
	/**
	* @private
	*/
	name: "Relation",
	
	/**
	* @private
	*/
	kind: null,
	
	/**
	* @private
	*/
	options: {},
	
	/**
	* @private
	*/
	constructor: function (instance, props) {
		
		// apply any of the properties to ourself for reference
		utils.mixin(this, [relationDefaults, this.options, props]);
		
		// store a reference to the model we're relating
		this.instance = instance;
		
		// ensure we have a constructor for our related model kind
		this.model = kind.constructorForKind(this.model);
		
        this.includeInJSON = props.includeInJSON == null && !this.isOwner
			? (this.model.prototype.primaryKey || 'id')
			: this.includeInJSON;
		
		// let the subkinds do their thing
		this.init();
	},
	
	/**
	* @private
	*/
	getRelated: function () {
		return this.related;
	},
	
	/**
	* @private
	*/
	setRelated: function (related) {
		var inst = this.instance,
			model = this.model,
			was = this.related,
			key = this.key,
			changed,
			prev;
		
		
		if (related) Store.off(model, 'add', this._changed, this);
		
		this.related = related;
		
		if (!inst._changing) {
		
			changed = inst.changed || (inst.changed = {}),
			prev = inst.previous || (inst.previous = {});
		
			changed[key] = related;
			prev[key] = was;
			if (was !== related) inst.emit('change', changed);
		}
		return this;
	},
	
	/**
	* @private
	*/
	destroy: function () {
		var isOwner = this.isOwner,
			create = this.create,
			related = this.related;
			
		if ((isOwner || create) && related && related.destroy && !related.destroyed) {
			related.destroy();
		}
		
		this.destroyed = true;
		this.instance = null;
		this.related = null;
	}
});

/**
* @private
* @static
*/
Relation.concat = function (ctor, props) {
	var proto = ctor.prototype;
	if (props.options) {
		proto.options = utils.mixin({}, [proto.options, props.options]);
		delete props.options;
	}
};

Relation.relationDefaults = relationDefaults;
