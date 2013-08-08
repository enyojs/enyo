/**
	_enyo.Anchor implements an HTML anchor. Properties are provided for
	the href and title attributes to allow for binding these to properties
	when composing with other controls.
*/
enyo.kind({
	name: "enyo.Anchor",
	kind: "enyo.Control",
	tag: "a",
	//* @public
	published: {
		//* maps to the href attribute of the "a" tag
		href: "",
		//* maps to the title attribute of the "a" tag
		title: ""
	},
	//* @protected
	create: enyo.super(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.hrefChanged();
			this.titleChanged();
		};
	}),
	//* @protected
	hrefChanged: function() {
		this.setAttribute("href", this.href);
	},
	//* @protected
	titleChanged: function() {
		this.setAttribute("title", this.title);
	}
});
