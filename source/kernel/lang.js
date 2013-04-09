(function(){
	//* @protected
	enyo.global = this;

	//*@protected
	/**
		Used internally by the enyo.uid method to be able to produce
		a runtime unique identifier.
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
		_(haystack)_. An IE8-safe fallback for the default _lastIndexOf_ method.
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
		Internally-used method to strip leading '.' from string paths.
	*/
	var preparePath = function (path) {
		var idx = 0;
		while ("." === path[idx]) {
			++idx;
		}
		if (0 !== idx) {
			path = path.slice(idx);
		}
		return path;
	};

	//*@protected
	/**
		Internally-used method to detect if the given value exists,
		is a function and an overloaded getter. Returns true if these
		tests are successful; false otherwise.
	*/
	var isOverloaded = function (target) {
		return target && "function" === typeof target && true === target.overloaded;
	};

	//*@public
	/**
		A fast-path enabled global getter that takes a string path that
		can be a full path (from context window/Enyo) or a relative path
		(to the execution context of the method). It knows how to check for
		and call the backwards-compatible generated getters as well as
		handle computed properties. Performs an optimized recursive search.
		Returns undefined if the object at the given path can not be
		found. Can safely be called on non-existent paths.
	*/
	enyo.getPath = function (path) {
		// if we don't have a path we can't do anything
		if (!exists(path) || null === path) {
			return undefined;
		}
		var idx = 0;
		var val;
		var part;
		var fn;
		var recursing = (true === arguments[1]) || ("object" === typeof path && path.recursing)? true: false;
		// on rare occasions this method would be called under the context
		// of enyo itself, the problem is detecting when this is intended since
		// under normal circumstances a general call would assume a window
		// context - here we see the _recursing_ parameter taking a double
		// meaning as enyo should _never be used as a reference on another object_
		// and as long as that is true this will never fail
		var cur = this === enyo && true !== recursing? window: this;
		// if we were recursing then we reassign path to the string part of the
		// object/parameter passed in
		if ("object" === typeof path) {
			if (path.path && "string" === typeof path.path) {
				path = path.path;
			}
			// otherwise it was an invalid request
			else {
				return undefined;
			}
		}
		// clear any leading periods
		path = preparePath(path);
		// find the initial period if any
		idx = path.indexOf(".");

		// if there isn't any try and find the path relative to our
		// current context, this is the fast path
		if (-1 === idx) {
			// figure out what our default/backwards-compatible getter
			// function would be
			fn = "get" + enyo.cap(path);
			// if that path exists relative to our context check to see
			// if it is an overloaded getter and call that if it is otherwise
			// just grab that path knowing if we get undefined that is ok
			val = isOverloaded(cur[fn])? cur[fn].call(this): cur[path];
		} else {
			// begin our recursive search
			part = path.substring(0, idx);
			path = path.slice(idx+1);

			if (typeof cur[part] in {"object":"","function":""}) {
				if (cur[part]._is_object) {
					return cur[part].get(path);
				} else {
					val = enyo.getPath.call(cur[part], {path: path, recursing: true});
				}
			}
		}

		// otherwise we've reached the end so return whatever we have
		return val;
	};

	//*@protected
	/**
		An internally-used method to proxy functions (similar to but not exactly
		the same as enyo.bind) such that they will be called under the correct context
		but with a reference to the correct arguments at the time they are called.
		Accepts two parameters--the function to be called and the context under
		which to call it.
	*/
	enyo.proxyMethod = function (fn, context) {
		delete fn._inherited;
		return function () {
			return fn.apply(context || this, arguments);
		};
	};

	//*@public
	/**
		A global setter that takes a string path (relative to the method's
		execution context) or a full path (relative to window). Attempts
		to automatically retrieve any previously existing value to supply
		to any observers. If the context is an _enyo.Object_ or subkind,
		the _notifyObservers_ method is used to notify listeners for the path's
		being set. If the previous value is the equivalent of the newly set
		value, observers will not be triggered by default. If the third
		parameter is present and is an explicit boolean true, it triggers
		the observers regardless. Optionally, the third parameter may be a
		function comparator that accepts two parameters and is expected to
		return a truthy-falsy value indicating whether or not the notifications
		will be fired. Returns the context from which the method was executed.
		Unlike its getter counterpart, this is not a recursive method.
	*/
	enyo.setPath = function (path, value, force) {
		// if there are less than 2 parameters we can't do anything
		if(!exists(path) || "string" !== typeof path || path.length === 0) {
			return this;
		}
		var cur = enyo === this? enyo.global: this;
		var idx;
		var target;
		var parts;
		var notify = true === force? true: false;
		var comparator = "function" === typeof force? force: undefined;
		// attempt to retrieve the previous value if it exists
		var prev = enyo.getPath.call(cur, path);
		// clear any leading periods
		path = preparePath(path);
		// find the inital index of any period in the path
		idx = path.indexOf(".");
		// if there wasn't one we can attempt to fast-path this setter
		if (-1 === idx) {
			// otherwise we just plain overwrite the method, this is the
			// expected behavior
			cur[path] = value;
		} else {
			// we have to walk the path until we find the end
			parts = path.split(".");
			// while we have any other parts to inspect
			while (parts.length) {
				target = parts.shift();
				// the rare case where the path could specify enyo
				// and is executed under the context of enyo
				if ("enyo" === target && enyo === cur) {
					continue;
				}
				// if this is the last piece we test to see if it is a computed
				// property and if it is we call it with the new value
				// as in the fast path
				if (0 === parts.length) {
					// otherwise we overwrite it just like in the fast-path
					cur[target] = value;
				} else {
					// we update our current reference context and if it does
					// not exist at the requested path it will be created
					if (!(typeof cur[target] in {"object":"","function":""})) {
						cur[target] = {};
					}
					if (true === cur[target]._is_object) {
						return cur[target].set(parts.join("."), value);
					}
					cur = cur[target];
				}
			}
		}
		// now we need to determine if we are going to issue notifications
		// first check to see if notify is already forced true
		if (true !== notify) {
			// now check to see if we have a comparator and if so use it
			// to determine if we're going to trigger observers
			if (comparator) {
				notify = comparator(prev, value);
			} else {
				// do the default which is to test the previous value
				// versus the new value
				notify = (prev !== value);
			}
		}
		if (true === notify) {
			if (cur.notifyObservers) {
				cur.notifyObservers(path, prev, value);
			}
		}
		// return the callee
		return cur;
	};

	//*@protected
	/**
		Called by instances of _enyo.Object_ in their own context via their
		local version of this method. Attempts to find the given property of
		the current context and instance the property if it is not already an
		instance. If it is a string, the method attempts to find the
		constructor for the named kind or the instance at the given path.
		When complete, it calls the callback method, passing it two
		parameters--the constructor (if it was found) and the instance (if it
		could be determined).
	*/
	enyo.findAndInstance = function (property, fn, context) {
		var Ctor;
		var inst;
		var path;
		fn = exists(fn) && "function" === typeof fn? fn: enyo.nop;
		// attempt to find the string path identifier on the kind
		// definition if possible
		path = enyo.getPath.call(this, property);
		// if there is nothing at the given property fast-path out
		// and return undefined everything
		if (!path) {
			return fn.call(context || this);
		}
		// if the path is a string (as in most cases) go ahead and
		// attempt to get the kind definition or instance at the
		// given path
		if ("string" === typeof path) {
			// we can fast-track this for relative paths that explicitly state
			// it is relative with a "." prefix, otherwise we have to guess
			Ctor = "." === path[0]? enyo.getPath.call(this, path):
				enyo.getPath(path) || enyo.getPath.call(this, path);
			// if it isn't a function we assume it is an instance
			if (exists(Ctor) && "function" !== typeof Ctor) {
				inst = Ctor;
				Ctor = undefined;
			}
		} else if ("function" === typeof path) {
			// instead of a string we were handed a constructor
			// so reassign that
			Ctor = path;
		} else {
			// the assumption here is that we were handed an
			// instance of the given object
			inst = path;
		}
		// if we have a constructor and no instance we need to
		// create an instance of the obejct
		if (exists(Ctor) && !exists(inst)) {
			inst = new Ctor();
		}
		// if we do have an instance assign it to the base object
		if (exists(inst)) {
			this[property] = inst;
		}
		// now use the calback and pass it the correct parameters
		return fn.call(context || this, Ctor, inst);
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
	//		var randomLetter = String.fromCharCode(enyo.irand(26) + 97);
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

	//* Returns true if the argument is true.
	enyo.isTrue = function(it) {
		return !(it === "false" || it === false || it === 0 || it === null || it === undefined);
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
		var merger = Array.prototype.concat.apply([], arguments);
		return unique(merger);
	};
	var merge = enyo.merge;

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
		first object to the named properties of the second object.
	*/
	enyo.remap = function (map, obj) {
		var ret = {};
		var key;
		var val;
		for (key in map) {
			val = map[key];
			if (key in obj) {
				ret[val] = obj[key];
			}
		}
		return ret;
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
		Copies custom properties from the _source_ object to the _target_ object.
		If _target_ is falsy, an object is created.
		If _source_ is falsy, the target or empty object is returned.
	*/
	enyo.mixin = function(target, source) {
		target = target || {};
		if (source) {
			var name, s;
			for (name in source) {
				// the "empty" conditional avoids copying properties in "source"
				// inherited from Object.prototype. For example, if target has a custom
				// toString() method, don't overwrite it with the toString() method
				// that source inherited from Object.prototype
				s = source[name];
				if (empty[name] !== s) {
					target[name] = s;
				}
			}
		}
		return target;
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
				throw(['enyo.bind: scope["', method, '"] is null (scope="', scope, '")'].join(''));
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
			throw(['enyo.bind: scope["', method, '"] is not a function (scope="', scope, '")'].join(''));
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
	enyo.delegate = function(obj) {
		enyo.setPrototype(enyo.instance, obj);
		return new enyo.instance();
	};

	//* @public

	/**
		Provides a stub function for _g11n_ string translation. This allows
		strings to be wrapped in preparation for localization. If the _g11n_
		library is not loaded, this function will return the string as is.

			$L('Welcome')

		If the _g11n_ library is loaded, this function will be replaced by the
		_g11n_ library version, which translates wrapped strings to strings from
		a developer-provided resource file corresponding to the current user
		locale.
	*/
	window.$L = function(string) {
		return string;
	};
})();
