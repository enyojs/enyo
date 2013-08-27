/**
	_enyo.Media_ implements an HTML 5 Media element. It is not intended to
	be used directly, but serves as the base kind for [enyo.Audio](#enyo.Audio)
	and [enyo.Video](#enyo.Video).
*/
enyo.kind({
	name: "enyo.Media",
	//* @public
	published: {
		//* URL of the sound file to play; may be relative to the application HTML file
		src: "",
		//* If true, media will automatically start playback when loaded
		autoplay: false,
		//* The desired speed at which the media resource is to play
		defaultPlaybackRate: 1.0,
		//* The effective playback rate
		playbackRate: 1.0,
		//* Indicates how data should be preloaded, reflecting the preload HTML attribute (none, metadata, auto)
		preload: "none",
		//* If true, media playback restarts from beginning when finished
		loop: false,
		//* If true, media playback is muted
		muted: false,
		//* If true, default media controls are shown
		showControls: false,
		//* Current playback volume, as a number in the range from 0.0 to 1.0
		volume: 1.0
	},
	events: {
		/**
			Fires when element stops fetching media data before it is completely
			downloaded, but not due to an error.
		*/
		onAbort: "",
		/**
			Fires when element can resume playback of the media data, but may need to
			stop for further buffering of content.
		*/
		onCanPlay: "",
		/**
			Fires when element can resume playback of the media data without needing
			to stop for further buffering of content.
		*/
		onCanPlayThrough: "",
		//* Fires when the duration attribute has been changed.
		onDurationChange: "",
		//* Fires when networkState switches to NETWORK_EMPTY from another state.
		onEmptied: "",
		//* Fires when media playback finishes normally.
		onEnded: "",
		//* Fires when an error occurs while fetching media data.
		onError: "",
		//* Fires when the media data is rendered.
		onLoadedData: "",
		/**
			Fires when the media duration and dimensions of the media resource/text
			tracks are ready.
		*/
		onLoadedMetaData: "",
		//* Fires when the media element begins looking for media data.
		onLoadStart: "",
		//* Fires when playback is paused.
		onPause: "",
		//* Fires when playback is no longer paused.
		onPlay: "",
		/**
			Fires when playback is ready to start after having been paused or delayed
			due to lack of media data.
		*/
		onPlaying: "",
		//* Fires when fetching media data.
		onProgress: "",
		/**
			Fires when either _this.defaultPlaybackRate_ or _this.playbackRate_ is
			updated.
		*/
		onRateChange: "",
		//* Fires when the seeking IDL attribute changes to false.
		onSeeked: "",
		//* Fires when the seeking IDL attribute changes to true.
		onSeeking: "",
		//* Fires when media fetching is interrupted.
		onStalled: "",
		//* Fires when the media controller position changes.
		onTimeUpdate: "",
		/** Fires when either _this.volume_ or _this.muted_ is updated.
		onVolumeChange: "",
		/**
			Fires when playback has stopped because the next frame is not available,
			but is expected to be.
		*/
		onWaiting: ""
	},
	//* @protected
	handlers: {
		onabort: "_abort",
		oncanplay: "_canPlay",
		oncanplaythrough: "_canPlayThrough",
		ondurationchange: "_durationChange",
		onemptied: "_emptied",
		onended: "_ended",
		onerror: "_error",
		onloadeddata: "_loadedData",
		onloadedmetadata: "_loadedMetaData",
		onloadstart: "_loadStart",
		onpause: "_pause",
		onplay: "_play",
		onplaying: "_playing",
		onprogress: "_progress",
		onratechange: "_rateChange",
		onseeked: "_seeked",
		onseeking: "_seeking",
		onstalled: "_stalled",
		ontimeupdate: "_timeUpdate",
		onvolumechange: "_volumeChange",
		onwaiting: "_waiting"
	},
	create: enyo.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.autoplayChanged();
			this.loopChanged();
			this.preloadChanged();
			this.showControlsChanged();
			this.srcChanged();
		};
	}),
	rendered: enyo.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			enyo.makeBubble(this, "abort");
			enyo.makeBubble(this, "canplay");
			enyo.makeBubble(this, "canplaythrough");
			enyo.makeBubble(this, "durationchange");
			enyo.makeBubble(this, "emptied");
			enyo.makeBubble(this, "ended");
			enyo.makeBubble(this, "error");
			enyo.makeBubble(this, "loadeddata");
			enyo.makeBubble(this, "loadedmetadata");
			enyo.makeBubble(this, "loadstart");
			enyo.makeBubble(this, "pause");
			enyo.makeBubble(this, "play");
			enyo.makeBubble(this, "playing");
			enyo.makeBubble(this, "progress");
			enyo.makeBubble(this, "ratechange");
			enyo.makeBubble(this, "seeked");
			enyo.makeBubble(this, "seeking");
			enyo.makeBubble(this, "stalled");
			enyo.makeBubble(this, "timeupdate");
			enyo.makeBubble(this, "volumechange");
			enyo.makeBubble(this, "waiting");
			this.defaultPlaybackRateChanged();
			this.mutedChanged();
			this.playbackRateChanged();
			this.volumeChanged();
		};
	}),
	srcChanged: function() {
		var path = enyo.path.rewrite(this.src);
		this.setAttribute("src", path);
		if (this.hasNode()) {
			this.node.load();
		}
	},
	autoplayChanged: function() {
		this.setAttribute("autoplay", this.autoplay ? "autoplay" : null);
	},
	loopChanged: function() {
		this.setAttribute("loop", this.loop ? "loop" : null);
	},
	mutedChanged: function() {
		this.setAttribute("muted", this.muted ? "muted" : null);
	},
	preloadChanged: function() {
		this.setAttribute("preload", this.preload);
	},
	defaultPlaybackRateChanged: function() {
		if (this.hasNode()) {
			this.node.defaultPlaybackRate = this.defaultPlaybackRate;
		}
	},
	playbackRateChanged: function() {
		if (this.hasNode()) {
			this.node.playbackRate = this.playbackRate;
		}
	},
	showControlsChanged: function() {
		this.setAttribute("controls", this.showControls ? "controls" : null);
	},
	volumeChanged: function() {
		if (this.hasNode()) {
			this.node.volume = this.volume;
		}
	},
	/**
		Called when element stops fetching media data before it has been completely
		downloaded, but not due to an error.
	*/
	_abort: function() {
		this.doEnded();
	},
	/**
		Called when element can resume playback of media data, but may need to stop
		for further buffering of content.
	*/
	_canPlay: function() {
		this.doCanPlay();
	},
	/**
		Called when element can resume playback of the media data without needing to
		stop for further buffering of content.
	*/
	_canPlayThrough: function() {
		this.doCanPlayThrough();
	},
	//* Called when the duration attribute has been changed.
	_durationChange: function() {
		this.doDurationChange();
	},
	//* Called when networkState switches to NETWORK_EMPTY from another state.
	_emptied: function() {
		this.doEmptied();
	},
	//* Called when playback reaches the end of the media data.
	_ended: function() {
		this.doEnded();
	},
	//* Called when an error occurs while fetching media data.
	_error: function() {
		this.doError();
	},
	/**
		Called when we can render the media data at the current playback position
		for the first time.
	*/
	_loadedData: function() {
		this.doLoadedData();
	},
	/**
		Called when the media duration and dimensions of the media resource/text
		tracks are ready.
	*/
	_loadedMetaData: function() {
		this.doLoadedMetaData();
	},
	//* Called when the media element begins looking for media data.
	_loadStart: function() {
		this.doLoadStart();
	},
	//* Called when playback is paused.
	_pause: function() {
		this.doPause();
	},
	//* Called when playback is no longer paused.
	_play: function() {
		this.doPlay();
	},
	/**
		Called when playback is ready to start after having been paused or delayed
		due to lack of media data.
	*/
	_playing: function() {
		this.doPlaying();
	},
	//* Called when the media element is fetching media data.
	_progress: function() {
		this.doProgress();
	},
	/**
		Called when either _this.defaultPlaybackRate_ or _this.playbackRate_ has
		been updated.
	*/
	_rateChange: function() {
		this.doRateChange();
	},
	//* Called when fetching of media data is interrupted.
	_stalled: function() {
		this.doStalled();
	},
	//* Called when the seeking IDL attribute changes to false.
	_seeked: function() {
		this.doSeeked();
	},
	//* Called when the seeking IDL attribute changes to true.
	_seeking: function() {
		this.doSeeking();
	},
	//* Called when the media controller position has changed.
	_timeUpdate: function() {
		this.doTimeUpdate();
	},
	//* Called when either _this.volume_ or _this.muted_ is updated.
	_volumeChange: function() {
		this.doVolumeChange();
	},
	/**
		Called when playback has stopped because the next frame is not available,
		but is expected to be.
	*/
	_waiting: function() {
		this.doWaiting();
	},
	//* @public
	//* Initiates playback of the media data referenced in _this.src_.
	play: function() {
		if (this.hasNode()) {
			this.node.play();
		}
	},
	//* Pauses media playback.
	pause: function() {
		if (this.hasNode()) {
			this.node.pause();
		}
	},
	//* Seeks to the specified value of _inValue_ (in seconds).
	seekTo: function(inValue) {
		if (this.hasNode()) {
			this.node.currentTime = inValue;
		}
	},
	//* Returns the ranges of the media source that have been buffered.
	getBuffered: function() {
		if (this.hasNode()) {
			return this.node.buffered;
		}
		return 0;
	},
	//* Returns the current playback position (in seconds).
	getCurrentTime: function() {
		if (this.hasNode()) {
			return this.node.currentTime;
		}
		return 0;
	},
	//* Returns the total duration time of the loaded media (in seconds).
	getDuration: function() {
		if (this.hasNode()) {
			return this.node.duration;
		}
		return 0;
	},
	//* Returns Boolean indicating whether the media element is paused.
	getPaused: function() {
		if (this.hasNode()) {
			return this.node.paused;
		}
	},
	//* Returns the ranges of the media source that have been played, if any.
	getPlayed: function() {
		if (this.hasNode()) {
			return this.node.played;
		}
	},
	//* Returns the readiness state of the media.
	getReadyState: function() {
		if (this.hasNode()) {
			return this.node.readyState;
		}
	},
	/**
		Returns the ranges of the media source that the user is able to seek to,
		if any.
	*/
	getSeekable: function() {
		if (this.hasNode()) {
			return this.node.seekable;
		}
	},
	/**
		Returns Boolean indicating whether the media is currently seeking to a new
		position.
	*/
	getSeeking: function() {
		if (this.hasNode()) {
			return this.node.seeking;
		}
	}
});
