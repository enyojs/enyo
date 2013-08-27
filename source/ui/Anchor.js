/**
	_enyo.Anchor_ implements an HTML anchor (&lt;a&gt;) tag. Published properties
	allow you to bind the anchor's _href_ and _title_ attributes to appropriate
	fields on data objects.
*/
enyo.kind({
	name: "enyo.Anchor",
	kind: "enyo.Control",
	tag: "a",
	//* @public
	published: {
		//* Maps to the _href_ attribute of the &lt;a&gt; tag
		href: "",
		//* Maps to the _title_ attribute of the &lt;a&gt; tag
		title: ""
	},
	//* @protected
	create: enyo.inherit(function (sup) {
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
