/**
	The -webkit-transform style supports multiple transform types which are combined to create complex effects.
	Transforms of a given type stack (e.g. translateX(10em) translateX(100px).
	Here we isolate a given transform property and allow its setting while preserving other transforms.
*/
enyo.kind({
	name: "enyo.Transformable",
	kind: enyo.Control,
	className: "enyo-transformable",
	published: {
		// moz/ms fail with accelerated on (sets transformZ, which is apparently invalid)
		accelerated: false,
		transform: "translateX",
		value: 0,
		unit: "px"
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.transformChanged();
	},
	acceleratedChanged: function() {
		this.transformChanged();
	},
	transformChanged: function(inOldValue) {
		var t = inOldValue === undefined ? this.value || 0 : this.discoverValue();
		this.prepareTransform();
		this.setValue(t);
	},
	valueChanged: function() {
		var t = this.value === null ? null : this.transformPrefix + this.value + this.transformSuffix;
		this.domStyles["-webkit-transform"] = this.domStyles["-moz-transform"] = this.domStyles["-ms-transform"] = this.domStyles["transform"] = t;
		if (this.hasNode()) {
			this.node.style.webkitTransform = this.node.style.MozTransform = this.node.style.msTransform = this.node.style.transform = t;
		}
	},
	// determine de facto transform from style data
	// note that transforms can stack so sum them
	discoverValue: function() {
		var s = this.getTransformStyle();
		var r = this.makeTransformRegExp(this.transform);
		var v = 0;
		var m;
		while (m = r.exec(s)) {
			v += parseFloat(m[1]);
		}
		return v;
	},
	prepareTransform: function() {
		this.transformPrefix = this.transform + "(";
		this.transformSuffix = this.unit + ") " + this.calcDomTransform();
	},
	calcDomTransform: function() {
		var s = this.getTransformStyle();
		var r = this.makeTransformRegExp(this.transform);
		s = s.replace(r, "");
		if (this.accelerated) {
			r = this.makeTransformRegExp("translateZ");
			s = s.replace(r, "");
			s += " translateZ(0)";
		}
		return s;
	},
	getTransformStyle: function() {
		return this.domStyles["-webkit-transform"] || "";
	},
	makeTransformRegExp: function(inTransform) {
		return new RegExp(inTransform + "[^\\(]*\\(([^\\(]*)\\)", "g")
	}
});