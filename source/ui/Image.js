/**
	_enyo.Image_ implements an HTML &lt;img&gt; element and, optionally, bubbles
	the _onload_ and _onerror_ events. Image dragging is suppressed by default,
	so as not to interfere with touch interfaces.
*/
enyo.kind({
	name: "enyo.Image",
	//* When true, no _onload_ or _onerror_ event handlers will be created
	noEvents: false,
	published: {
		//* maps to the "alt" attribute of an img tag
		alt: ""
	},
	//* @protected
	tag: "img",
	attributes: {
		// note: draggable attribute takes one of these String values: "true", "false", "auto"
		// (Boolean _false_ would remove the attribute)
		draggable: "false"
	},
	create: enyo.inherit(function (sup) {
		return function() {
			if (this.noEvents) {
				delete this.attributes.onload;
				delete this.attributes.onerror;
			}
			sup.apply(this, arguments);
			this.altChanged();
		};
	}),
	altChanged: function() {
		this.setAttribute("alt", this.alt);
	},
	rendered: enyo.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			enyo.makeBubble(this, "load", "error");
		};
	}),
	statics: {
		/**
			A globally accessible data URL that describes a simple
			placeholder image that can be used in samples and applications
			until final graphics are provided. As a SVG image, it will
			expand to fill the desired width and height set in the style.
		*/
		placeholder: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" ' +
			'xmlns:xlink="http://www.w3.org/1999/xlink"><rect width="100%" height="100%" ' +
			'style="stroke: #444; stroke-width: 1; fill: #aaa;" /><line x1="0" y1="0" ' +
			'x2="100%" y2="100%" style="stroke: #444; stroke-width: 1;" /><line x1="100%" ' +
			'y1="0" x2="0" y2="100%" style="stroke: #444; stroke-width: 1;" /></svg>'
	}
});