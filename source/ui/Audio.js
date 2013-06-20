/**
	_enyo.Audio_ implements an HTML audio element.

		{kind: "enyo.Audio"}
*/
enyo.kind({
	name: "enyo.Audio",
	tag: "audio",
	//* @public
	published: {
		//* URL of the sound file to play, can be relative to the application HTML file
		src: "",
		//* Audio format of sound file
		type: "audio/mpeg",
		//* Indicates what data should be preloaded, reflecting the preload HTML attribute
		preload: true
	},
	events: {
		//* Fires when the audio finishes normally
		onEnded: ""
	},
	//* Flag that reflects the playing state
	isPlaying: false,
	//* @protected
	handlers: {
		onended: "ended"
	},
	components: [
		{name: "source", tag: "source"}
	],
	create: function() {
		this.inherited(arguments);
		this.srcChanged();
		this.preloadChanged();
		this.setAttribute("onended", enyo.bubbler);
	},
	srcChanged: function() {
		if (this.isPlaying) {
			this.pause();
		}
		var path = enyo.path.rewrite(this.src);
		this.$.source.setAttribute("src", path);
		this.$.source.setAttribute("type", this.type);
		if (this.hasNode()) {
			this.node.load();
		}
	},
	preloadChanged: function() {
		this.setAttribute("autobuffer", this.preload ? "autobuffer" : null);
		this.setAttribute("preload", this.preload ? "preload" : null);
	},
	//* When audio playback reaches the end of the media
	ended: function() {
		this.isPlaying = false;
		this.doEnded();
	},
	//* @public
	//* Initiates playback of the audio referenced in _this.src_
	play: function() {
		if (this.hasNode()) {
			this.node.play();
			this.isPlaying = true;
		}
	},
	//* Pauses the audio playback
	pause: function() {
		if (this.hasNode()) {
			this.node.pause();
			this.isPlaying = false;
		}
	},
	//* Seeks to the specified value of _inValue_, in seconds
	seekTo: function(inValue) {
		if (this.hasNode()) {
			this.node.currentTime = inValue;
		}
	},
	//* Retrieves the current time of the playback position, in seconds
	getCurrentTime: function() {
		if (this.hasNode()) {
			return Math.floor(this.node.currentTime);
		}
	},
	//* Retrieves the total duration time, in seconds, of the loaded media
	getDuration: function() {
		if (this.hasNode()) {
			return Math.floor(this.node.duration);
		}
	}
});
