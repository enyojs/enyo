//* @public

/**
	The _moon.StylesheetSupport_ mixin is used to add a "side-car" 
	inline-stylesheet to a control, specifically for procedurally generated CSS
	that can't live in the more appropriate location: a CSS/LESS file.
*/
enyo.StylesheetSupport = {
	//* @protected
	_stylesheet_tag: null,
	_stylesheet_id_suffix: "_stylesheet",

	//* @public
	published: {
		// Set _stylesheetContent_ to the CSS you'd like to appear in the stylesheet.
		stylesheetContent: ""
	},

	//* @protected
	create: enyo.inherit(function(sup) {
		return function() {
			// debugger;
			this._stylesheet_tag = this.owner.createComponent({kind: "enyo.Style"}, {owner: this});

			// Only change if it has something to set.
			if (this.stylesheetContent) {
				this.stylesheetContentChanged();
			}

			// Run SUPER last, in case "create" manipulates stylesheetContent.
			sup.apply(this, arguments);

			this._stylesheet_tag.set("id", this._stylesheet_getId());
		};
	}),
	stylesheetContentChanged: enyo.inherit(function(sup) {
		return function() {
			sup.apply(this, arguments);
			this._stylesheet_tag.set("content", this.stylesheetContent);
		};
	}),

	//* @public
	/**
		Allows you to append a string of style onto the existing stylesheet block.
	*/
	addStylesheetContent: enyo.inherit(function(sup) {
		return function(newStyle) {
			sup.apply(this, arguments);
			var existingStyle = this.get("stylesheetContent");
			this.set("stylesheetContent", (existingStyle ? existingStyle + "\n" : "" ) + newStyle);
		};
	}),

	//* @protected
	_stylesheet_getId: function() {
		return this.getId() + this._stylesheet_id_suffix;
	}
};
