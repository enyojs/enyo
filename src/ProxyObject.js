require('enyo');

var
	utils = require('./utils');

/**
* A {@glossary mixin} designed to abstract interaction of the
* {@link module:enyo/CoreObject~Object#get} and
* {@link module:enyo/CoreObject~Object#set} methods. It does not need to be
* applied to [subkinds]{@glossary subkind} of {@link module:enyo/CoreObject~Object}.
* 
* @module enyo/ProxyObject
* @public
*/
module.exports = {
	
	/**
	* @private
	*/
	name: 'ProxyObject',
	
	/**
	* The property designated as the [object]{@glossary Object} from which to
	* proxy actions.
	* 
	* @type {String}
	* @default 'data'
	* @public
	*/
	proxyObjectKey: 'data',
	
	/**
	* The overloaded [getter]{@link module:enyo/CoreObject~Object#get}. Accepts the same
	* parameters and attempts to call the same method on the
	* [proxy]{@link module:enyo/ProxyObject#proxyObjectKey}. Returns `undefined` if it
	* cannot find a proxy.
	* 
	* @see module:enyo/CoreObject~Object#get
	* @see module:enyo/utils#getPath
	* @param {String} path - The path from which to retrieve a value.
	* @returns {this} The value for the given path, or `undefined` if the path
	* could not be completely resolved.
	* @method
	* @public
	*/
	get: function (path) {
		var key = this.proxyObjectKey,
			proxy = this[key];
		
		if (proxy) {
			if (proxy.get) return proxy.get.apply(proxy, arguments);
			else return utils.getPath.call(proxy, path);
		}
		
		return undefined;
	},
	
	/**
	* The overloaded [setter]{@link module:enyo/CoreObject~Object#set}. Accepts the same
	* parameters and attempts to call the same method on the
	* [proxy]{@link module:enyo/ProxyObject#proxyObjectKey}. Returns the callee for
	* chaining if it cannot find the proxy.
	* 
	* @param {String} path - The path for which to set the given value.
	* @param {*} is - The value to set.
	* @param {Object} [opts] - An options hash.
	* @returns {this} The callee for chaining.
	* @method
	* @public
	*/
	set: function (path, is, opts) {
		var key = this.proxyObjectKey,
			proxy = this[key],
			was,
			force;
		
		force = typeof opts == 'object' ? opts.force : opts;
		
		if (proxy) {
			was = this.get(path);
			if (proxy.set) proxy.set.apply(proxy, arguments);
			else utils.setPath.apply(proxy, arguments);
			
			if (this.notify && (
				force ||
				was !== is ||
				(opts && opts.compare && opts.compare(was, is))
			)) this.notify(path, was, is);
		}
		
		return this;
	}
};
