enyo.kind({
	name: "FlickrSearch",
	kind: "Component",
	published: {
		searchText: ""
	},
	events: {
		onResults: ""
	},
	url: "http://query.yahooapis.com/v1/public/yql",
	pageSize: 20,
	api_key: "2a21b46e58d207e4888e1ece0cb149a5",
	search: function(inSearchText, inPage) {
		this.searchText = inSearchText || this.searchText;
		var i = (inPage || 0) * this.pageSize;
		var range = i + "," + (i + this.pageSize);
		var params = {
			q: 'select * from flickr.photos.search(' + range + ') where text="' + this.searchText + '" and api_key="' + this.api_key + '" limit ' + this.pageSize,
			format: "json"
		};
		return new enyo.Ajax({url: this.url})
			.response(this, "processResponse")
			.go(params)
			;
	},
	processResponse: function(inSender, inResponse) {
		var photos = inResponse.query.results ? inResponse.query.results.photo || [] : [];
		for (var i=0, p; p=photos[i]; i++) {
			var urlprefix = "http://farm" + p.farm + ".static.flickr.com/" + p.server + "/" + p.id + "_" + p.secret;
			p.thumbnail = urlprefix + "_s.jpg";
			p.original = urlprefix + ".jpg";
		}
		this.doResults(photos);
		return photos;
	}
});