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
		//* source URL of the video file, can be relative to the application's HTML file
		src: "",
		//* Specify multiple sources for the same video file
		sourceComponents: null,
		//* source of image file to show when video isn't available
		poster: "",
		//* if true, show controls for starting and stopping video player
		showControls: false,
		/**
			This value determines if/how the video object should preload. Possible values:
				auto: preload the video data as soon as possible.
				metadata: preload only the video metadata.
				none: do not preload any video data.
		*/
		preload: "metadata",
		//* if true, video will automatically start
		autoplay: false,
		//* if true, restart video player from beginning when finished
		loop: false,
		//* (webOS only) if true, stretch the video to fill the entire window
		fitToWindow: false,
		//* Video aspect ratio in the format _width:height_
		aspectRatio: null,
		//* jump forward or backward time in seconds
		jumpSec: 30,
		//* set video playbackRate
		playbackRate: 1,
		//* Hash of playbackRate you can set this hash by
		//* playbackRateHash: {
		//*		fastForward: ["2", "4", "8", "16"],
		//*		rewind: ["-2", "-4", "-8", "-16"],
		//*		slowForward: ["1/4", "1/2"],
		//*		slowRewind: ["-1/2", "-1"]
		//*	}
		playbackRateHash: {
			fastForward: ["2", "4", "8", "16"],
			rewind: ["-2", "-4", "-8", "-16"],
			slowForward: ["1/4", "1/2", "1"],
			slowRewind: ["-1/2", "-1"]
		}
	},
	events: {
		onFastforward: "",
		onSlowforward: "",
		onRewind: "",
		onSlowrewind: "",
		onJumpForward: "",
		onJumpBackward: "",
		onPlay: "",
		onStart: "",
		onDisableTranslation: ""
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
		// FIXME: transforms and HW acceleration (applied by panels) currently kills video on webOS
		if (true || enyo.platform.webos === 4) {
			this.doDisableTranslation();
		}
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
	//* Unload the current video source, stopping all playback and buffering.
	unload: function() {
		this.set("src", "");
		this.load();
	},
	play: function() {
		if (!this.hasNode()) {
			return;
		}
		this.setPlaybackRate(1);
		this.node.play();
		this._prevCommand = "play";
	},
	pause: function() {
		if (!this.hasNode()) {
			return;
		}
		this.setPlaybackRate(1);
		this.node.pause();
		this._prevCommand = "pause";
	},
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
	selectPlaybackRateArray: function(cmd) {
		this._playbackRateArray = this.playbackRateHash[cmd];
	},
	clampPlaybackRate: function(index) {
		if (!this._playbackRateArray) {
			return;
		}

		return index % this._playbackRateArray.length;
	},
	selectPlaybackRate: function(index) {
		return this._playbackRateArray[index];
	},
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
	//* Return true if currently in paused state
	isPaused: function() {
		return this.hasNode() ? this.hasNode().paused : true;
	},
	//* Return current player position in the video (in seconds)
	getCurrentTime: function() {
		return this.hasNode() ? this.hasNode().currentTime : 0;
	},
	//* Return buffered time ranges
	getBufferedTimeRange: function() {
		return this.hasNode() ? this.hasNode().buffered : 0;
	},
	//* Set current player position in the video (in seconds)
	setCurrentTime: function(inTime) {
		if ((typeof inTime === 'number') && this.hasNode()) {
			this.node.currentTime = inTime;
		}
	},
	//* Get play duration in the video (in seconds)
	getDuration: function() {
		return this.hasNode() ? this.hasNode().duration : 0;
	},
	//* Get readyState (0~4)
	getReadyState: function() {
		return this.hasNode() ? this.hasNode().readyState : -1;
	},
	//* Get seeking status
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
		// Fixme: Do not reach to this code on TV
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

