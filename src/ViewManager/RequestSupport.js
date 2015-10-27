var
	kind = require('../kind'),
	utils = require('../utils');

/**
* Adds support for lazily loaded modules provided that export for the module is an enyo kind.
*
* @mixin RequestSupport
*/
module.exports = {
	activate: kind.inherit(function (sup) {
		return function (viewName) {
			var index = this.viewNames[viewName],
				config = this.views[index],
				kind = config && config.kind;

			// If the requested view doesn't yet exist and is 'then-able', fetch it and then
			// re-call activate() knowing it will then (rimshot) pass this test
			if (!this.$[viewName] && kind && utils.isFunction(kind.then)) {
				kind.then(utils.bind(this, function (ctor) {
					config.kind = ctor;
					sup.call(this, viewName);
				}));
			} else {
				return sup.apply(this, arguments);
			}
		};
	})
};