//* @public

/**
	Allow bootstrapping in environments that do not have a window object right away.
*/
enyo.requiresWindow = function(inFunction) {
	inFunction();
};

enyo.dom = {
	/**
		
		Shortcut for _document.getElementById_ if _id_ is a string, otherwise returns _id_. Uses _window.document_ unless a document is specified in the (optional) _doc_ parameter.

			// find 'node' if it's a string id, or return it unchanged if it's already a node reference
			var domNode = enyo.byId(node);
	*/
	byId: function(id, doc){
		return (typeof id == "string") ? (doc || document).getElementById(id) : id; 
	},
	/**
		return string with ampersand, less-than, and greater-than characters replaced with HTML entities, 
		e.g. 

			'&lt;code&gt;"This &amp; That"&lt;/code&gt;' 

		becomes 

			'&amp;lt;code&amp;gt;"This &amp;amp; That"&amp;lt;/code&amp;gt;'
	*/
	escape: function(inText) {
		return inText !== null ? String(inText).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
	},
	//* @protected
	getComputedStyle: function(inNode) {
		return window.getComputedStyle && window.getComputedStyle(inNode, null);
	},
	getComputedStyleValue: function(inNode, inProperty, inComputedStyle) {
		var s = inComputedStyle || this.getComputedStyle(inNode);
		return s.getPropertyValue(inProperty);
	},
	getFirstElementByTagName: function(inTagName) {
		var e = document.getElementsByTagName(inTagName);
		return e && e[0];
	},
	applyBodyFit: function() {
		var h = this.getFirstElementByTagName("html");
		if (h) {
			h.className += " enyo-document-fit";
		}
		var b = this.getFirstElementByTagName("body");
		if (b) {
			b.className += " enyo-document-fit";
		}
		enyo.bodyIsFitting = true;
	}
};
