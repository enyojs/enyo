(function (enyo, scope) {
	
	/**
	* @private
	*/
	var callbacks = [],
		roots = [];
		
	/**
	* @private
	*/
	enyo.roots = roots;
	
	/**
	* Invokes all known callbacks (if any) against the root view once it has been rendered.
	* This method is not likely to be executed very often.
	* 
	* @private
	*/
	function invoke (root) {
		callbacks.forEach(function (ln) {
			ln.method.call(ln.context, root);
		});
	}
	
	/**
	* Registers a single callback to be executed whenever a root view is rendered.
	* 
	* @name enyo.rendered
	* @method
	* @param {Function} method - The callback to execute.
	* @param {Object} [context=enyo.global] The context under which to execute the callback.
	* @public
	*/
	enyo.rendered = function (method, context) {
		callbacks.push({method: method, context: context || enyo.global});
	};
	
	/**
	* @private
	*/
	enyo.addToRoots = function (view) {
		var rendered,
			destroy;
		
		// since it is possible to call renderInto more than once on a given view we ensure we
		// don't register it twice unnecessarily
		if (roots.indexOf(view) === -1) {
			
			roots.push(view);
			
			// hijack the rendered method
			rendered = view.rendered;
			
			// hijack the destroy method
			destroy = view.destroy;
			
			// supply our rendered hook
			view.rendered = function () {
				// we call the original first
				rendered.apply(this, arguments);
				
				// and now we invoke the known callbacks against this root
				invoke(this);
			};
			
			// supply our destroy hook
			view.destroy = function () {
				var idx = roots.indexOf(this);
				
				// remove it from the roots array
				if (idx > -1) roots.splice(idx, 1);
				
				// now we can call the original
				destroy.apply(this, arguments);
			};
		}
	};
	
})(enyo, this);