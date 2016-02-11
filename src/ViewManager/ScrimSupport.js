var
	kind = require('../kind'),
	utils = require('enyo/utils');


/** 
* A mixin for use by ViewManager. Applies a user-defined `scrimConfig` if present.
*
* @name module:enyo/ViewManager~ScrimSupport
* @mixin
* @wip
* @protected
*/
var ScrimSupport = {
	/**
	* @private
	*/ 
	initComponents: kind.inherit(function (sup) {
		return function () {
			var config = {name: 'scrim', classes: 'enyo-viewmanager-scrim enyo-fit'};
			sup.apply(this, arguments);

			// override defaults with user-provided scrimConfig
			if (this.scrimConfig) utils.mixin(config, this.scrimConfig);
			this.createComponent(config, {isChrome: true});

			// monitor the relevant events to hide and show the scrim
			// @todo - may need to monitor active manager counts
			this.on('manager-manage', function (sender, name, event) {
				this.$[config.name].addClass('showing');
			}, this);
			this.on('manager-dismiss', function (sender, name, event) {
				this.$[config.name].removeClass('showing');
			}, this);
		};
	})
};

module.exports = ScrimSupport;
