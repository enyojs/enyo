(function (enyo, scope) {

	enyo.kind({
		name: 'enyo.NewDrawer',
		classes: 'enyo-new-drawer',
		d: 200,
		isOpen: true,
		bindings: [
			{from: 'content', to: '.$.client.content'}
		],
		components: [
			{name: 'client', classes: 'enyo-new-drawer-client'}
		],
		rendered: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				if (this.isOpen) {
					this.open({animate: false});
				}
			};
		}),
		open: function(opts) {
			if (opts && opts.animate === false) {
				this.adjust(1);
			}
			else {
				this.animate(function(p) {
					this.adjust(p);
				}, this.d);
			}
		},
		close: function(opts) {
			if (opts && opts.animate === false) {
				this.adjust(0);
			}
			else {
				this.animate(function(p) {
					p = 1 - p;
					this.adjust(p);
				}, this.d);
			}
		},
		adjust: function(p) {
			enyo.dom.transform(this, {scale3d: '1, ' + p + ', 1'});
			enyo.dom.transform(this.$.client, {scale3d: '1, ' + (1 / p) + ', 1'});
			this._p = p;
		},
		animate: function(fn, duration) {
			enyo.NewAnimator.animate(this.bindSafely(fn), duration);
		}
	});

})(enyo, this);