enyo.kind({
	name: "YouTubeSearch",
	kind: "Async",
	url: "http://gdata.youtube.com/feeds/api/videos/",
	search: function(inSearchText, inRelated) {
		var url = this.url + (inRelated ? inSearchText + "/related" : "");
		var params = {q: inRelated ? null : inSearchText, alt: "json", format: 5};
		return new enyo.Ajax({url: url})
			.go(params)
			.response(this, "processResponse")
			;
	},
	processResponse: function(inSender, inResponse) {
		var videos = inResponse && inResponse.feed && inResponse.feed.entry || [];
		for (var i=0, l; v=videos[i]; i++) {
			l = v.id.$t;
			v.id = l.substring(l.lastIndexOf("/")+1);
			//v.title = v.title.$t;
			v.thumbnail = v.media$group.media$thumbnail[1].url;
		}
		return videos;
	}
});