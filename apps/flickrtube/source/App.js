enyo.kind({
	name: "App",
	kind: "SlidingPanels",
	className: "app bg fit theme-fu",
	layoutKind: "HBoxLayout",
	collapsesToEnd: false,
	components: [
		{kind: "YoutubeSearch", onResults: "searchResults"},
		{kind: "FlickrSearch", onResults: "searchResults"},
		{name: "youtubeRelatedSearch", kind: "YoutubeSearch", onResults: "relatedResults"},
		{width: 300, components: [
			{kind: "SlidingPanels", className: "fit", layoutKind: "VBoxLayout", collapsesToEnd: false, components: [
				{height: 100, draggable: false, className: "search-box", components: [
					{name: "sourceSelect", tagName: "select", className: "search-control select", components: [
						{tagName: "option", attributes: {value: "flickr"}, content: "Flickr"},
						{tagName: "option", attributes: {value: "youtube"}, content: "Youtube"}
					]},
					{},
					{name: "input", className: "search-control input", tagName: "input", attributes: {value: "the sing off"}},
					{tagName: "button", className: "search-control button", content: "search", onclick: "search"},
					{kind: "Spinner", showing: false, style: "display: inline-block; vertical-align: middle"}
				]},
				{height: "fill", draggable: false, layoutKind: "VBoxLayout", components: [
					{name: "results", kind: "SimpleScroller", height: "fill", className: "list bg", preventDragPropagation: false}
				]}
			]}
		]},
		{className: "content-panel bg", width: "fill", components: [
			{kind: "SlidingPanels", className: "fit", layoutKind: "VBoxLayout", components: [
				{name: "main", height: "fill", className: "main-panel bg", components: [
					{kind: "Youtube", showing: false, className: "fit youtube-content"},
					{kind: "Flickr", showing: false, className: "fit"}
				]},
				{height: 120, layoutKind: "VBoxLayout", components: [
					{name: "related", kind: "SimpleScroller", className: "related-list", height: "fill"}
				]}
			]}
		]}
	],
	search: function() {
		this.source = this.$.sourceSelect.hasNode().value;
		this.$.spinner.setShowing(true);
		this.$[this.source+"Search"].search(this.$.input.hasNode().value);
	},
	searchResults: function(inSender, inResults) {
		this.$.spinner.setShowing(false);
		this.$.results.destroyClientControls();
		this.results = inResults;
		for (var i=0,r; r=inResults[i]; i++) {
			this.$.results.createComponent({content: r.title, className: "item", 
				onclick: "select", r: r, owner: this});
		}
		this.$.results.render();
	},
	select: function(inSender) {
		enyo.forEach(this.$.main.getClientControls(), function(inC) {
			inC.setShowing(false);
		});
		this.$[this.source].setShowing(true);
		this[this.source + "Select"](inSender);
	},
	flickrSelect: function(inSender) {
		this.$.flickr.setSrc(inSender.r.original);
		this.relatedResults(inSender, this.results);
	},
	youtubeSelect: function(inSender) {
		var id = inSender.r.id;
		this.$.youtubeRelatedSearch.search(id, true);
		this.$.youtube.setVideoId(id);
	},
	relatedResults: function(inSender, inResults) {
		this.$.related.destroyClientControls();
		for (var i=0, results=inResults, r; r=results[i]; i++) {
			this.$.related.createComponent({tagName: "img", src: r.thumbnail, className: "related-item", 
				attributes: {draggable: false}, onclick: "select", r: r, owner: this});
		}
		this.$.related.render();
	}
});