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
				ondurationchange: "durationChanged",
				onFastforward: "playbackChanged",
				onRewind: "playbackChanged",
				onPlay: "playbackChanged",
				ontap: "togglePlayback"
			},
			{kind: "enyo.Anchor", name: "playOverlay", ontap: "playVideo"}
		]},
		{kind: "enyo.Button", content: "Play", ontap: "playVideo"},
		{kind: "enyo.Button", content: "Pause", ontap: "pauseVideo"},
		{kind: "enyo.Button", content: "<< RW", ontap: "buttonRewindTapped"},
		{kind: "enyo.Button", content: "FF >>", ontap: "buttonFastForwardTapped"},
		{kind: "enyo.Button", content: "< Jump", ontap: "buttonJumpBackwardTapped"},
		{kind: "enyo.Button", content: "Jump >", ontap: "buttonJumpForwardTapped"},
		{kind: "enyo.Button", content: "Loop", ontap: "buttonToggleLoopTapped"},
		{name: "results", classes: "results", components: [
			{classes: "result-section", components: [
				{classes: "result-label", content: "Position:"},
				{name: "videoPosition"}
			]},
			{classes: "result-section", components: [
				{classes: "result-label", content: "Duration:"},
				{name: "videoDuration"}
			]},
			{classes: "result-section", components: [
				{classes: "result-label", content: "Action:"},
				{name: "videoAction"}
			]}
		]}
	],
	bindings: [
		{from: ".isPlaying", to: ".$.playOverlay.showing", transform: function(inValue) {
			return !inValue;
		}}
	],
	playbackChanged: function(inSender, inEvent) {
		if (inEvent.playbackRate > 1) {
			this.$.videoAction.setContent("Fast-Forward");			
		} else if (inEvent.playbackRate < -1) {
			this.$.videoAction.setContent("Rewind");
		} else if (inEvent.playbackRate == 1) {
			this.$.videoAction.setContent("Play");
		}
		return true;
	},
	togglePlayback: function(inSender, inEvent) {
		if (this.get("isPlaying")) {
			this.pauseVideo(arguments);
		} else {
			this.playVideo(arguments);
		}
		return true;
	},
	playVideo: function(inSender, inEvent) {
		this.set("isPlaying", true);
		this.$.video.play();
		this.$.videoAction.setContent("Play");
		return true;
	},
	pauseVideo: function(inSender, inEvent) {
		this.set("isPlaying", false);
		this.$.video.pause();
		this.$.videoAction.setContent("Pause");
		return true;
	},
	buttonRewindTapped: function(inSender, inEvent) {
		this.$.video.rewind();
		return true;
	},
	buttonFastForwardTapped: function(inSender, inEvent) {
		this.$.video.fastForward();
		return true;
	},
	buttonJumpBackwardTapped: function(inSender, inEvent) {
		this.$.video.jumpBackward();
		this.$.videoAction.setContent("Jump Backward " + this.$.video.getJumpSec() + "s");
		return true;
	},
	buttonJumpForwardTapped: function(inSender, inEvent) {
		this.$.video.jumpForward();
		this.$.videoAction.setContent("Jump Forward " + this.$.video.getJumpSec() + "s");
		return true;
	},
	buttonToggleLoopTapped: function(inSender, inEvent) {
		this.$.video.setLoop(!this.$.video.getLoop());
		this.$.videoAction.setContent("Looping " + (this.$.video.getLoop() ? "Enabled" : "Disabled"));
		return true;
	},
	rateChanged: function(inSender, inEvent) {
		this.$.videoAction.setContent("Playback " + inEvent.playbackRate + "x");
		return true;
	},
	timeChanged: function(inSender, inEvent) {
		this.$.videoPosition.setContent(Math.floor(inEvent.currentTime) + "s");
		return true;
	},
	durationChanged: function(inSender, inEvent) {
		this.$.videoDuration.setContent((inEvent.target && inEvent.target.duration ? Math.floor(inEvent.target.duration) : 0) + "s");
		return true;
	}
});