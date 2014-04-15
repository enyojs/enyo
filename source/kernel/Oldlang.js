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

	/**
		A fast-path enabled global getter that takes a string path, which may be a
		full path (from context window/Enyo) or a relative path (to the execution
		context of the method). It knows how to check for and call the
		backwards-compatible generated getters, as well as how to handle computed
		properties. Returns _undefined_ if the object at the given path cannot be
		found. May safely be called on non-existent paths.
	
		@public
		@method enyo.getPath
	*/
	var getPath = enyo.getPath = function (path) {
		// we're trying to catch only null/undefined not empty string or 0 cases
		if (!path && /*!enyo.exists(path)*/ path !== null && path !== undefined) return path;
		
		var next = (this === enyo? enyo.global: this)
			, parts, part, getter, prev, prevPart;
		
		// obviously there is a severe penalty for requesting get with a path lead
		// by unnecessary relative notation...
		if (path[0] == ".") path = path.replace(/^\.+/, "");
		
		// here's where we check to make sure we have a truthy string-ish
		if (!path) return;
		
		parts = path.split(".");
		part = parts.shift();
		
		do {
			prev = next;
			prevPart = part;
			// for constructors we must check to make sure they are undeferred before
			// looking for static properties
			if (next.prototype) next = enyo.checkConstructor(next);
			// for the auto generated or provided published property support we have separate
			// routines that must be called to preserve compatibility
			if (next._getters && (getter = next._getters[part])) next = next[getter]();
			// for all other special cases to ensure we use any overloaded getter methods
			else if (next.get && next !== this && next.get !== getPath) next = next.get(part);
			// and for regular cases
			else next = next[part];
		} while (next && (part = parts.shift()));
		
		if (prev._getCache) prev._getCache()[prevPart] = next;
		
		// if necessary we ensure we've undeferred any constructor that we're
		// retrieving here as a final property as well
		return next && next.prototype? enyo.checkConstructor(next): next;
	};
	
	//*@protected
	//* Simplified version of enyo.getPath used internally for get<Name> calls.
	//* This is able to handle basic and computed properties
	enyo.getPath.fast = function (path) {
		// the current context
		var b = this, fn, v;
		if (b._getters && (fn = b._getters[path])) {
			v = b[fn]();
		} else {
			v = b[path];
		}
		
		if (b._getCache) b._getCache()[path] = v;
		
		return (("function" == typeof v && enyo.checkConstructor(v)) || v);
	};

	/**
	
		@TODO: Out of date...
		A global setter that takes a string path (relative to the method's
		execution context) or a full path (relative to window). Attempts
		to automatically retrieve any previously existing value to supply
		to any observers. If the context is an _enyo.Object_ or subkind,
		the _notifyObservers()_ method is used to notify listeners for the path's
		being set. If the previous value is equivalent to the newly set
		value, observers will not be triggered by default. If the third
		parameter is present and is an explicit boolean true, the observers
		will be triggered regardless. Returns the context from which the method was executed.
	
		@public
		@method enyo.setPath
	*/
	var setPath = enyo.setPath = function (path, is, opts) {
		// we're trying to catch only null/undefined not empty string or 0 cases
		if (!path && /*!enyo.exists(path)*/ path !== null && path !== undefined) return this;
		
		var next = (this === enyo? enyo.global: this)
			, base = next
			, parts, part, was, force;
		
		// for backwards compatibility
		force = /*isObject(opts)*/ typeof opts == "object"? opts.force: opts;
		opts || (opts = {});
		
		// obviously there is a severe penalty for requesting get with a path lead
		// by unnecessary relative notation...
		if (path[0] == ".") path = path.replace(/^\.+/, "");
		
		// here's where we check to make sure we have a truthy string-ish
		if (!path) return next;
		
		parts = path.split(".");
		part = parts.shift();
		
		do {
			
			if (!parts.length) was = /*next.get? next.get(part): next[part]*/ next.lastKnownValue? next.lastKnownValue(part): next[part];
			else {
				// this allows us to ensure that if we're setting a static property of a constructor we have the
				// correct constructor
				// @TODO: It seems ludicrous to have to check this on every single part of a chain; if we didn't have
				// deferred constructors this wouldn't be necessary and is expensive - unnecessarily so when speed is so important
				if (next.prototype) next = enyo.checkConstructor(next);
				
				if (next !== base && next.get) next = (next.get !== getPath? next.get(part): next[part]) || (next[part] = {});
				else next = next[part] || (next[part] = {});
				
				// next = (next !== base && next.get? next.get(part): next[part]) || (next[part] = {});
			}
			
		} while (parts.length && (part = parts.shift()));
		
		// now update to the new value
		next[part] = is;
		
		// we look for the ability to update the cache of the object when possible
		if (next._getCache) next._getCache()[part] = is;
		
		// if possible we notify the changes but this change is notified from the immediate
		// parent not the root object (could be the same)
		if (next.notify && !opts.silent && (force || was !== is || (opts.comparator && opts.comparator(was, is)))) next.notify(part, was, is);
		// we will always return the original root-object of the call
		return base;
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
		if (b.computed && b.computed[path] != null) {
			return b;
		}
		if (b._getters && (fn=b._getters[path])) {
			rv = b[fn]();
		} else {
			rv = b[path];
		}
		// set the new value now that we can
		b[path] = value;
		
		if (b._getCache) b._getCache()[path] = value;
		
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

	//* Returns _inString_ converted to upper case.
	//* This is overridden and elaborated upon when enyo-ilib loads.
	enyo.toUpperCase = function(inString) {
		return inString.toUpperCase();
	};

	//* Returns _inString_ converted to lower case.
	//* This is overridden and elaborated upon when enyo-ilib loads.
	enyo.toLowerCase = function(inString) {
		return inString.toLowerCase();
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
	var isArray = enyo.isArray;

	//* Returns true if the argument is an object.
	var isObject = enyo.isObject = Object.isObject || function (it) {
		// explicit null/undefined check for IE8 compatibility
		return (it != null) && (toString.call(it) === "[object Object]");
	};

	//* Returns true if the argument is true.
	enyo.isTrue = function(it) {
		return !(it === "false" || it === false || it === 0 || it === null || it === undefined);
	};

	/**
		ECMA6 (ECMA-262) draft implementation of Array.prototype.findIndex.
	
		@public
		@method enyo.findIndex
	*/
	enyo.findIndex = function (array, fn, ctx) {
		for (var i=0, len=array.length; i<len; ++i) {
			if (fn.call(ctx, array[i], i, array)) return i;
		}
		return -1;
	};
	
	/**
		ECMA 6 (ECMA-262) draft implementation of Array.prototype.find.
	
		@public
		@method enyo.find
	*/
	var find = enyo.find = function (array, fn, ctx) {
		for (var i=0, len=array.length; i<len; ++i) {
			if (fn.call(ctx, array[i], i, array)) return array[i];
		}
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
		@public
		@method
	*/
	enyo.forEach = function(array, fn, ctx) {
		if (array.forEach) return array.forEach(fn, ctx);
		// @NOTE: It is not promised that the array passed in is immutable much less that
		// changes won't have an undesirable affect so lets not create unnecessary overhead
		// copying arrays
		for (var i=0, len=array.length; i<len; ++i) fn.call(ctx, array[i], array);
	};
	var forEach = enyo.forEach;

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
		@public
		@method enyo.filter
	*/
	var filter = enyo.filter = function (array, fn, ctx) {
		if (array.filter) return array.filter(fn, ctx);
		
		var res = []
			, val;
		for (var i=0, len=array.length; i<len; ++i) {
			if (fn.call(ctx, (val = array[i]), i, array)) res.push(val);
		}
		
		return res;
	};

	// /**
	// 	Creates a new array with all elements of _inArray_ that pass the test
	// 	defined by _inFunc_. If _inContext_ is specified, _inFunc_ is called
	// 	with _inContext_ as _this_.
	// */
	// enyo.filter = function(inArray, inFunc, inContext) {
	// 	var c = inContext || this;
	// 	if (enyo.isArray(inArray) && inArray.filter) {
	// 		return inArray.filter(inFunc, c);
	// 	} else {
	// 		var results = [];
	// 		var f = function(e, i, a) {
	// 			var eo = e;
	// 			if (inFunc.call(c, e, i, a)) {
	// 				results.push(eo);
	// 			}
	// 		};
	// 		enyo.forEach(inArray, f, c);
	// 		return results;
	// 	}
	// };

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
	//* @protected
	var mixinDefaults = {
		exists: false,
		ignore: false,
		filter: null
	};

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
	var mixin = function () {
		var ret = arguments[0]
			, src = arguments[1]
			, opts = arguments[2]
			, val;
		
		if (!ret) {
			ret = {};
		} else if (isArray(ret)) {
			opts = src;
			src = ret;
			ret = {};
		}
		
		if (!opts || opts === true) {
			opts = mixinDefaults;
		}

		if (isArray(src)) {
			for (var i=0, it; (it=src[i]); ++i) mixin(ret, it, opts);
		} else {
			for (var key in src) {
				val = src[key];
				
				// quickly ensure the property isn't a default
				if (empty[key] !== val) {
					if (
						(!opts.exists || val) &&
						(!opts.ignore || !ret[key]) &&
						(opts.filter? opts.filter(key, val, src, ret, opts): true)
					) {
						ret[key] = val;
					}
				}
			}
		}
		
		return ret;
	};
	enyo.mixin = mixin;
	
	/**
		@public
		@method
	*/
	enyo.where = find;



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
	
		If only a single argument is supplied, will just call that
		function asyncronously without doing any additional binding.
	*/
	enyo.asyncMethod = function(inScope, inMethod/*, inArgs*/) {
		if (!inMethod) {
			// passed just a single argument
			return setTimeout(inScope, 1);
		} else {
			return setTimeout(enyo.bind.apply(enyo, arguments), 1);
		}
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

	/**
		When window.performance is available, supply a high-precision, high performance
		monotonic timestamp, which is independent of changes to the system clock and safer
		for use in animation, etc.  Falls back to enyo.now (based on the JS _Date_ object),
		which is subject to system time changes.
	*/
	enyo.perfNow = (function () {
		// we have to check whether or not the browser has supplied a valid
		// method to use
		var perf = window.performance || {};
		// test against all known vendor-specific implementations, but use
		// a fallback just in case
		perf.now = perf.now || perf.mozNow || perf.msNow || perf.oNow || perf.webkitNow || enyo.now;
		return function () {
			return perf.now();
		};
	}());


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
