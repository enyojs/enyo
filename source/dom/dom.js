//* @public

/**
	Allow bootstrapping in environments that do not have a window object right away.
*/
enyo.requiresWindow = function(inFunction) {
	inFunction();
};

enyo.dom = {
	/**
		Shortcut to call getElementById() if id is a string, otherwise returns id. doc is 
		optional, refers to document if not provided.
	*/
	byId: function(id, doc){
		return (typeof id == "string") ? (doc || document).getElementById(id) : id; 
	},
	/**
		return string with ampersand, less-than, and greater-than characters replaced with HTML entities, 
		e.g. '&lt;code&gt;"This &amp; That"&lt;/code&gt;' becomes '&amp;lt;code&amp;gt;"This &amp;amp; That"&amp;lt;/code&amp;gt;' 
	*/
	escape: function(inText) {
		return inText != null ? String(inText).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
	},
	//* @protected
	getComputedStyle: function(inNode) {
		return window.getComputedStyle(inNode, null);
	},
	getComputedStyleValue: function(inNode, inProperty, inComputedStyle) {
		var s = inComputedStyle || this.getComputedStyle(inNode);
		return s.getPropertyValue(inProperty);
	}
};
