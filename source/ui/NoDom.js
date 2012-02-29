/**
	A control that returns as its components HTML as its own.
*/
enyo.kind({
	name: "enyo.NoDom",
	generateOuterHtml: function(inHtml) {
		return inHtml;
	}
});
