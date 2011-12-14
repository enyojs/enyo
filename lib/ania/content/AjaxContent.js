/**
A control that displays html loaded via an AJAX call to a remote url. Using an AjaxContent
is a convenient way to specify a large amount of html.

Content is loaded asynchronously, and the onContentChanged event is fired when content is received.

	{kind: "AjaxContent", url: "www.example.com/someText.html", onContentChanged: "ajaxContentChanged"}

To modify the value of the loaded content, implement the onContentChanged event and alter the value of 
the content property as follows:

	ajaxContentChanged: function(inSender) {
		// change content to be all uppercase
		inSender.content = inSender.content.toUpperCase();
	}

*/
enyo.kind({
	name: "enyo.AjaxContent",
	kind: enyo.Control,
	published: {
		url: ""
	},
	events: {
		onContentChanged: ""
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.urlChanged();
	},
	urlChanged: function() {
		if (this.url) {
			enyo.xhrGet({
				url: this.url,
				load: enyo.hitch(this, "_loaded")
			});
		}
	},
	_loaded: function(inText, inXhr) {
		this.setContent(inText);
	},
	contentChanged: function() {
		this.doContentChanged();
		this.inherited(arguments);
	}
});

//* @protected
enyo.Html = enyo.AjaxContent;