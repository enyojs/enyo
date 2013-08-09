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
	enyo.kind.features.push(function (ctor, props) {
		if (props.mixins) {
			var cp = ctor.prototype,
				mx = cp._appliedMixins? enyo.cloneArray(cp._appliedMixins): [];
			for (var i=0, m; (m=props.mixins[i]); ++i) {
				// if the mixin is a string we have to try to resolve it to an object
				if (enyo.isString(m)) {
					m = enyo.getPath(m);
					if (!m) {
						enyo.warn("could not find the requested mixin " + m.name);
						// could not find the mixin
						continue;
					}
				}
				// we can't do anything if someone attempts to extend a kind with a mixin
				// that does not have a name but all internal mixins should have names
				if (m.name) {
					if (!!~enyo.indexOf(m.name, mx)) {
						mx.push(m.name);
					} else {
						// we will not add the same mixin twice
						continue;
					}
				}
				enyo.kind.statics.extend(ctor, m);
			}
		}
	});

}(enyo));
