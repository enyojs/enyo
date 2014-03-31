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
		alt: "",
		/**
			By default, the image is rendered using an `<img>` tag.  When this property
			is set to `"cover"` or `"constrain"`, the image is rendered using a `<div>`,
			utilizing `background-image` and `background-size`.

			Set this property to _constrain_ to letterbox the image in the available space,
			or _cover_ to cover the available space with the image (cropping the
			larger dimension).  Note, when _sizing_ is set, the control must be explicitly
			sized.
		*/
		sizing: "",
		/**
			When `sizing` is used, this property sets the positioning of the image within the
			bounds, corresponding to the `background-position` CSS property.
		*/
		position: "center"
	},
	//* @protected
	tag: "img",
	classes: "enyo-image",
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
			this.sizingChanged();
		};
	}),
	srcChanged: enyo.inherit(function (sup) {
		return function () {
			if (this.sizing && this.src) {
				this.applyStyle("background-image", "url(" + enyo.path.rewrite(this.src) + ")");
			} else {
				sup.apply(this, arguments);
			}
		};
	}),
	altChanged: function() {
		this.setAttribute("alt", this.alt);
	},
	sizingChanged: function(inOld) {
		this.tag = this.sizing ? "div" : "img";
		this.addRemoveClass("sized", !!this.sizing);
		if (this.inOld) {
			this.removeClass(inOld);
		}
		if (this.sizing) {
			this.addClass(this.sizing);
		}
		if (this.generated) {
			this.srcChanged();
			this.render();
		}
	},
	positionChanged: function() {
		if (this.sizing) {
			this.applyStyle("background-position", this.containPosition);
		}
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
		placeholder:
			"data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC" +
			"9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48cmVjdCB3aWR0aD0iMTAw" +
			"JSIgaGVpZ2h0PSIxMDAlIiBzdHlsZT0ic3Ryb2tlOiAjNDQ0OyBzdHJva2Utd2lkdGg6IDE7IGZpbGw6ICNhYW" +
			"E7IiAvPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjEwMCUiIHkyPSIxMDAlIiBzdHlsZT0ic3Ryb2tlOiAjNDQ0" +
			"OyBzdHJva2Utd2lkdGg6IDE7IiAvPjxsaW5lIHgxPSIxMDAlIiB5MT0iMCIgeDI9IjAiIHkyPSIxMDAlIiBzdH" +
			"lsZT0ic3Ryb2tlOiAjNDQ0OyBzdHJva2Utd2lkdGg6IDE7IiAvPjwvc3ZnPg=="
	}
});
