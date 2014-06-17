(function (enyo) {
	
	var forEach = enyo.forEach
		, extend = enyo.kind.statics.extend
		, isString = enyo.isString
		, isArray = enyo.isArray
		, clone = enyo.clone
		, indexOf = enyo.indexOf
		, inherit = enyo.inherit
		, getPath = enyo.getPath;
	
	enyo.concatenated.push("mixins");
	
	/**
		Apply, with safeguards, a given mixin to an object.
		@private
	*/
	function apply (proto, props) {
		var applied = proto._mixins? (proto._mixins = proto._mixins.slice()): (proto._mixins = [])
			, name = isString(props)? props: props.name
			, idx = indexOf(name, applied);
		if (idx < 0) {
			name == props && (props = getPath(name));
			// if we could not resolve the requested mixin (should never happen)
			// we throw a simple little error
			// @TODO: Normalize error format
			!props && enyo.error("Could not find the mixin " + name);
			
			name && applied.push(name);
			
			props = clone(props);
			
			// we need to temporarily move the constructor if it has one so it
			// will override the correct method - this is a one-time permanent
			// runtime operation so subsequent additions of the mixin don't require
			// it again
			if (props.hasOwnProperty("constructor")) {
				props._constructor = props.constructor;
				delete props.constructor;
			}
			
			delete props.name;
			extend(props, proto);
			
			// now put it all back the way it was
			props.name = name;
		}
	}
	
	/**
		@private
	*/
	function feature (ctor, props) {
		if (props.mixins) {
			var proto = ctor.prototype || ctor
				, mixins = props.mixins;
			
			// delete props.mixins;
			// delete proto.mixins;
			
			proto._mixins && (proto._mixins = proto._mixins.slice());
			forEach(mixins, function (ln) { apply(proto, ln); });
		}
	}
	
	enyo.kind.features.push(feature);
	
	var sup = enyo.kind.statics.extend;
	
	/**
		@private
	*/
	extend = enyo.kind.statics.extend = function (args, target) {
		if (isArray(args)) return forEach(args, function (ln) { extend.call(this, ln, target); }, this);
		if (args.mixins) feature(target || this, args);
		else if (isString(args)) apply(target || this.prototype, args);
		else if (args.name) apply(target || this.prototype, args);
		else sup.apply(this, arguments);
	};
	
	/**
		@public
		@mixin enyo.MixinSupport
	*/
	enyo.MixinSupport = {
		name: "MixinSupport",
		
		/**
			@public
			@method
		*/
		extend: function (props) {
			props && apply(this, props);
		},
		
		/**
			@private
			@method
		*/
		importProps: inherit(function (sup) {
			return function (props) {
				props && props.mixins && feature(this, props);
				
				sup.apply(this, arguments);
			};
		})
	};

}(enyo));
