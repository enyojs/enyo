(function (enyo) {
	//*@public
	/**
		An _enyo.Mixin_ is a group of properties and/or methods to apply to a kind
		or instance without requiring the kind to be subclassed. There are a few
		things to keep in mind when creating an _enyo.Mixin_ for use with your
		kinds:

		- A property on a mixin will automatically override the same property on the
			kind or instance it is being applied to, should it already exist.

		- A method that already exists on the kind or instance will not
			automatically call the super-method. If the intention is to extend the
			kind's own method, make sure that you wrap the method with _enyo.inherit_.

		- Mixins must have a name so they can be identified when applied; otherwise,
			the same mixin may be applied multiple times to a given kind,
			potentially resulting in an infinite loop.

		An _enyo.Mixin_ is _not a kind_. It is simply a named collection of methods
		and properties that may be reused with multiple kinds.

		To create an _enyo.Mixin_, simply create a hash of methods and properties,
		and assign it to a referenceable namespace.

		To apply an _enyo.Mixin_ to a kind, simply add its name or a reference to it
		in the special _mixins_ property in the kind definition. Alternatively, you
		may call _extend()_ on the constructor for the kind, passing in the mixin
		(or an array of mixins).

		To apply an _enyo.Mixin_ to an instance of a kind, call the _extend()_
		method on the instance and pass it the name of (or a reference to) the mixin,
		or an array of mixins.
	*/

	//*@protected
	/**
		We add the feature that will execute last in the feature chain but will scan
		for mixins and extend the kind accordingly, only applying any given mixin one time
		to any kind base.
	*/
	var applyMixin = function (proto, props) {
		var mx = proto._appliedMixins,
			m = props, n;
		// if the mixin is a string we have to try to resolve it to an object
		if (enyo.isString(m)) {
			m = enyo.getPath(m);
			if (!m) {
				enyo.warn("could not find the requested mixin " + props);
				// could not find the mixin
				return;
			}
		}
		// we can't do anything if someone attempts to extend a kind with a mixin
		// that does not have a name but all internal mixins should have names
		if (m.name) {
			if (!~enyo.indexOf(m.name, mx)) {
				mx.push(m.name);
			} else {
				// we will not add the same mixin twice, but we throw the warning
				// to alert the developer of the attempt so it can be tracked down
				enyo.warn("attempt to add the same mixin more than once, " +
					m.name + " onto -> " + proto.kindName);
				return;
			}
			n = m.name;
			delete m.name;
		} else {
			n = null;
		}
		var mc = enyo.clone(m);
		// rename constructor to _constructor to work around IE8/Prototype problems
		if (m.hasOwnProperty("constructor")) {
			mc._constructor = m.constructor;
			delete mc.constructor;
		}
		enyo.kind.statics.extend(mc, proto);
		if (n) {
			m.name = n;
		}
	};
	var mixinsFeature = function (ctor, props) {
		if (props.mixins) {
			var cp = ctor.prototype || ctor,
				pm = props.mixins;
			cp._appliedMixins = cp._appliedMixins? enyo.cloneArray(cp._appliedMixins): [],
			// prevent recursion
			delete props.mixins;
			for (var i=0, m; (m=pm[i]); ++i) {
				applyMixin(cp, m);
			}
		}
	};
	enyo.kind.features.push(mixinsFeature);
	var fn = enyo.concatHandler;
	enyo.concatHandler = function (ctor, props) {
		if (props.mixins) {
			var p = ctor.prototype || ctor;
			p.mixins = (p.mixins? p.mixins.concat(props.mixins): props.mixins.slice());
		}
		fn.apply(this, arguments);
	};
	enyo.kind.extendMethods(enyo.kind.statics, {
		extend: enyo.inherit(function (sup) {
			return function (props, target) {
				var proto = target || this.prototype;
				if (props.mixins) {
					// cut-out the need for concatenated properties to handle
					// this (and it won't be able to because we're removing the
					// new mixins array)
					proto.mixins = enyo.merge(proto.mixins, props.mixins);
					mixinsFeature(proto, props);
				}
				return sup.apply(this, arguments);
			};
		})
	}, true);
	//*@public
	enyo.MixinSupport = {
		name: "MixinSupport",
		/**
			Takes a single parameter--a hash of properties to apply. To be considered
			a _mixin_, it must have a _name_ property that is unique, but the method
			will apply even non-mixins to the kind instance.
		*/
		extend: function (props) {
			applyMixin(this, props);
		},
		/**
			Extend the _importProps()_ method to ensure we can handle runtime additions
			of the mixins' properties since they can be added at any time, even by other
			mixins. This will only be executed against mixins applied after the kind
			has already been evaluated and it is being initialized as an instance.
			However, if a mixin applies more mixins at runtime, it will have no effect.
		*/
		importProps: enyo.inherit(function (sup) {
			return function (props) {
				if (props) { mixinsFeature(this, props); }
				sup.apply(this, arguments);
			};
		})
	};
}(enyo));
