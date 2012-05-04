﻿/**
_enyo.Object_ implements the Enyo framework's property publishing system.
Published properties are declared in an array called _published_ within a call
to _enyo.kind_. Getter and setter methods are automatically generated for
properties declared this way.  Also, by convention, a setter for a published
property will trigger an optional _&lt;propertyName&gt;Changed_ method when
called.

In the following example, _myValue_ becomes a regular property on the MyObject
prototype (with a default value of 3), and the getter and setter methods are
generated as noted in the comments:

	enyo.kind({
		name: "MyObject",
		kind: enyo.Object,

		// declare 'published' properties
		published: {
			myValue: 3
		},

		// these methods will be automatically generated:
		//	getMyValue: function() ...
		//	setMyValue: function(inValue) ...

		// optional method that is called whenever setMyValue is called
		myValueChanged: function(inOldValue) {
			this.delta = this.myValue - inOldValue;
		}
	});

Since we have declared a _changed_ method (i.e., _myValueChanged_) to observe
set calls on the _myValue_ property, it will be called whenever _setMyValue_ is
called, as illustrated by the following:

	myobj = new MyObject();
	var x = myobj.getMyValue(); // x gets 3

	myobj.setMyValue(7); // myValue becomes 7; myValueChanged side-effect sets delta to 4

_Changed_ methods are called whenever setters are invoked, whether or not the
actual value has changed.

Published properties are stored as regular properties on the object prototype,
so it's possible to query or set their values directly:

	var x = myobj.myValue;

Note that when you set a property's value directly, the _changed_ method is not
called.

_enyo.Object_ also provides some utility functions for its subkinds.
*/
enyo.kind({
	name: "enyo.Object",
	//* @protected
	// has no base kind
	kind: null,
	constructor: function() {
		enyo._objectCount++;
	},
	setPropertyValue: function(n, v, cf) {
		if (this[cf]) {
			var old = this[n];
			this[n] = v;
			this[cf](old);
		} else {
			this[n] = v;
		}
	},
	_setProperty: function(n, v, cf) {
		this.setPropertyValue(n, v, (this.getProperty(n) !== v) && cf);
	},
	//* @public
	destroyObject: function(inName) {
		if (this[inName] && this[inName].destroy) {
			this[inName].destroy();
		}
		this[inName] = null;
	},
	getProperty: function(n) {
		var getter = "get" + enyo.cap(n);
		if (this[getter]) {
			return this[getter]();
		}
		return this[n];
	},
	setProperty: function(n, v) {
		var setter = "set" + enyo.cap(n);
		if (this[setter]) {
			this[setter](v);
		} else {
			this._setProperty(n, v, n + "Changed");
		}
	},
	/**
		Sends a log message to the console, prepended with the name of the kind
		and method from which _log_ was invoked.  Multiple arguments are coerced
		to String and joined with spaces.

			enyo.kind({
				name: "MyObject",
				kind: enyo.Object,
				hello: function() {
					this.log("says", "hi");
					// shows in the console: MyObject.hello: says hi
				}
			});
	*/
	log: function() {
		var acc = arguments.callee.caller;
		var nom = ((acc ? acc.nom : "") || "(instance method)") + ":";
		enyo.logging.log("log", [nom].concat(enyo.cloneArray(arguments)));
	},
	//* Same as _log_, except uses the console's warn method (if it exists).
	warn: function() {
		this._log("warn", arguments);
	},
	//* Same as _log_, except uses the console's error method (if it exists).
	error: function() {
		this._log("error", arguments);
	},
	//* @protected
	_log: function(inMethod, inArgs) {
		if (enyo.logging.shouldLog(inMethod)) {
			try {
				throw new Error();
			} catch(x) {
				enyo.logging._log(inMethod, [inArgs.callee.caller.nom + ": "].concat(enyo.cloneArray(inArgs)));
				console.log(x.stack);
			}
		}
	}
});

//* @protected

enyo._objectCount = 0;

enyo.Object.subclass = function(ctor, props) {
	this.publish(ctor, props);
};

enyo.Object.publish = function(ctor, props) {
	var pp = props.published;
	if (pp) {
		var cp = ctor.prototype;
		for (var n in pp) {
			enyo.Object.addGetterSetter(n, pp[n], cp);
		}
	}
};

enyo.Object.addGetterSetter = function(inName, inValue, inProto) {
	var priv_n = inName;
	inProto[priv_n] = inValue;
	//
	var cap_n = enyo.cap(priv_n); 
	var get_n = "get" + cap_n;
	if (!inProto[get_n]) {
		inProto[get_n] = function() { 
			return this[priv_n];
		};
	}
	//
	var set_n = "set" + cap_n;
	var change_n = priv_n + "Changed";
	if (!inProto[set_n]) {
		inProto[set_n] = function(v) { 
			this._setProperty(priv_n, v, change_n); 
		};
	}
};
