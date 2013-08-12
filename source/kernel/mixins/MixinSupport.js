(function (enyo) {
	//*@public
	/**
		An _enyo.Mixin_ is a group of properties and/or methods to apply to
		a kind or instance without requiring the kind to be subclassed. There are some
		things to keep in mind when creating an _enyo.Mixin_ to be used with your _kinds_.
	
		- A property on a mixin will automatically override the same property, should it
		already exist, on the _kind/instance_ it is being applied to.
		- A method that already exists on the _kind/instance_ will not automatically call
		the _super-method_. If the intention is to extend the _kinds_ own method, ensure
		that you wrap the method with _enyo.super_ (see enyo.super)[#enyo.super].
		- Mixins must have a name so they can be identified when applied otherwise the same
		mixin may be applied more than once to a kind that could potentially cause infinite loops.

		An _enyo.Mixin_ is __not a kind__. It is merely a collection of methods and properties
		with a name that can be reused with multiple kinds.
	
		To create an _enyo.Mixin_ you simply create a hash of methods and properties and assign it to
		a referenceable namespace.
	
		To apply an _enyo.Mixin_ to a kind simply add its name or a reference to it in the
		special `mixins` property in the _kind_ definition. Alternatively you can call `extend` on the
		constructor for the kind and pass the mixin or an array of mixins.
	
		To apply an _enyo.Mixin_ to an instance of a kind call the `extend` method on the instance
		and pass it the name or reference to the mixin or an array of mixins.
	*/
	enyo.concat.push("mixins");
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
				// we will not add the same mixin twice but we throw the warning
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
		enyo.kind.statics.extend(m, proto);
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
	enyo.concatHandler("mixins", function (proto, props) {
		proto.mixins = enyo.merge(proto.mixins, props.mixins);
	});
	//*@public
	enyo.MixinSupport = {
		name: "MixinSupport",
		/**
			Takes a single parameter a hash of properties to apply. To be considered
			a _mixin_ it must have a _name_ property that is unique but will apply even
			non-mixins to the kind instance.
		*/
		extend: function (props) {
			applyMixin(this, props);
		},
		/**
			Extend the _importProps_ method to ensure we can handle run-time additions
			of the _mixins_ properties since they can be added at any time, even by other
			_mixins_. This will only be executed against mixins applied after the kind
			has already been evaluated and is being initialized as an instance. However,
			if a _mixin_ applies more _mixins_ at runtime it will have no affect.
		*/
		importProps: enyo.super(function (sup) {
			return function (props) {
				if (props) { mixinsFeature(this, props); }
				sup.apply(this, arguments);
			};
		})
	};
}(enyo));
