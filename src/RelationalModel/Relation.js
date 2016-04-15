require('enyo');

/**
* Contains the declaration for the {@link module:enyo/RelationalModel~Relation} kind.
* @module enyo/RelationalModel/Relation
* @private
*/

var
	kind = require('../kind'),
	utils = require('../utils');

var
	Store = require('../Store');

/**
* The default options for [relations]{@link module:enyo/RelationalModel~RelationalModel#relations}.
* These may vary depending on the individual [kind]{@glossary kind} of relation.
*
* @typedef {Object} module:enyo/RelationalModel~RelationOptions
* @property {module:enyo/RelationalModel~Relation} type=module:enyo/RelationalModel~toOne - The
*   [kind]{@glossary kind} of relation being declared.
* @property {String} key=null - The [attribute]{@link module:enyo/Model~Model#attributes} name for
*	the relation being declared.
* @property {Boolean} create=false - Whether or not the relation should automatically create
*	the instance of the related kind.
* @property {Boolean} parse=false - Whether or not the relation should call the
*	[parse()]{@link module:enyo/Model~Model#parse} method on incoming data before
*	[setting]{@link module:enyo/Model~Model#set} it on the
*	[model]{@link module:enyo/RelationalModel~RelationalModel}.
* @property {String} model=enyo/RelationalModel~RelationModel - The kind of the
*	reverse of the relation. This will vary depending on the type of relation being declared.
* @property {Boolean} fetch=false - Whether or not to automatically call
*	[fetch()]{@link module:enyo/Model~Model#fetch} (or
*	{@link module:enyo/Collection~Collection#fetch}) after initialization.
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
	type: null, // set ex post facto by the module
	key: null,
	create: false,
	parse: false,
	model: null, // set ex post facto by the module
	fetch: false,
	inverseKey: null,
	inverseType: null,
	isOwner: false,
	includeInJSON: true
};

/**
* @class Relation
* @name module:enyo/RelationalModel~Relation
* @private
*/
var Relation = module.exports = kind(
	/** @lends module:enyo/RelationalModel~Relation.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.Relation',

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

        this.includeInJSON = props.includeInJSON == null && !this.isOwner
			? (this.model.prototype.primaryKey || 'id')
			: this.includeInJSON;

		// let the subkinds do their thing
		this.init();
	},

	/**
	* @private
	*/
	isRelated: function (related) {
		return related === this.related;
	},

	/**
	* @private
	*/
	getRelated: function () {
		return this.related;
	},

	/**
	* Sets the `related` model
	*
	* @param {module:enyo/Model~Model} related - The related model
	* @param {Object} [opts] - Used by subkinds to configure the behavior of the method
	* @private
	*/
	setRelated: function (related, opts) {
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

Relation.concat = function (ctor, props) {
	var proto = ctor.prototype;
	if (props.options) {
		proto.options = utils.mixin({}, [proto.options, props.options]);
		delete props.options;
	}
};

Relation.relationDefaults = relationDefaults;
