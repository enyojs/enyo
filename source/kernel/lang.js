(function(){
	//* @protected
	enyo.global = this;


  // TODO: there are some significant improvements that can be made
  // to both of these methods enyo.getPath/enyo.setPath and both
  // should be renamed without the underscore...

  enyo.getPath = function () {
    var args, cur, path, i = 0, val, part, def;
    if (arguments.length === 0) return undefined;  
    if (!enyo.isString(arguments[0])) return undefined;
    args = arguments;
    path = args[0];
    cur = this === enyo && args[1] !== true? window: this;
    while (path[i] === ".") ++i;
    if (i > 0) path = path.slice(i);
    i = path.indexOf(".");
    if (i === -1) {
      def = "get" + enyo.cap(path);
      val = cur && cur[def] && cur[def].overloaded? cur[def].call(this): cur[path];
    } else {
      part = path.substring(0, i);
      path = path.slice(i);
      if (typeof cur[part] === "object") {
        val = enyo.getPath.call(cur[part], path, true);
      } else return undefined;
    }
    if (enyo.isFunction(val) && val.isProperty === true) {
      if (!args[1]) return val.call(this);
    }
    return val;
  };

  enyo.setPath = function () {
    var args, cur, val, path, i = 0, parts, tmp, prev;
    if (arguments.length < 2) return this;
    args = arguments;
    path = args[0];
    val = args[1];
    force = args[2];
    cur = this;
    prev = enyo.getPath.call(this, path);
    while (path[i] === ".") ++i;
    if (i > 0) path = path.slice(i);
    i = path.indexOf(".");
    if (i === -1) {
      if (this[path] && enyo.isFunction(this[path]) && this[path].isProperty) {
        this[path].call(this, val);
      } else {
        this[path] = val;
      }
    } else {
      parts = path.split(".");
      while (parts.length > 0) {
        tmp = parts.shift();
        if (tmp === "enyo" && this === enyo) continue;
        if (parts.length === 0) {
          if (cur[tmp] && enyo.isFunction(cur[tmp]) && cur[tmp].isProperty) {
            cur[tmp].call(this, val);
          } else {
            cur[tmp] = val;
          }
        } else {
          if (!cur[tmp]) cur[tmp] = {};
          cur = cur[tmp];
        }
      }
    }
    if (this.notifyObservers && (prev !== val || force)) this.notifyObservers(path, prev, val);
    return this;
  };

	enyo._getProp = function(parts, create, context) {
		var obj = context || enyo.global;
		for(var i=0, p; obj && (p=parts[i]); i++){
			obj = (p in obj ? obj[p] : (create ? obj[p]={} : undefined));
		}
		return obj;
	};

	//* @public

	/**
		Sets object _name_ to _value_. _name_ can use dot notation and intermediate objects are created as necessary.

			// set foo.bar.baz to 3. If foo or foo.bar do not exist, they are created.
			enyo.setObject("foo.bar.baz", 3);

		Optionally, _name_ can be relative to object _context_.

			// create foo.zot and sets foo.zot.zap to null.
			enyo.setObject("zot.zap", null, foo);
	*/
	enyo.setObject = function(name, value, context) {
		var parts=name.split("."), p=parts.pop(), obj=enyo._getProp(parts, true, context);
		return obj && p ? (obj[p]=value) : undefined;
	};

	/**
		Gets object _name_. _name_ can use dot notation. Intermediate objects are created if _create_ argument is truthy.

			// get the value of foo.bar, or undefined if foo doesn't exist.
			var value = enyo.getObject("foo.bar");

			// get the value of foo.bar. If foo.bar doesn't exist,
			// it's assigned an empty object, which is returned
			var value = enyo.getObject("foo.bar", true);

		Optionally, _name_ can be relative to object _context_.

			// get the value of foo.zot.zap, or undefined if foo.zot doesn't exist
			var value = enyo.getObject("zot.zap", false, foo);
	*/
	enyo.getObject = function(name, create, context) {
		return enyo._getProp(name.split("."), create, context);
	};

	//* Returns a random Integer between 0 and inBound (0 <= results < inBound).
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

	//* Returns _inString_ with the first letter un-capitalized.
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

	//* Returns true if _it_ is a string.
	enyo.isString = function(it) {
		return toString.call(it) === "[object String]";
	};

	//* Returns true if _it_ is a function.
	enyo.isFunction = function(it) {
		return toString.call(it) === "[object Function]";
	};

	//* Returns true if _it_ is an array.
	enyo.isArray = Array.isArray || function(it) {
		return toString.call(it) === "[object Array]";
	};

	//* Returns the index of the element in _inArray_ that is equivalent (==) to _inElement_, or -1 if no element is found.
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

	//* Removes the first element in _inArray_ that is equivalent (==) to _inElement_.
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


  /**
    Concatenate any number of arrays but only the unique entries
    relative to the base (first) array.
  */
  enyo.merge = function () {
    var r = [], args = enyo.toArray(arguments), a, i = 0, j;
    for (; args.length; ++i) {
      a = args.shift();
      if (!enyo.isArray(a)) continue;
      if (i === 0) r = enyo.clone(a);
      else {
        for (j = 0; j < a.length; ++j)
          if (r.indexOf(a[j]) > -1) continue;
          else r.push(a[j]);
      }
    }
    return r;
  };
  
  /**
    Return a union of any number of arrays.
    
    TODO: come back to this off the cuff atrocity
  */
  enyo.union = function () {
    var c = Array.prototype.concat.apply([], arguments), s = [], r = [];
    enyo.forEach(c, function (v, i) {
      if (!~s.indexOf(v)) {
        s.push(v);
        if (i === c.lastIndexOf(v)) r.push(v);
      }
    });
    return r;
  };
  
  enyo.only = function (inProps, inObject) {
    var r = [], k;
    if (!inProps || !inObject) return r;
    if (!enyo.isArray(inProps) && inProps) inProps = [inProps];
    for (k in inObject)
      if (!inObject.hasOwnProperty(k)) continue;
      else if (inProps.indexOf(k) !== -1 && r.indexOf(k) === -1)
        r.push(inObject[k]);
    return r;
  };
  
  enyo.except = function (inProps, inObject) {
    var r = {}, keep = enyo.union(inProps, enyo.keys(inObject));
    enyo.forEach(keep, function (k) {r[k] = inObject[k]});
    return r;
  };
  
  /**
    Take an array of objects of a common structure and return
    a hash of those objects keyed by the unique value _inProp_.
    An optional filter/resolution method may be provided to
    handle exception cases. It receives parameters in the order:
    the property, the current object in the array, a reference to
    the return object, and a copy of the original array.
    
    TODO: This should be capable of a few other things...
  */
  enyo.indexBy = function (inProp, inArray, inFilter) {
    var k = inProp, a = inArray, r = {}, v, c = enyo.clone(inArray),
        fn = enyo.isFunction(inFilter)? inFilter: undefined, i = 0;
    for (; i < a.length; ++i) {
      v = a[i];
      if (v && v[k]) {
        if (fn) fn(k, v, r, c);
        else r[v[k]] = v;
      }
    }
    return r;
  };
  
  enyo.allKeys = function (inObj) {
    var k, o = inObj, r = [];
    for (k in inObj) r.push(k);
    return r;
  };

  enyo.pluck = function (inProp, inArray) {
    var r = [], i = 0, a;
    a = enyo.isArray(inArray)? inArray: [inArray];
    for (; i < a.length; ++i) {
      if (!a[i]) continue;
      if (a[i][inProp]) r.push(a[i][inProp]);
    }
    return r;
  };

	/**
		Creates a new array with all elements of _inArray_ that pass the test implemented by _inFunc_.
		If _inContext_ is specified, _inFunc_ is called with _inContext_ as _this_.
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
			for (var i = 0, p; p = dontEnums[i]; i++) {
				if (hop.call(inObject, p)) {
					results.push(p);
				}
			}
		}
		return results;
	};

	/**
		Clones an existing Array, or converts an array-like object into an Array.
		
		If _inOffset_ is non-zero, the cloning is started from that index in the source Array.
		The clone may be appended to an existing Array by passing the existing Array as _inStartWith_.
		
		Array-like objects have _length_ properties, and support square-bracket notation ([]).
		Often array-like objects do not support Array methods, such as _push_ or _concat_, and
		must be converted to Arrays before use.
		
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
		If _target_ is falsey, an object is created.
		If _source_ is falsey, the target or empty object is returned.
	*/
	enyo.mixin = function(target, source) {
		target = target || {};
		if (source) {
			var name, s, i;
			for (name in source) {
				// the "empty" conditional avoids copying properties in "source"
				// inherited from Object.prototype.  For example, if target has a custom
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

		_method_ can be a function or the string name of a function-valued
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

		Uses _window.setTimeout_ with minimum delay, usually
		around 10ms.

		Additional arguments are passed to _inMethod_ when
		it is invoked.
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
	$L = function(string) {
		return string;
	};
})();
