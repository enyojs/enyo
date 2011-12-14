enyo.kind({
	name: "enyo.Youtube",
	kind: "Control",
	layoutKind: "VBoxLayout",
	published: {
		videoId: ""
	},
	statics: {
		apiPending: false,
		pendingPlayers: []
	},
	components: [
		//{kind: "ApplicationEvents", onWindowActivated: "windowActivated", onWindowDeactivated: "windowDeactivated"},
		/*{name: "scrim", kind: "VFlexBox", pack: "center", align: "center", flex: 1, showing: false, components: [
			{kind: "Image", src: "$lib-youtube/images/youtube-icon.png"}
		]},*/
		{name: "video", height: "fill", style: "position: relative;"}
	],
	create: function() {
		this.inherited(arguments);
		if (!this.videoId) {
			this.setPlayerShowing(false);
		}
	},
	rendered: function() {
		this.inherited(arguments);
		this.videoIdChanged();
	},
	createPlayer: function() {
		if (window.YT) {
			this.setPlayerShowing(true);
			this.player = new YT.Player(this.$.video.id, {
				height: '100%',
				width: '100%',
				videoId: this.videoId,
				events: {
					'onReady': enyo.bind(this, "playerReady"),
					'onStateChange': enyo.bind(this, "playerStateChange")
				}
			});
			var iframe = this.$.video.hasNode().firstChild;
			if (iframe) {
				iframe.style.position = "absolute";
			}
		} else {
			this.loadApi();
		}
	},
	loadApi: function() {
		enyo.Youtube.pendingPlayers.push(this);
		if (!enyo.Youtube.apiPending) {
			enyo.Youtube.apiPending = true;
			var s = document.createElement('script');
			s.src = "http://www.youtube.com/player_api";
			var f = document.getElementsByTagName('script')[0];
			f.parentNode.insertBefore(s, f);
		}
	},
	apiLoaded: function() {
		enyo.Youtube.apiPending = false;
		enyo.remove(this, enyo.Youtube.pendingPlayers);
		this.createPlayer();
	},
	playerReady: function(inEvent) {
		this.setPlayerShowing(true);
		this.play();
	},
	playerStateChange: function() {
	},
	getPlayer: function() {
		return this.player;
	},
	videoIdChanged: function() {
		if (this.videoId) {
			if (this.player) {
				this.player.loadVideoById(this.videoId);
				this.setPlayerShowing(true);
			} else {
				this.createPlayer();
			}
		} else {
			this.setPlayerShowing(false);
			this.pause();
		}
	},
	setPlayerShowing: function(inShowing) {
		this.$.video.setShowing(inShowing);
		//this.$.scrim.setShowing(!inShowing);
	},
	windowActivated: function() {
		if (this.videoId && this.player) {
			this.setPlayerShowing(true);
		}
	},
	windowDeactivated: function() {
		this.setPlayerShowing(false);
		this.pause();
	},
	play: function() {
		if (this.player) {
			this.player.playVideo();
		}
	},
	pause: function() {
		if (this.player) {
			this.player.pauseVideo();
		}
	}
});

// global callback called when script is processed
onYouTubePlayerAPIReady = function() {
	var players = enyo.Youtube.pendingPlayers;
	for (var i=0, p; p=players[i]; i++) {
		p.apiLoaded();
	}
}
