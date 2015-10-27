var
	kind = require('../kind'),
	utils = require('../utils');

function isRequestable (vm, view) {
	var kind;

	if (view) {
		kind = view.kind;
		return !vm.$[view.name] && kind && utils.isFunction(kind.then);
	}

	return false;
}

/**
* Adds support for lazily loaded modules provided that export for the module is an enyo kind.
*
* @mixin RequestSupport
*/
module.exports = {
	activate: kind.inherit(function (sup) {
		return function (viewName) {
			var index = this.viewNames[viewName],
				config = this.views[index];

			// If the requested view doesn't yet exist and is 'then-able', fetch it and then
			// re-call activate() knowing it will then (rimshot) pass this test
			if (isRequestable(this, config)) {
				config.kind.then(utils.bind(this, function (ctor) {
					config.kind = ctor;
					this._activate(viewName, true);
				}));
				this.updateStack(viewName);

				// Assume that since we've found the view config that we'll successfully load it
				// for the purposes of VM
				return true;
			} else {
				return sup.apply(this, arguments);
			}
		};
	})
};