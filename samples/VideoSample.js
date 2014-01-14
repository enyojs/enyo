enyo.kind({
	name: "enyo.sample.VideoSample",
	classes: "video-sample",
	components: [
		{content: "Video", classes: "section"},
		{classes: "container-video", components: [
			{
				kind: "enyo.Video", 
				poster: "http://media.w3.org/2010/05/bunny/poster.png", 
				preload: "auto", 
				src: "http://media.w3.org/2010/05/bunny/movie.mp4", 
				onratechange: "rateChanged", 
				ontimeupdate: "timeChanged",
				onFastforward: "playbackChanged",
				onRewind: "playbackChanged",
				onPlay: "playbackChanged",
				ontap: "togglePlayback"
			},
			{kind: "enyo.Anchor", ontap: "anchorVideoTapped"}
		]},
		{kind: "enyo.Button", content: "Play", ontap: "buttonPlayTapped"},
		{kind: "enyo.Button", content: "Pause", ontap: "buttonPauseTapped"},
		{kind: "enyo.Button", content: "<< Rewind", ontap: "buttonRewindTapped"},
		{kind: "enyo.Button", content: "Fast Forward >>", ontap: "buttonFastForwardTapped"},
		{kind: "enyo.Button", content: "< Jump Backward", ontap: "buttonJumpBackwardTapped"},
		{kind: "enyo.Button", content: "Jump Forward >", ontap: "buttonJumpForwardTapped"},
		{kind: "enyo.Button", content: "Toggle Loop", ontap: "buttonToggleLoopTapped"},
		{name: "results", classes: "results"},
		{kind: "enyo.Popup", name: "popupStatus", floating: true, centered: true, classes: "popup"}
	],
	playbackChanged: function(inSender, inEvent) {
		if (inEvent.playbackRate > 1) {
			this.displayPopup("Fast-Forward");			
		} else if (inEvent.playbackRate < -1) {
			this.displayPopup("Rewind");
		} else if (inEvent.playbackRate == 1) {
			this.displayPopup("Play");
		}
	},
	togglePlayback: function(inSender, inEvent) {
		if (inSender.isPaused()) {
			inSender.play();
		} else {
			inSender.pause();
			this.displayPopup("Pause");
		}
	},
	anchorVideoTapped: function(inSender, inEvent) {
		inSender.hide();
		this.$.video.play();
	},
	buttonPlayTapped: function(inSender, inEvent) {
		this.$.video.play();
	},
	buttonPauseTapped: function(inSender, inEvent) {
		this.$.video.pause();
		this.displayPopup("Pause");
	},
	buttonRewindTapped: function(inSender, inEvent) {
		this.$.video.rewind();
	},
	buttonFastForwardTapped: function(inSender, inEvent) {
		this.$.video.fastForward();
	},
	buttonJumpBackwardTapped: function(inSender, inEvent) {
		this.$.video.jumpBackward();
		this.displayPopup("Jump Backward " + this.$.video.getJumpSec() + "s");
	},
	buttonJumpForwardTapped: function(inSender, inEvent) {
		this.$.video.jumpForward();
		this.displayPopup("Jump Forward " + this.$.video.getJumpSec() + "s");
	},
	buttonToggleLoopTapped: function(inSender, inEvent) {
		this.$.video.setLoop(!this.$.video.getLoop());
		this.displayPopup("Looping " + (this.$.video.getLoop() ? "Enabled" : "Disabled"));
	},
	rateChanged: function(inSender, inEvent) {
		this.displayPopup("Playback " + inEvent.playbackRate + "x");
	},
	timeChanged: function(inSender, inEvent) {
		this.$.results.setContent("Duration: " + Math.floor(inEvent.duration) + "s, Current Position: " + Math.floor(inEvent.currentTime) + "s");
	},
	displayPopup: function(inContent) {
		var popup = this.$.popupStatus;
		popup.setContent(inContent);
		popup.setShowing(true);
		enyo.job("autoHidePopup", function() { 
			popup.hide(); 
		}, 1000);
	}
});