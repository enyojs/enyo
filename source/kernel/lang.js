(function(){
	//* @protected
	enyo.global = this;

	//*@protected
	/**
		Used internally by the _enyo.uid()_ method to produce a runtime unique
		identifier.
	*/
	var uidCounter = 0;

	//*@public
	/**
		Returns a boolean value indicating whether a target is undefined.
	*/
	enyo.exists = function (target) {
		return (undefined !== target);
	};
	var exists = enyo.exists;

	//*@public
	/**
		Looks for last occurrence of a string _(needle)_ inside an array or string
		_(haystack)_. An IE8-safe fallback for the default _lastIndexOf()_ method.
	*/
	enyo.lastIndexOf = function (needle, haystack, index) {
		if (haystack.lastIndexOf) {
			return haystack.lastIndexOf(needle, index || haystack.length);
		}
		// in IE8 there is no lastIndexOf for arrays or strings but we
		// treat them slightly differently, this is written for minimal-
		// code as a slight tradeoff in performance but should rarely be
		// hit as it is
		var string = ("string" === typeof haystack);
		var rev = (string? haystack.split(""): haystack).reverse();
		var cap = rev.length-1;
		var len = haystack.length;
		var idx;
		// if it is a string we need to make it a string again for
		// the indexOf method
		if (string) {
			rev = rev.join("");
		}
		idx = enyo.indexOf(needle, rev, len - (index || len));
		// put the array back the way it was
		if (!string) {
			rev.reverse();
		}
		return -1 === idx? idx: (cap - idx);
	};
	var lastIndexOf = enyo.lastIndexOf;

	//*@protected
	/**
		Internally-used method to detect deferred kind constructors.
	*/
	var isDeferredConstructor = function(target) {
		return target && ("function" === typeof target) &&
			(target._FinalCtor || target._finishKindCreation);
	};

	//*@public
	/**
		A fast-path enabled global getter that takes a string path, which may be a
		full path (from context window/Enyo) or a relative path (to the execution
		context of the method). It knows how to check for and call the
		backwards-compatible generated getters, as well as how to handle computed
		properties. Returns _undefined_ if the object at the given path cannot be
		found. May safely be called on non-existent paths.
	*/
	enyo.getPath = function (path) {
		// in case nothing is passed or null, we return it to keep it from
		// failing the other cases
		if (path === undefined || null === path) { return path; }
		// in almost all cases when calling and enyo is the context global is
		// the intended scope
		var b = (this === enyo? enyo.global: this),
			// strip leading `.` without adding to the stack when possible
			p = (path[0] == "."? path.replace(/^\.+/, ""): path);
		// break setting variables and doing work because if stripping all "."
		// left us with nothing in the string then we just return the discovered scope object
		if (!p) { return b; }
		// simply split it on "." and try and run down the path without recursively
		// executing the getter
		var ps = p.split("."),
			// the final property
			pr = ps.pop(),
			// ultimately the value we intend to return
			v, fn;
		for (var i=0, r$; (r$=ps[i]); ++i) {
			// this will retrieve the requested element if it has a getter we call this
			// to account for computed properties, default getters are used when present
			b = (
					// these are carefully ordered in terms of likeliness to encounter thus
					// reducing the number of checks that need to be executed
					(b && b._isObject && (
						(b._getters && (fn = b._getters[r$]) && b[fn]()) ||
						(b.get && b.computed && b.computed[r$] && b[r$]()) || b[r$]
					)) || (("function" == typeof b && (b = enyo.checkConstructor(b)) && b[r$]) || b[r$])
				);
			if (!b) { break; }
		}
		// if the index isn't the same as the length of parts (including the 0 case)
		// then there was an error in the path and it couldn't be determined
		// so we return undefined
		if (i != ps.length) { return; }
		// otherwise we grab the final property from the base we now have, check if its a
		// deferred constructor, and return it
		v = b[pr];
		return (("function" == typeof v && enyo.checkConstructor(v)) || v);
	};

	//*@protected
	//* Simplified version of enyo.getPath used internally for get<Name> calls
	enyo.getPath.fast = function (path) {
		// the current context
		var b = this,
			// the final value to return
			fn, v;
		v = ((b._getters && (fn=b._getters[path]) && b[fn]()) || b[path]);
		return (("function" == typeof v && enyo.checkConstructor(v)) || v);
	};

	//*@public
	/**
		A global setter that takes a string path (relative to the method's
		execution context) or a full path (relative to window). Attempts
		to automatically retrieve any previously existing value to supply
		to any observers. If the context is an _enyo.Object_ or subkind,
		the _notifyObservers()_ method is used to notify listeners for the path's
		being set. If the previous value is equivalent to the newly set
		value, observers will not be triggered by default. If the third
		parameter is present and is an explicit boolean true, the observers
		will be triggered regardless. Returns the context from which the method was executed.
	*/
	enyo.setPath = function (path, value, force) {
		// in almost all cases when calling and enyo is the context global is
		// the intended scope
		var b = (this === enyo? enyo.global: this), c = b;
		// if the path is nothing, undefined or null, or an empty string even
		// we can't do anything so we return this
		if (!path) { return b; }
		// strip leading `.` without adding to the stack when possible
		var p = (path[0] == "."? path.replace(/^\.+/, ""): path);
		// if the string is empty then we won't process anything else either
		if (!p) { return b; }
		// simply split it on "." and try and run down the path without recursively
		// executing the getter
		var ps = p.split("."),
			// the final property
			pr = ps.pop(),
			// placeholder during iterations over the path,
			// the previous value and a helper variable in case we find a computed property
			tp, rv, fn;
		for (var i=0, r$; (r$=ps[i]); ++i) {
			// unfortunately it is possible to request the actual "enyo" object in
			// a path so we have to test for this case or bad things happen
			if (r$ == "enyo" && enyo === b) { continue; }
			// its actually pretty simple, check to see if the next requested context exists and is an object
			// or a function, if so, we use that and continue, otherwise we have to create it
			b = (
					((tp=b[r$]) && (
						// if its just an object, use it straight up
						(typeof tp == "object" && tp) ||
						(typeof tp == "function" && (
							// in the rare case that our path includes a computed property (as part of
							// chain -- this really is rare but not impossible) we use the getter to retrieve
							// it correctly
							(b._isObject && b.computed && b.computed[r$] && b.get(r$)) ||
							// ensure this isn't a constructor that needs to be undeferred
							(isDeferredConstructor(tp) && enyo.checkConstructor(tp)) || tp
						))
						// if it wasn't present we instantiate the path and use that object
					)) || (b[r$]={})
				);
		}
		// now we can attempt to retrieve a previous value if it can be done in as
		// efficient a manner as possible -- we will call an overloaded getter if necessary
		rv = ((b && b._isObject && b._getters && (fn=b._getters[pr]) && b[fn]()) || b[pr]);
		// now we set the new value, much simpler
		b[pr] = value;
		// only notify if the value has changed or if the update should be forced
		if (b.notifyObservers && rv !== value || force) { b.notifyObservers(pr, rv, value); }
		// return the original base reference we made in the first line
		return c;
	};

	//*@protected
	//* Simplified version of enyo.setPath used on set<Name> calls
	enyo.setPath.fast = function (path, value) {
		// the current context
		var b = this,
			// the previous value and helper variable
			rv, fn;
		// we have to check and ensure that we're not setting a computed property
		// and if we are, do nothing
		if (b.computed && b.computed[path]) { return b; }
		rv = ((b._getters && (fn=b._getters[path]) && b[fn]()) || b[path]);
		// set the new value now that we can
		b[path] = value;
		// this method is only ever called from the context of enyo objects
		// as a protected method
		if (rv !== value) { b.notifyObservers(path, rv, value); }
		// return the context
		return b;
	};

	//*@public
	/**
		Creates a unique identifier (with an optional prefix) and returns
		the identifier as a string.
	*/
	enyo.uid = function (prefix) {
		return String((prefix? prefix: "") + uidCounter++);
	};

	//* @public
	//* Returns a random integer between 0 and a specified upper boundary;
	//* i.e., 0 <= return value < _inBound_.
	//
	//      var randomLetter = String.fromCharCode(enyo.irand(26) + 97);
	//
	enyo.irand = function(inBound) {
		return Math.floor(Math.random() * inBound);
	};

	//* Returns _inString_ with the first letter capitalized.
	enyo.cap = function(inString) {
		return inString.slice(0, 1).toUpperCase() + inString.slice(1);
	};

	//* Returns _inString_ with the first letter lower-cased.
	enyo.uncap = function(inString) {
		return inString.slice(0, 1).toLowerCase() + inString.slice(1);
	};

	enyo.format = function(inVarArgs) {
		var pattern = /\%./g;
		var arg = 0, template = inVarArgs, args = arguments;
		var replacer = function(inCode) {
			return args[++arg];
		};
		return template.replace(pattern, replacer);
	};

	var toString = Object.prototype.toString;

	//* Returns true if the argument is a string.
	enyo.isString = function(it) {
		return toString.call(it) === "[object String]";
	};

	//* Returns true if the argument is a function.
	enyo.isFunction = function(it) {
		return toString.call(it) === "[object Function]";
	};

	//* Returns true if the argument is an array.
	enyo.isArray = Array.isArray || function(it) {
		return toString.call(it) === "[object Array]";
	};

	//* Returns true if the argument is an object.
	enyo.isObject = Object.isObject || function (it) {
		// explicit null/undefined check for IE8 compatibility
		return (it != null) && (toString.call(it) === "[object Object]");
	};

	//* Returns true if the argument is true.
	enyo.isTrue = function(it) {
		return !(it === "false" || it === false || it === 0 || it === null || it === undefined);
	};

	//*@public
	/**
		Returns the index of any entry in _array_ whose _callback_ returns
		a truthy value. Accepts an optional _context_ for the _callback_. Each
		_callback_ will receive three parameters, the _value_ at _index_, and an
		immutable copy of the original array. If no callback returns true, or
		_array_ is not an Array, this method returns false.
	*/
	enyo.find = function (array, callback, context) {
		var $source = enyo.isArray(array) && array;
		var $ctx = context || enyo.global;
		var $fn = callback;
		var idx = 0, len, $copy, ret;
		if ($source && $fn && enyo.isFunction($fn)) {
			$copy = enyo.clone($source);
			len = $source.length;
			for (; idx < len; ++idx) {
				ret = $fn.call($ctx, $source[idx], idx, $copy);
				if (!! ret) {
					return idx;
				}
			}
		}
		return false;
	};

	//* Returns the index of the element in _inArray_ that is equivalent
	//* (==) to _inElement_, or -1 if no such element is found.
	enyo.indexOf = function(inElement, inArray, fromIndex) {
		if (inArray.indexOf) {
			return inArray.indexOf(inElement, fromIndex);
		}

		if (fromIndex) {
			if (fromIndex < 0) {
				fromIndex = 0;
			}

			if (fromIndex > inArray.length) {
				return -1;
			}
		}

		for (var i=fromIndex || 0, l=inArray.length, e; (e=inArray[i]) || (i<l); i++) {
			if (e == inElement) {
				return i;
			}
		}
		return -1;
	};

	//* Removes the first element in the passed-in array that is equivalent
	//* (==) to _inElement_.
	enyo.remove = function(inElement, inArray) {
		var i = enyo.indexOf(inElement, inArray);
		if (i >= 0) {
			inArray.splice(i, 1);
		}
	};

	/**
		Invokes _inFunc_ on each element of _inArray_.
		If _inContext_ is specified, _inFunc_ is called with _inContext_ as _this_.
	*/
	enyo.forEach = function(inArray, inFunc, inContext) {
		if (inArray) {
			var c = inContext || this;
			if (enyo.isArray(inArray) && inArray.forEach) {
				inArray.forEach(inFunc, c);
			} else {
				var a = Object(inArray);
				var al = a.length >>> 0;
				for (var i = 0; i < al; i++) {
					if (i in a) {
						inFunc.call(c, a[i], i, a);
					}
				}
			}
		}
	};

	/**
		Invokes _inFunc_ on each element of _inArray_, and returns the results as an Array.
		If _inContext_ is specified, _inFunc_ is called with _inContext_ as _this_.
	*/
	enyo.map = function(inArray, inFunc, inContext) {
		var c = inContext || this;
		if (enyo.isArray(inArray) && inArray.map) {
			return inArray.map(inFunc, c);
		} else {
			var results = [];
			var add = function(e, i, a) {
				results.push(inFunc.call(c, e, i, a));
			};
			enyo.forEach(inArray, add, c);
			return results;
		}
	};

	//*@public
	/**
		Concatenates a variable number of arrays, removing any duplicate
		entries.
	*/
	enyo.merge = function (/* _arrays_ */) {
		var $m = Array.prototype.concat.apply([], arguments);
		var $s = [];
		for (var $i=0, v$; (v$=$m[$i]); ++$i) {
			if (!~enyo.indexOf(v$, $s)) {
				$s.push(v$);
			}
		}
		return $s;
	};
	var merge = enyo.merge;

	//*@public
	/**
		Returns an array of the values of all properties in an object.
	*/
	enyo.values = function (o) {
		if (o) {
			var $r = [];
			for (var $k in o) {
				if (o.hasOwnProperty($k)) {
					$r.push(o[$k]);
				}
			}
			return $r;
		}
	};

	//*@public
	/**
		Takes a variable number of arrays and returns an array of
		values that are unique across all of the arrays. Note that
		this is not a particularly cheap method and should never be
		called recursively.

		TODO: test in IE8
		TODO: figure out why the one-hit reversal wasn't working
	*/
	enyo.union = function (/* _arrays_ */) {
		// create one large array of all of the arrays passed to
		// the method for comparison
		var values = Array.prototype.concat.apply([], arguments);
		// the array of seen values
		var seen = [];
		// the array of values actually to be returned
		var ret = [];
		var idx = 0;
		var len = values.length;
		var value;
		for (; idx < len; ++idx) {
			value = values[idx];
			// if we haven't seen this value before go ahead and
			// push it to the seen array
			if (!~enyo.indexOf(value, seen)) {
				seen.push(value);
				// here we check against the entirety of any other values
				// in the values array starting from the end
				if (idx === lastIndexOf(value, values)) {
					// if this turned out to be true then it is a unique entry
					// so go ahead and push it to our union array
					ret.push(value);
				}
			}
		}
		// we should have a flattened/unique array now, return it
		return ret;
	};
	var union = enyo.union;
	//*@public
	/**
		Returns the unique values found in one or more arrays.
	*/
	enyo.unique = union;
	var unique = enyo.unique;

	//*@public
	/**
		Reduces one or more arrays, removing any duplicate entries
		across them.
	*/
	enyo.reduce = merge;

	//*@public
	/**
		Convenience method that takes an array of properties and an object
		as parameters. Returns a new object with just those properties named
		in the array that are found to exist on the base object. If the third
		parameter is true, falsy values will be ignored.
	*/
	enyo.only = function (properties, object, ignore) {
		var ret = {};
		var idx = 0;
		var len;
		var property;
		// sanity check the properties array
		if (!exists(properties) || !(properties instanceof Array)) {
			return ret;
		}
		// sanity check the object
		if (!exists(object) || "object" !== typeof object) {
			return ret;
		}
		// reduce the properties array to just unique entries
		properties = unique(properties);
		// iterate over the properties given and if the property exists on
		// the object copy its value to the return array
		for (len = properties.length; idx < len; ++idx) {
			property = properties[idx];
			if (property in object) {
				if (true === ignore && !object[property]) {
					continue;
				}
				ret[property] = object[property];
			}
		}
		// return the array of values we found for the given properties
		return ret;
	};

	//*@public
	/**
		Convenience method that takes two objects as parameters. For each key
		from the first object, if the key also exists in the second object, a
		mapping of the key from the first object to the key from the second
		object is added to a result object, which is eventually returned. In
		other words, the returned object maps the named properties of the
		first object to the named properties of the second object. The optional
		third parameter is a boolean designating whether to pass unknown key/value
		pairs through to the new object. If true, those keys will exist on the
		returned object.
	*/
	enyo.remap = function (map, obj, pass) {
		var $key, $val, $ret = pass? enyo.clone(obj): {};
		for ($key in map) {
			$val = map[$key];
			if ($key in obj) {
				$ret[$val] = obj.get? obj.get($key): obj[$key];
			}
		}
		return $ret;
	};

	//*@public
	/**
		Convenience method that takes an array of properties and an object
		as parameters. Returns a new object with all of the keys in the
		object except those specified in the _properties_ array. The values
		are shallow copies.
	*/
	enyo.except = function (properties, object) {
		// the new object to return with just the requested keys
		var ret = {};
		var keep;
		var idx = 0;
		var len;
		var key;
		// sanity check the properties array
		if (!exists(properties) || !(properties instanceof Array)) {
			return ret;
		}
		// sanity check the object
		if (!exists(object) || "object" !== typeof object) {
			return ret;
		}
		// we want to only use the union of the properties and the
		// available keys on the object
		keep = union(properties, keys(object));
		// for every property in the keep array now copy that to the new
		// hash
		for (len = keep.length; idx < len; ++idx) {
			key = keep[idx];
			// if the key was specified in the properties array but does not
			// exist in the object ignore it
			if (!(key in object)) {
				continue;
			}
			ret[key] = object[key];
		}
		// return the new hash
		return ret;
	};

	//*@public
	/**
		Helper method that accepts an array of objects and returns
		a hash of those objects indexed by the specified property. If a filter
		is provided, it should accept four parameters: the key, the value
		(object), the current mutable map reference, and an immutable
		copy of the original array of objects for comparison.
	*/
	enyo.indexBy = function (property, array, filter) {
		// the return value - indexed map from the given array
		var map = {};
		var value;
		var len;
		var idx = 0;
		// sanity check for the array with an efficient native array check
		if (!exists(array) || !(array instanceof Array)) {
			return map;
		}
		// sanity check the property as a string
		if (!exists(property) || "string" !== typeof property) {
			return map;
		}
		// the immutable copy of the array
		var copy = enyo.clone(array);
		// test to see if filter actually exsits
		filter = exists(filter) && "function" === typeof filter? filter: undefined;
		for (len = array.length; idx < len; ++idx) {
			// grab the value from the array
			value = array[idx];
			// make sure that it exists and has the requested property at all
			if (exists(value) && exists(value[property])) {
				if (filter) {
					// if there was a filter use it - it is responsible for
					// updating the map accordingly
					filter(property, value, map, copy);
				} else {
					// use the default behavior - check to see if the key
					// already exists on the map it will be overwritten
					map[value[property]] = value;
				}
			}
		}
		// go ahead and return our modified map
		return map;
	};

	//*@public
	/**
		Expects as parameters a string, _property_, and an array of objects
		that may have the named property. Returns an array of all the values
		of the named property in the objects in the array.
	*/
	enyo.pluck = function (property, array) {
		var ret = [];
		var idx = 0;
		var len;
		// if we don't have a property to look for or an array of
		// objects to search through we have to return an empty array
		if (!(exists(property) && exists(array))) {
			return ret;
		}
		// if it isn't actually an array, return an empty array
		if (!(array instanceof Array)) {
			return ret;
		}
		// if property isn't a string, then return an empty array
		if ("string" !== typeof property) {
			return ret;
		}
		// now that sanity is established to some extent, let's get
		// to work
		for (len = array.length; idx < len; ++idx) {
			// if the object in the array is actually undefined, skip
			if (!exists(array[idx])) {
				continue;
			}
			// if it was found, then check to see if the property
			// exists on it
			if (exists(array[idx][property])) {
				ret.push(array[idx][property]);
			}
		}
		// return whatever we found, if anything
		return ret;
	};

	/**
		Creates a new array with all elements of _inArray_ that pass the test
		defined by _inFunc_. If _inContext_ is specified, _inFunc_ is called
		with _inContext_ as _this_.
	*/
	enyo.filter = function(inArray, inFunc, inContext) {
		var c = inContext || this;
		if (enyo.isArray(inArray) && inArray.filter) {
			return inArray.filter(inFunc, c);
		} else {
			var results = [];
			var f = function(e, i, a) {
				var eo = e;
				if (inFunc.call(c, e, i, a)) {
					results.push(eo);
				}
			};
			enyo.forEach(inArray, f, c);
			return results;
		}
	};

	/**
		Returns an array of all own enumerable properties found on _inObject_.
	*/
	enyo.keys = Object.keys || function(inObject) {
		var results = [];
		var hop = Object.prototype.hasOwnProperty;
		for (var prop in inObject) {
			if (hop.call(inObject, prop)) {
				results.push(prop);
			}
		}
		// *sigh* IE 8
		if (!({toString: null}).propertyIsEnumerable("toString")) {
			var dontEnums = [
				'toString',
				'toLocaleString',
				'valueOf',
				'hasOwnProperty',
				'isPrototypeOf',
				'propertyIsEnumerable',
				'constructor'
			];
			for (var i = 0, p; (p = dontEnums[i]); i++) {
				if (hop.call(inObject, p)) {
					results.push(p);
				}
			}
		}
		return results;
	};
	var keys = enyo.keys;

	/**
		Clones an existing Array, or converts an array-like object into an Array.

		If _inOffset_ is non-zero, the cloning starts from that index in the source Array.
		The clone may be appended to an existing Array by passing the existing Array as _inStartWith_.

		Array-like objects have _length_ properties, and support square-bracket notation ([]).
		Often, array-like objects do not support Array methods, such as _push_ or _concat_, and
		so must be converted to Arrays before use.

		The special _arguments_ variable is an example of an array-like object.
	*/
	enyo.cloneArray = function(inArrayLike, inOffset, inStartWith) {
		var arr = inStartWith || [];
		for(var i = inOffset || 0, l = inArrayLike.length; i<l; i++){
			arr.push(inArrayLike[i]);
		}
		return arr;
	};
	enyo.toArray = enyo.cloneArray;

	/**
		Shallow-clones an object or an array.
	*/
	enyo.clone = function(obj) {
		return enyo.isArray(obj) ? enyo.cloneArray(obj) : enyo.mixin({}, obj);
	};

	//* @protected
	var empty = {};

	//* @public
	/**
		Will take a variety of options to ultimately mix a set of properties
		from objects into single object. All configurations accept a boolean as
		the final parameter to indicate whether or not to ignore _truthy_/_existing_
		values on any _objects_ prior.

		If _target_ exists and is an object, it will be the base for all properties
		and the returned value. If the parameter is used but is _falsy_, a new
		object will be created and returned. If no such parameter exists, the first
		parameter must be an array of objects and a new object will be created as
		the _target_.

		The _source_ parameter may be an object or an array of objects. If no
		_target_ parameter is provided, _source_ must be an array of objects.

		The _options_ parameter allows you to set the _ignore_ and/or _exists_ flags
		such that if _ignore_ is true, it will not override any truthy values in the
		target, and if _exists_ is true, it will only use truthy values from any of
		the sources. You may optionally add a _filter_ method-option that returns a
		true or false value to indicate whether the value should be used. It receives
		parameters in this order: _property_, _source value_, _source values_,
		_target_, _options_. Note that modifying the target in the filter method can
		have unexpected results.

		Setting _options_ to true will set all options to true.
	*/
	enyo.mixin = function(target, source, options) {
		// the return object/target
		var t;
		// the source or sources to use
		var s;
		var o, i, n, s$;
		if (enyo.isArray(target)) {
			t = {};
			s = target;
			if (source && enyo.isObject(source)) {
				o = source;
			}
		} else {
			t = target || {};
			s = source;
			o = options;
		}
		if (!enyo.isObject(o)) {
			o = {};
		}
		if (true === options) {
			o.ignore = true;
			o.exists = true;
		}
		// here we handle the array of sources
		if (enyo.isArray(s)) {
			for (i=0; (s$=s[i]); ++i) {
				enyo.mixin(t, s$, o);
			}
		} else {
		// otherwise we execute singularly
			for (n in s) {
				s$ = s[n];
				if (empty[n] !== s$) {
					if ((!o.exists || s$) && (!o.ignore || !t[n]) && (o.filter && enyo.isFunction(o.filter)? o.filter(n, s$, s, t, o): true)) {
						t[n] = s$;
					}
				}
			}
		}
		return t;
	};

	//* @public
	/**
		Returns a function closure that will call (and return the value of)
		function _method_, with _scope_ as _this_.

		_method_ may be a function or the string name of a function-valued
		property on _scope_.

		Arguments to the closure are passed into the bound function.

			// a function that binds this to this.foo
			var fn = enyo.bind(this, "foo");
			// the value of this.foo(3)
			var value = fn(3);

		Optionally, any number of arguments may be prefixed to the bound function.

			// a function that binds this to this.bar, with arguments ("hello", 42)
			var fn = enyo.bind(this, "bar", "hello", 42);
			// the value of this.bar("hello", 42, "goodbye");
			var value = fn("goodbye");

		Functions may be bound to any scope.

			// binds function 'bar' to scope 'foo'
			var fn = enyo.bind(foo, bar);
			// the value of bar.call(foo);
			var value = fn();
	*/
	enyo.bind = function(scope, method/*, bound arguments*/){
		if (!method) {
			method = scope;
			scope = null;
		}
		scope = scope || enyo.global;
		if (enyo.isString(method)) {
			if (scope[method]) {
				method = scope[method];
			} else {
				throw('enyo.bind: scope["' + method + '"] is null (scope="' + scope + '")');
			}
		}
		if (enyo.isFunction(method)) {
			var args = enyo.cloneArray(arguments, 2);
			if (method.bind) {
				return method.bind.apply(method, [scope].concat(args));
			} else {
				return function() {
					var nargs = enyo.cloneArray(arguments);
					// invoke with collected args
					return method.apply(scope, args.concat(nargs));
				};
			}
		} else {
			throw('enyo.bind: scope["' + method + '"] is not a function (scope="' + scope + '")');
		}
	};

	//*@public
	/**
		Binds a callback to a scope.  If the object has a "destroyed" property that's truthy,
		then the callback will not be run if called.  This can be used to implement both
		enyo.Object.bindSafely and for enyo.Object-like objects like enyo.Model and enyo.Collection.
	*/
	enyo.bindSafely = function(scope, method/*, bound arguments*/) {
		if (enyo.isString(method)) {
			if (scope[method]) {
				method = scope[method];
			} else {
				throw('enyo.bindSafely: scope["' + method + '"] is null (this="' + this + '")');
			}
		}
		if (enyo.isFunction(method)) {
			var args = enyo.cloneArray(arguments, 2);
			return function() {
				if (scope.destroyed) {
					return;
				}
				var nargs = enyo.cloneArray(arguments);
				return method.apply(scope, args.concat(nargs));
			};
		} else {
			throw('enyo.bindSafely: scope["' + method + '"] is not a function (this="' + this + '")');
		}
	};


	/**
		Calls method _inMethod_ on _inScope_ asynchronously.

		Uses _window.setTimeout_ with minimum delay, usually around 10ms.

		Additional arguments are passed to _inMethod_ when it is invoked.
	*/
	enyo.asyncMethod = function(inScope, inMethod/*, inArgs*/) {
		return setTimeout(enyo.bind.apply(enyo, arguments), 1);
	};

	/**
		Calls named method _inMethod_ (String) on _inObject_ with optional
		arguments _inArguments_ (Array), if the object and method exist.

			enyo.call(myWorkObject, "doWork", [3, "foo"]);
	*/
	enyo.call = function(inObject, inMethod, inArguments) {
		var context = inObject || this;
		if (inMethod) {
			var fn = context[inMethod] || inMethod;
			if (fn && fn.apply) {
				return fn.apply(context, inArguments || []);
			}
		}
	};

	/**
		Returns the current time.

		The returned value is equivalent to _new Date().getTime()_.
	*/
	enyo.now = Date.now || function() {
		return new Date().getTime();
	};

	//* @protected

	enyo.nop = function(){};
	enyo.nob = {};
	enyo.nar = [];

	// this name is reported in inspectors as the type of objects created via delegate,
	// otherwise we would just use enyo.nop
	enyo.instance = function() {};

	// some platforms need alternative syntax (e.g., when compiled as a v8 builtin)
	if (!enyo.setPrototype) {
		enyo.setPrototype = function(ctor, proto) {
			ctor.prototype = proto;
		};
	}

	// boodman/crockford delegation w/cornford optimization
	enyo.delegate = function(proto) {
		enyo.setPrototype(enyo.instance, proto);
		return new enyo.instance();
	};

	//* @public
	/**
		Takes a string and trims leading and trailing spaces. If the string
		has no length, is not a string, or is a falsy value, it will be returned
		without modification.
	*/
	enyo.trim = function (str) {
		return str && str.replace? (str.replace(/^\s+|\s+$/g, "")): str;
	};

	// use built-in .trim when available in JS runtime
	if (String.prototype.trim) {
		enyo.trim = function(str) {
			return str && str.trim? str.trim() : str;
		};
	}

	//*@public
	/**
		Efficient _uuid_ generator according to RFC4122 for the browser.
	*/
	enyo.uuid = function () {
		// TODO: believe this can be even faster...
		var t, p = (
			(Math.random().toString(16).substr(2,8)) + "-" +
			((t=Math.random().toString(16).substr(2,8)).substr(0,4)) + "-" +
			(t.substr(4,4)) +
			((t=Math.random().toString(16).substr(2,8)).substr(0,4)) + "-" +
			(t.substr(4,4)) +
			(Math.random().toString(16).substr(2,8))
		);
		return p;
	};

})();
