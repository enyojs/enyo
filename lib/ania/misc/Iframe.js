/**
An iframe control loads inline a web page specified by its url property.

	{kind: "IFrame", url: "www.example.com"}

Note that when the user interacts with the page loaded in the iframe and 
navigates to a different web page, the value of the url property does not update.
To retrieve the currently loaded page, call fetchCurrentUrl. To reload the page
specified by the url property, call refresh.

For example, to reload the page corresponding to the url property
if it's not the currently displayed url:

	buttonClick: function() {
		if (this.$.iframe.getUrl() != this.$.iframe.fetchCurrentUrl()) {
			this.$.iframe.refresh();
		}
	}
*/
enyo.kind({
	name: "enyo.Iframe",
	kind: enyo.Control,
	published: {
		/**
			Url of the web page to load in the iframe.
		*/
		url: "",
		tabIndex: null
	},
	className: "enyo-iframe",
	//* @protected
	attributes: {frameborder: 0},
	tagName: "iframe",
	create: function() {
		this.inherited(arguments);
		this.urlChanged();
		enyo.mixin(this.attributes, {
			onload: enyo.bubbler
		});
		this.tabIndexChanged();
	},
	showingChanged: function() {
		this.inherited(arguments);
		// FIXME: workaround webkit bug (also exhibited on desktop) 
		// display: none iframes can be focused.
		if (this.showing) {
			this.tabIndexChanged();
		} else {
			this.applyTabIndex(-1);
		}
	},
	urlChanged: function() {
		this.setAttribute("src", enyo.path.rewrite(this.url));
	},
	tabIndexChanged: function() {
		if (this.showing) {
			this.applyTabIndex(this.tabIndex);
		}
	},
	applyTabIndex: function(inTabIndex) {
		this.attributes.tabIndex = inTabIndex;
	},
	//* @public
	/**
		Navigates to the previous web page in the history list.
	*/
	goBack: function() {
		if (this.hasNode()) {
			this.node.contentWindow.history.go(-1);
		}
	},
	/**
		Navigates to the next web page in the history list.
	*/
	goForward: function() {
		if (this.hasNode()) {
			this.node.contentWindow.history.go(1);
		}
	},
	/**
		Reloads the page specified by the value of the url property. Note that this is
		not necessarily the same as the currently displayed url because the url property
		does not update when the user interacts with the loaded page.
	*/
	refresh: function() {
		this.setUrl(this.url);
	},
	/**
		Returns the url of the loaded page. This url is not necessarily the same as
		the value of the url property because the value of this.url is not updated
		when a user navigates to a different url by interacting with the loaded page.
	*/
	fetchCurrentUrl: function() {
		var n = this.hasNode();
		var url = this.getUrl();
		try {
			return n ? n.contentDocument.location.href : url;
		} catch(e) {
			return url;
		}
	},
	//* @protected
	setHTML: function(inUrl, inHtml) {
		if (this.hasNode()) {
			this.node.contentWindow.document.body.innerHTML = inHtml;
		}
	}
});