enyo.kind({
	name: "enyo.sample.AudioSample",
	classes: "audio-sample",
	components: [
		{
			kind: "enyo.Audio",
			onratechange: "rateChanged",
			ontimeupdate: "timeChanged",
			onFastforward: "playbackChanged",
			onRewind: "playbackChanged",
			onPlay: "playbackChanged",
			onPause: "playbackChanged",
			onLoadedMetaData: "metaDataLoaded"
		},
		{content: "Audio", classes: "section"},
		{kind: "enyo.Select", name: "selectAudio", onchange: "selectChanged", components: [
			{content: "Andre Agassi - Farewell To Tennis", active: true},
			{content: "Fight Club Rules"},
			{content: "Hail to the Chief"},
			{content: "Winston Churchill: Blood, Toil, Tears, and Sweat"}
		]},
		{content: "Playback", classes: "section"},
		{kind: "enyo.Button", content: "Play", ontap: "togglePlay"},
		{kind: "enyo.Button", content: "<< Rewind", ontap: "buttonRewindTapped"},
		{kind: "enyo.Button", content: "Fast Forward >>", ontap: "buttonFastForwardTapped"},
		{kind: "enyo.Button", content: "< Jump Backward", ontap: "buttonJumpBackwardTapped"},
		{kind: "enyo.Button", content: "Jump Forward >", ontap: "buttonJumpForwardTapped"},
		{kind: "enyo.Button", content: "Loop", ontap: "buttonLoopTapped"},
		{name: "results", classes: "results"},
		{kind: "enyo.Popup", name: "popupStatus", floating: true, centered: true, classes: "popup"}
	],
	sounds: [
		"http://www.noiseaddicts.com/samples/3828.mp3",
		"http://www.noiseaddicts.com/samples/2514.mp3",
		"http://www.noiseaddicts.com/samples/4353.mp3",
		"http://www.noiseaddicts.com/samples/134.mp3"
	],
	rendered: function() {
		this.inherited(arguments);
		this.loadAudio(this.$.selectAudio.getSelected());
	},
	metaDataLoaded: function(inSender, inEvent) {
		this.timeChanged(inSender, enyo.mixin(inEvent, {duration: this.$.audio.getDuration(), currentTime: this.$.audio.getCurrentTime()}));
	},
	playbackChanged: function(inSender, inEvent) {
		if (inEvent.type === "onPause") {
			this.displayPopup("Pause");
		} else if (inEvent.originator.playbackRate > 1) {
			this.displayPopup("Fast-Forward");			
		} else if (inEvent.originator.playbackRate < -1) {
			this.displayPopup("Rewind");
		} else if (inEvent.originator.playbackRate == 1) {
			this.displayPopup("Play");
		}
	},
	loadAudio: function(inIndex) {
		this.$.audio.setSrc(this.sounds[inIndex]);
		this.$.button.setContent("Play");
	},
	playAudio: function() {
		this.$.audio.play();
		this.$.button.setContent("Pause");
	},
	pauseAudio: function() {
		this.$.audio.pause();
		this.$.button.setContent("Play");
	},
	togglePlay: function(inSender, inResponse) {
		if (this.$.audio.getPaused()) {
			this.playAudio();
		} else {
			this.pauseAudio();
		}
	},
	buttonRewindTapped: function(inSender, inEvent) {
		this.$.audio.rewind();
	},
	buttonFastForwardTapped: function(inSender, inEvent) {
		this.$.audio.fastForward();
	},
	buttonJumpBackwardTapped: function(inSender, inEvent) {
		this.$.audio.jumpBackward();
		this.displayPopup("Jump Backward " + this.$.audio.getJumpSec() + "s");
	},
	buttonJumpForwardTapped: function(inSender, inEvent) {
		this.$.audio.jumpForward();
		this.displayPopup("Jump Forward " + this.$.audio.getJumpSec() + "s");
	},
	buttonLoopTapped: function(inSender, inEvent) {
		this.$.audio.setLoop(!this.$.audio.getLoop());
		this.displayPopup("Looping " + (this.$.audio.getLoop() ? "Enabled" : "Disabled"));
	},
	rateChanged: function(inSender, inEvent) {
		this.displayPopup("Playback " + inEvent.playbackRate + "x");
	},
	timeChanged: function(inSender, inEvent) {
		this.$.results.setContent("Duration: " + Math.floor(inEvent.duration) + "s, Current Position: " + Math.floor(inEvent.currentTime) + "s");
	},
	selectChanged: function(inSender, inEvent) {
		this.loadAudio(inSender.selected);
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