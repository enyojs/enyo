/**
	_enyo.Video_ is a control that allows you to play video. It is an
	abstraction of HTML 5 Video.

	Initialize a video component as follows:

		{kind: "Video", src: "http://www.w3schools.com/html/movie.mp4"}

	To play a video, call `this.$.video.play()`.

	To get a reference to the actual HTML 5 Video element, call
	`this.$.video.hasNode()`.
*/
enyo.kind({
	name: "enyo.Video",
	kind: enyo.Control,
	published: {
		//* Source URL of the video file; may be relative to the application's HTML file
		src: "",
		//* Lets you specify multiple sources for the same video file
		sourceComponents: null,
		//* Source of image file to show when video isn't available
		poster: "",
		//* If true, controls for starting and stopping the video player are shown
		showControls: false,
		/**
			Determines how (or if) the video object is preloaded. Possible values:

			* "auto": Preload the video data as soon as possible.
			* "metadata": Preload only the video metadata.
			* "none": Do not preload any video data.
		*/
		preload: "metadata",
		//* If true, video will automatically start playing
		autoplay: false,
		/**
			If true, when playback is finished, video player will restart from the
			beginning
		*/
		loop: false,
		//* If true, video is stretched to fill the entire window (webOS only).
		fitToWindow: false,
		//* Video aspect ratio expressed as _width: height_
		aspectRatio: null,
		//* Number of seconds to jump forward or backward
		jumpSec: 30,
		//* Video playback rate
		playbackRate: 1,
		//* Mapping of playback rate names to playback rate values
		playbackRateHash: {
			fastForward: ["2", "4", "8", "16"],
			rewind: ["-2", "-4", "-8", "-16"],
			slowForward: ["1/4", "1/2", "1"],
			slowRewind: ["-1/2", "-1"]
		}
	},
	events: {
		//* Fires when _playbackRate_ is changed to an integer greater than 1.
		onFastforward: "",
		//* Fires when _playbackRate_ is changed to a value between 0 and 1.
		onSlowforward: "",
		//* Fires when _playbackRate_ is changed to an integer less than -1.
		onRewind: "",
		/**
			Fires when _playbackRate_ is changed to a value less than 0 but greater
			than or equal to -1.
		*/		
		onSlowrewind: "",
		//* Fires when _jumpForward()_ is called.
		onJumpForward: "",
		//* Fires when _jumpBackward()_ is called.
		onJumpBackward: "",
		//* Fires when _playbackRate_ is set to 1.
		onPlay: "",
		//* Fires when EventData is changed.
		onStart: ""
	},
	handlers: {
		//* Catch video _loadedmetadata_ event
		onloadedmetadata: "metadataLoaded",
		ontimeupdate: "timeupdate",
		onratechange: "ratechange",
		onplay: "_play"
	},
	tag: "video",
	//* @protected

	_playbackRateArray: null,
	_speedIndex: 0,

	create: function() {
		this.inherited(arguments);
		this.posterChanged();
		this.showControlsChanged();
		this.preloadChanged();
		this.autoplayChanged();
		this.loopChanged();
	},
	rendered: function() {
		this.inherited(arguments);
		this.hookupVideoEvents();
	},
	posterChanged: function() {
		if (this.poster) {
			var path = enyo.path.rewrite(this.poster);
			this.setAttribute("poster", path);
		}
		else {
			this.setAttribute("poster", null);
		}
	},
	showControlsChanged: function() {
		this.setAttribute("controls", this.showControls ? "controls" : null);
	},
	preloadChanged: function() {
		this.setAttribute("preload", this.preload ? this.preload : null);
	},
	autoplayChanged: function() {
		this.setAttribute("autoplay", this.autoplay ? "autoplay" : null);
		this._prevCommand = this.autoplay ? "play" : "pause";
	},
	loopChanged: function() {
		this.setAttribute("loop", this.loop ? "loop" : null);
	},
	fitToWindowChanged: function() {
		if (!this.hasNode()) {
			return;
		}
	},
	srcChanged: function() {
		// We override the inherited method from enyo.Control because
		// it prevents us from setting src to a falsy value.
		this.setAttribute("src", enyo.path.rewrite(this.src));
	},
	//* @public
	load: function() {
		if(this.hasNode()) { this.hasNode().load(); }
	},
	//* Unloads the current video source, stopping all playback and buffering.
	unload: function() {
		this.set("src", "");
		this.load();
	},
	//* Initiates playback of the media data.
	play: function() {
		if (!this.hasNode()) {
			return;
		}
		this._speedIndex = 0;
		this.setPlaybackRate(1);
		this.node.play();
		this._prevCommand = "play";
	},
	//* Pauses media playback.
	pause: function() {
		if (!this.hasNode()) {
			return;
		}
		this._speedIndex = 0;
		this.setPlaybackRate(1);
		this.node.pause();
		this._prevCommand = "pause";
	},
	//* Changes the playback speed via _this.selectPlaybackRate()_.
	fastForward: function() {
		var node = this.hasNode();

		if (!node) {
			return;
		}
		switch (this._prevCommand) {
		case "slowForward":
			if (this._speedIndex == this._playbackRateArray.length - 1) {
				// reached to the end of array => go to fastforward
				this.selectPlaybackRateArray("fastForward");
				this._speedIndex = 0;
				this._prevCommand = "fastForward";
			} else {
				this._speedIndex = this.clampPlaybackRate(this._speedIndex+1);
				this._prevCommand = "slowForward";
			}
			break;
		case "pause":
			this.selectPlaybackRateArray("slowForward");
			this._speedIndex = 0;
			if (this.isPaused()) {
				node.play();
			}
			this._prevCommand = "slowForward";
			break;
		case "rewind":
			var pbNumber = this.calcNumberValueOfPlaybackRate(this.playbackRate);
			if (pbNumber < 0) {
				this.selectPlaybackRateArray("slowForward");
				this._prevCommand = "slowForward";
			} else {
				this.selectPlaybackRateArray("fastForward");
				this._prevCommand = "fastForward";
			}
			this._speedIndex = 0;
			break;
		case "fastForward":
			this._speedIndex = this.clampPlaybackRate(this._speedIndex+1);
			this._prevCommand = "fastForward";
			break;
		default:
			this.selectPlaybackRateArray("fastForward");
			this._speedIndex = 0;
			this._prevCommand = "fastForward";
			break;
		}

		this.setPlaybackRate(this.selectPlaybackRate(this._speedIndex));

	},
	//* Changes the playback speed via _this.selectPlaybackRate()_.
	rewind: function() {
		var node = this.hasNode();

		if (!node) {
			return;
		}
		switch (this._prevCommand) {
		case "slowRewind":
			if (this._speedIndex == this._playbackRateArray.length - 1) {
				// reached to the end of array => go to rewind
				this.selectPlaybackRateArray("rewind");
				this._speedIndex = 0;
				this._prevCommand = "rewind";
			} else {
				this._speedIndex = this.clampPlaybackRate(this._speedIndex+1);
				this._prevCommand = "slowRewind";
			}
			break;
		case "pause":
			this.selectPlaybackRateArray("slowRewind");
			this._speedIndex = 0;
			if (this.isPaused() && this.node.duration > this.node.currentTime) {
				node.play();
			}
			this._prevCommand = "slowRewind";
			break;
		case "rewind":
			this._speedIndex = this.clampPlaybackRate(this._speedIndex+1);
			this._prevCommand = "rewind";
			break;
		default:
			this.selectPlaybackRateArray("rewind");
			this._speedIndex = 0;
			this._prevCommand = "rewind";
			break;
		}


		this.setPlaybackRate(this.selectPlaybackRate(this._speedIndex));
	},
	//* Jumps backward _jumpSec_ seconds from the current time.
	jumpBackward: function() {
		var node = this.hasNode();

		if (!node) {
			return;
		}

		this.setPlaybackRate(1);
		node.currentTime -= this.jumpSec;
		this._prevCommand = "jumpBackward";

		this.doJumpBackward(enyo.mixin(this.createEventData(), {jumpSize: this.jumpSec}));
	},
	//* Jumps forward _jumpSec_ seconds from the current time.
	jumpForward: function() {
		var node = this.hasNode();

		if (!node) {
			return;
		}

		this.setPlaybackRate(1);
		node.currentTime += this.jumpSec;
		this._prevCommand = "jumpForward";

		this.doJumpForward(enyo.mixin(this.createEventData(), {jumpSize: this.jumpSec}));
	},
	//* Jumps to beginning of media source and sets _playbackRate_ to 1.
	jumpToStart: function() {
		var node = this.hasNode();

		if (!node) {
			return;
		}

		this.setPlaybackRate(1);
		node.pause();
		node.currentTime = 0;
		this._prevCommand = "jumpToStart";
	},
	//* Jumps to end of media source and sets _playbackRate_ to 1.
	jumpToEnd: function() {
		var node = this.hasNode();

		if (!node) {
			return;
		}

		this.setPlaybackRate(1);
		node.pause();
		node.currentTime = this.node.duration;
		this._prevCommand = "jumpToEnd";
	},
	//* Sets the playback rate type (from the keys of _playBackRateHash_).
	selectPlaybackRateArray: function(cmd) {
		this._playbackRateArray = this.playbackRateHash[cmd];
	},
	//* Changes _playbackRate_ when initiating fast forward or rewind.
	clampPlaybackRate: function(index) {
		if (!this._playbackRateArray) {
			return;
		}

		return index % this._playbackRateArray.length;
	},
	//* Returns the playback rate name for the passed-in index.
	selectPlaybackRate: function(index) {
		return this._playbackRateArray[index];
	},
	//* Sets _playbackRate_ according to passed-in string.
	setPlaybackRate: function(inPlaybackRate) {
		var node = this.hasNode(),
			pbNumber
		;

		if (!node) {
			return;
		}

		// Stop rewind (if happenning)
		this.stopRewindJob();

		// Make sure inPlaybackRate is a string
		this.playbackRate = inPlaybackRate = String(inPlaybackRate);
		pbNumber = this.calcNumberValueOfPlaybackRate(inPlaybackRate);

		// Set native playback rate
		node.playbackRate = pbNumber;

		if (!(enyo.platform.webos || window.PalmSystem)) {
			// For supporting cross browser behavior
			if (pbNumber < 0) {
				this.beginRewind();
			}
		}
	},
	//* Returns true if currently in paused state.
	isPaused: function() {
		return this.hasNode() ? this.hasNode().paused : true;
	},
	//* Returns current player position in the video (in seconds).
	getCurrentTime: function() {
		return this.hasNode() ? this.hasNode().currentTime : 0;
	},
	//* Returns buffered time range.
	getBufferedTimeRange: function() {
		return this.hasNode() ? this.hasNode().buffered : 0;
	},
	//* Sets current player position in the video (in seconds).
	setCurrentTime: function(inTime) {
		if ((typeof inTime === 'number') && this.hasNode()) {
			this.node.currentTime = inTime;
		}
	},
	//* Gets play duration in the video (in seconds).
	getDuration: function() {
		return this.hasNode() ? this.hasNode().duration : 0;
	},
	//* Gets readyState (0-4).
	getReadyState: function() {
		return this.hasNode() ? this.hasNode().readyState : -1;
	},
	//* Gets seeking status.
	getSeeking: function() {
		return this.hasNode() ? this.hasNode().seeking : -1;
	},

	//* @protected

	//* Custom rewind functionality until browsers support negative playback rate
	beginRewind: function() {
		this.node.pause();
		this.startRewindJob();
	},
	//* Calculate the time that has elapsed since
	_rewind: function() {
		var now = enyo.now(),
			distance = now - this.rewindBeginTime,
			pbRate = this.calcNumberValueOfPlaybackRate(this.playbackRate),
			adjustedDistance = Math.abs(distance * pbRate) / 1000,
			newTime = this.getCurrentTime() - adjustedDistance
		;

		this.setCurrentTime(newTime);
		this.startRewindJob();
	},
	//* Start rewind job
	startRewindJob: function() {
		this.rewindBeginTime = enyo.now();
		enyo.job(this.id + "rewind", this.bindSafely("_rewind"), 100);
	},
	//* Stop rewind job
	stopRewindJob: function() {
		enyo.job.stop(this.id + "rewind");
	},
	// Calc number value of inPlaybackRate (support for fractions)
	calcNumberValueOfPlaybackRate: function(inPlaybackRate) {
		var pbArray = String(inPlaybackRate).split("/");
		return (pbArray.length > 1) ? parseInt(pbArray[0], 10) / parseInt(pbArray[1], 10) : parseInt(inPlaybackRate, 10);
	},
	//* When we get the video metadata, update _this.aspectRatio_
	metadataLoaded: function(inSender, inEvent) {
		var node = this.hasNode();
		this.setAspectRatio("none");
		if (!node || !node.videoWidth || !node.videoHeight) {
			return;
		}
		this.setAspectRatio(node.videoWidth/node.videoHeight+":1");
		inEvent = enyo.mixin(inEvent, this.createEventData());
	},
	timeupdate: function(inSender, inEvent) {
		var node = this.hasNode();

		if (!node) {
			return;
		}
		inEvent = enyo.mixin(inEvent, this.createEventData());
	},
	ratechange: function(inSender, inEvent) {
		var node = this.hasNode(),
			pbNumber
		;

		if (!node) {
			return;
		}

		inEvent = enyo.mixin(inEvent, this.createEventData());

		pbNumber = this.calcNumberValueOfPlaybackRate(inEvent.playbackRate);

		if (pbNumber > 0 && pbNumber < 1) {
			this.doSlowforward(inEvent);
		} else if (pbNumber > 1) {
			this.doFastforward(inEvent);
		} else if (pbNumber < 0 && pbNumber >= -1) {
			this.doSlowrewind(inEvent);
		} else if (pbNumber < -1) {
			this.doRewind(inEvent);
		} else if (pbNumber == 1) {
			this.doPlay(inEvent);
		}
	},
	createEventData: function() {
		var node = this.hasNode();

		if (!node) {
			return {};
		}
		if (node.currentTime === 0) {
			this.doStart();
		}
		return {
			srcElement: node,
			duration: node.duration,
			currentTime: node.currentTime,
			playbackRate: this.getPlaybackRate()
		};
	},
	//* Emit _onPlay_ event (to normalize enyo-generated _onPlay_ events)
	_play: function(inSender, inEvent) {
		var node = this.hasNode();

		if (!node) {
			return;
		}

		inEvent = enyo.mixin(inEvent, this.createEventData());

		this.doPlay(inEvent);
	},
	//* Add all html5 video events
	hookupVideoEvents: function() {
		enyo.makeBubble(this,
			"loadstart",
			"emptied",
			"canplaythrough",
			"ended",
			"ratechange",
			"progress",
			"stalled",
			"playing",
			"durationchange",
			"volumechange",
			"suspend",
			"loadedmetadata",
			"waiting",
			"timeupdate",
			"abort",
			"loadeddata",
			"seeking",
			"play",
			"error",
			"canplay",
			"seeked",
			"pause"
		);
	}
});

