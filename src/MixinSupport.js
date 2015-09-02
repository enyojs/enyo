/**
* Exports the {@link module:enyo/MixinSupport~MixinSupport} mixin.
* @module enyo/MixinSupport
*/

require('enyo');


var
	utils = require('./utils'),
	kind = require('./kind'),
	logger = require('./logger');

kind.concatenated.push('mixins');

var sup = kind.statics.extend;

var extend = kind.statics.extend = function extend (args, target) {
	if (utils.isArray(args)) return utils.forEach(args, function (ln) { extend.call(this, ln, target); }, this);
	if (typeof args == 'string') apply(target || this.prototype, args);
	else {
		if (args.mixins) feature(target || this, args);
	
		// this allows for mixins to apply mixins which...is less than ideal but possible
		if (args.name) apply(target || this.prototype, args);
		else sup.apply(this, arguments);
	}
};

/*
* Applies, with safeguards, a given mixin to an object.
*/
function apply (proto, props) {
	var applied = proto._mixins? (proto._mixins = proto._mixins.slice()): (proto._mixins = [])
		, name = utils.isString(props)? props: props.name
		, idx = utils.indexOf(name, applied);
	if (idx < 0) {
		name == props && (props = utils.getPath(name));
		// if we could not resolve the requested mixin (should never happen)
		// we throw a simple little error
		// @TODO: Normalize error format
		!props && logger.error('Could not find the mixin ' + name);
		
		// it should be noted that this ensures it won't recursively re-add the same mixin but
		// since it is possible for mixins to apply mixins the names will be out of order
		// this name is pushed on but the nested mixins are applied before this one
		name && applied.push(name);
		
		props = utils.clone(props);
		
		// we need to temporarily move the constructor if it has one so it
		// will override the correct method - this is a one-time permanent
		// runtime operation so subsequent additions of the mixin don't require
		// it again
		if (props.hasOwnProperty('constructor')) {
			props._constructor = props.constructor;
			delete props.constructor;
		}
		
		delete props.name;
		extend(props, proto);
		
		// now put it all back the way it was
		props.name = name;
	}
}

function feature (ctor, props) {
	if (props.mixins) {
		var proto = ctor.prototype || ctor
			, mixins = props.mixins;
		
		// delete props.mixins;
		// delete proto.mixins;
		
		proto._mixins && (proto._mixins = proto._mixins.slice());
		utils.forEach(mixins, function (ln) { apply(proto, ln); });
	}
}

kind.features.push(feature);

/**
* An internally-used support {@glossary mixin} that adds API methods to aid in
* using and applying mixins to [kinds]{@glossary kind}.
*
* @mixin
* @protected
*/
var MixinSupport = {
	
	/**
	* @private
	*/
	name: 'MixinSupport',
	
	/**
	* Extends the instance with the given properties.
	*
	* @param {Object} props - The property [hash]{@glossary Object} from which to extend
	*	the callee.
	*/
	extend: function (props) {
		props && apply(this, props);
	},
	
	/**
	* @private
	*/
	importProps: kind.inherit(function (sup) {
		return function (props) {
			props && props.mixins && feature(this, props);
			
			sup.apply(this, arguments);
		};
	})
};

module.exports = MixinSupport;
