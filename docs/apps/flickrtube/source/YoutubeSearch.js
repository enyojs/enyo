enyo.kind({
	name: "YoutubeSearch",
	kind: "Component",
	published: {
		searchText: ""
	},
	events: {
		onResults: ""
	},
	url: "http://gdata.youtube.com/feeds/api/videos/",
	search: function(inSearchText, inRelated) {
		this.searchText = inSearchText || this.searchText;
		var params = {q: inRelated ? null : this.searchText, alt: "json", format: 5};
		return new enyo.Ajax({url: this.url + (inRelated ? (this.searchText + "/related") : "")})
			.response(this, "processResponse")
			.go(params)
			;
	},
	processResponse: function(inSender, inResponse) {
		var videos = inResponse && inResponse.feed ? inResponse.feed.entry || [] : []
		for (var i=0, p; v=videos[i]; i++) {
			v.title = v.title.$t;
			var l = v.id.$t;
			v.id = l.substring(l.lastIndexOf("/")+1);
			v.thumbnail = v.media$group.media$thumbnail[0].url;
		}
		this.doResults(videos);
		return videos;
	}
});