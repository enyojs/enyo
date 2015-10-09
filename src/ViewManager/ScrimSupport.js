var
	kind = require('../kind');

module.exports = {
	initComponents: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.createComponent({name: 'scrim', classes: 'enyo-viewmanager-scrim enyo-fit', isChrome: true});
			this.on('activate', function (sender, name, event) {
				if (event.view.isManager) this.$.scrim.addClass('showing');
			}, this);
			this.on('manager-dismiss', function (sender, name, event) {
				this.$.scrim.removeClass('showing');
			}, this);
		};
	})
};