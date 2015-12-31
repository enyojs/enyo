/**
* Exports the {@link module:enyo/BindingSupport~BindingSupport} mixin
* @module enyo/BindingSupport
*/

require('enyo');

var
	kind = require('./kind'),
	utils = require('./utils');

var
	Binding = require('./Binding');

kind.concatenated.push('bindings');

/**
* An internally-used {@glossary mixin} that is added to {@link module:enyo/CoreObject~Object}
* and its [subkinds]{@glossary subkind}. It includes public and protected API
* methods for working with [bindings]{@link module:enyo/Binding~Binding}.
*
* @mixin
* @protected
*/
var BindingSupport = {
	
	/**
	* @private
	*/
	name: 'BindingSupport',
	
	/**
	* @private
	*/
	_bindingSupportInitialized: false,
	
	/**
	* Imperatively creates a [binding]{@link module:enyo/Binding~Binding}. Merges a variable
	* number of [hashes]{@glossary Object} and instantiates a binding that
	* will have its [owner]{@link module:enyo/Binding~Binding#owner} property set to the callee
	* (the current {@link module:enyo/CoreObject~Object}). Bindings created in this way will be
	* [destroyed]{@link module:enyo/Binding~Binding#destroy} when their `owner` is
	* [destroyed]{@link module:enyo/CoreObject~Object#destroy}.
	*
	* @param {...Object} props A variable number of [hashes]{@glossary Object} that will
	*	be merged into the properties applied to the {@link module:enyo/Binding~Binding} instance.
	* @returns {this} The callee for chaining.
	* @public
	*/
	binding: function () {
		var args = utils.toArray(arguments)
			, props = utils.mixin(args)
			, bindings = this.bindings || (this.bindings = [])
			, passiveBindings = this.passiveBindings || (this.passiveBindings = [])
			, PBCtor = Binding.PassiveBinding
			, Ctor, bnd;
			
		props.owner = props.owner || this;
		Ctor = props.kind = props.kind || this.defaultBindingKind || Binding.defaultBindingKind;
		
		if (this._bindingSupportInitialized) {
			utils.isString(Ctor) && (Ctor = props.kind = kind.constructorForKind(Ctor));
			bnd = new Ctor(props);
			bindings.push(bnd);
			if (Ctor === PBCtor) {
				passiveBindings.push(bnd);
			}
			return bnd;
		} else bindings.push(props);
		
		return this;
	},
	
	/**
	* Removes and [destroys]{@link module:enyo/Binding~Binding#destroy} all of, or a subset of,
	* the [bindings]{@link module:enyo/Binding~Binding} belonging to the callee.
	*
	* @param {module:enyo/Binding~Binding[]} [subset] - The optional [array]{@glossary Array} of
	*	[bindings]{@link module:enyo/Binding~Binding} to remove.
	* @returns {this} The callee for chaining.
	* @public
	*/
	clearBindings: function (subset) {
		var bindings = subset || (this.bindings && this.bindings.slice());
		bindings.forEach(function (bnd) {
			bnd.destroy();
		});
		
		return this;
	},

	syncBindings: function (opts) {
		var all = opts && opts.all,
			force = opts && opts.force,
			bindings = all ? this.bindings : this.passiveBindings;

		bindings.forEach(function (b) {
			b.sync(force);
		});
	},
	
	/**
	* Removes a single {@link module:enyo/Binding~Binding} from the callee. (This does not
	* [destroy]{@link module:enyo/Binding~Binding#destroy} the binding.) Also removes the
	* [owner]{@link module:enyo/Binding~Binding#owner} reference if it is the callee.
	*
	* It should be noted that when a binding is destroyed, it is automatically
	* removed from its owner.
	*
	* @param {module:enyo/Binding~Binding} binding - The {@link module:enyo/Binding~Binding} instance to remove.
	* @returns {this} The callee for chaining.
	* @public
	*/
	removeBinding: function (binding) {
		utils.remove(binding, this.bindings);
		if (binding.ctor === Binding.PassiveBinding) {
			utils.remove(binding, this.passiveBindings);
		}
		
		if (binding.owner === this) binding.owner = null;
		
		return this;
	},
	
	/**
	* @private
	*/
	constructed: kind.inherit(function (sup) {
		return function () {
			var bindings = this.bindings;
			this._bindingSupportInitialized = true;
			if (bindings) {
				this.bindings = [];
				this.passiveBindings = [];
				bindings.forEach(function (def) {
					this.binding(def);
				}, this);
			}
			sup.apply(this, arguments);
		};
	}),
	
	/**
	* @private
	*/
	destroy: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.bindings && this.bindings.length && this.clearBindings();
			this.bindings = null;
			this.passiveBindings = null;
		};
	})
};

module.exports = BindingSupport;

/**
	Hijack the original so we can add additional default behavior.
*/
var sup = kind.concatHandler
	, flags = {ignore: true};

/**
* @private
*/
kind.concatHandler = function (ctor, props, instance) {
	var proto = ctor.prototype || ctor
		, kind = props && (props.defaultBindingKind || Binding.defaultBindingKind)
		, defaults = props && props.bindingDefaults;
	
	sup.call(this, ctor, props, instance);
	if (props.bindings) {
		props.bindings.forEach(function (bnd) {
			defaults && utils.mixin(bnd, defaults, flags);
			bnd.kind || (bnd.kind = kind); 
		});
		
		proto.bindings = proto.bindings? proto.bindings.concat(props.bindings): props.bindings;
		delete props.bindings;
	}
};
