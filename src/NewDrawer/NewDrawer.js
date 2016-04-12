/**
* Contains the declaration for the {@link module:enyo/NewDrawer~NewDrawer} kind.
* @wip
* @private
* @module enyo/NewDrawer
*/

require('enyo');

var
	kind = require('../kind'),
	dom = require('../dom');

var
	Control = require('../Control'),
	NewAnimator = require('../NewAnimator');

/**
* {@link module:enyo/NewDrawer~NewDrawer} is an experimental
* {@link module:enyo/Control~Control}.
*
* It is not a 1:1 replacement for {@link module:enyo/Drawer~Drawer}
* and will likely never be promoted out of its experimental state.
* Use at your own risk.
*
* @class NewDrawer
* @extends module:enyo/Control~Control
* @wip
* @private
* @ui
*/
module.exports = kind(
	/** @lends module:enyo/NewDrawer~NewDrawer.prototype */ {
	name: 'enyo.NewDrawer',
	kind: Control,
	classes: 'enyo-new-drawer',
	d: 200,
	expanded: 1,
	bindings: [
		{from: 'content', to: '.$.client.content'}
	],
	create: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.adjust(this.expanded);
		};
	}),
	open: function(opts) {
		if (opts && opts.animate === false) {
			this.adjust(1);
		}
		else {
			this._animate(function(p) {
				this.adjust(p);
			}, this.d);
		}
	},
	close: function(opts) {
		if (opts && opts.animate === false) {
			this.adjust(0);
		}
		else {
			this._animate(function(p) {
				p = 1 - p;
				this.adjust(p);
			}, this.d);
		}
	},
	adjust: function(p) {
		dom.transform(this, {scale3d: '1, ' + p + ', 1'});
		dom.transform(this.$.client, {scale3d: '1, ' + (1 / p) + ', 1'});
		this._p = p;
	},
	_animate: function(fn, duration) {
		NewAnimator.animate(this.bindSafely(fn), duration);
	},
	initComponents: kind.inherit(function (sup) {
		return function () {
			this.createChrome([
				{name: 'client', kind: Control, classes: 'enyo-new-drawer-client'}
			]);
			sup.apply(this, arguments);
			// this.discoverControlParent();
		};
	})
});