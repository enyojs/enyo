require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Video~Video} kind.
* @module enyo/Video
*/

var
	kind = require('./kind'),
	dispatcher = require('./dispatcher'),
	path = require('./path'),
	platform = require('./platform'),
	utils = require('./utils');
var
	Control = require('./Control'),
	MediaSource = require('./MediaSource'),
	Job = require('./job');

/**
* Fires when [playbackRate]{@link module:enyo/Video~Video#playbackRate} is changed to an integer greater than `1`.
*
* @event module:enyo/Video~Video#onFastforward
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when [playbackRate]{@link module:enyo/Video~Video#playbackRate} is changed to a value between `0` and `1`.
*
* @event module:enyo/Video~Video#onSlowforward
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when [playbackRate]{@link module:enyo/Video~Video#playbackRate} is changed to an integer less than `-1`.
*
* @event module:enyo/Video~Video#onRewind
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when [playbackRate]{@link module:enyo/Video~Video#playbackRate} is changed to a value less than `0`
* but greater than or equal to `-1`.
*
* @event module:enyo/Video~Video#onSlowrewind
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when [jumpForward()]{@link module:enyo/Video~Video#jumpForward} is called.
*
* @event module:enyo/Video~Video#onJumpForward
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when [jumpBackward()]{@link module:enyo/Video~Video#jumpBackward} is called.
*
* @event module:enyo/Video~Video#onJumpBackward
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when EventData is changed.
*
* @event module:enyo/Video~Video#onPlay
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when the [image]{@link module:enyo/Image~Image} has loaded.
*
* @event module:enyo/Video~Video#onStart
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* {@link module:enyo/Video~Video} is a [control]{@link module:enyo/Control~Control} that allows you to play video.
* It is an abstraction of HTML 5 [Video]{@glossary video}.
*
* Initialize a video [component]{@link module:enyo/Component~Component} as follows:
*
* ```
* {kind: 'Video', src: 'http://www.w3schools.com/html/movie.mp4'}
* ```
* 
* To play a video, call `this.$.video.play()`.
* 
* To get a reference to the actual HTML 5 Video element, call `this.$.video.hasNode()`.
*
* @class Video
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:enyo/Video~Video.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.Video',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	published: 
		/** @lends module:enyo/Video~Video.prototype */ {

		/**
		* Source URL of the video file; may be relative to the application's HTML file.
		* 
		* @type {String}
		* @default ''
		* @public
		*/
		src: '',

		/**
		* An [object]{@glossary Object} that may be used to specify multiple sources for the
		* same video file.
		* 
		* @type {Object}
		* @default null
		* @public
		*/
		sourceComponents: null,

		/**
		* Source of image file to show when video is not available.
		* 
		* @type {String}
		* @default ''
		* @public
		*/
		poster: '',

		/**
		* If `true`, controls for starting and stopping the video player are shown.
		* 
		* @type {Boolean}
		* @default false
		* @public
		*/
		showControls: false,

		/**
		* Determines how (or whether) the {@link module:enyo/Video~Video} object is preloaded.
		* Possible values:
		* - `'auto'`: Preload the video data as soon as possible.
		* - `'metadata'`: Preload only the video metadata.
		* - `'none'`: Do not preload any video data.
		* 
		* @type {String}
		* @default 'metadata'
		* @public
		*/
		preload: 'metadata',

		/**
		* If `true`, video will automatically start playing.
		* 
		* @type {Boolean}
		* @default false
		* @public
		*/
		autoplay: false,

		/**
		* If `true`, when playback is finished, the video player will restart from
		* the beginning.
		* 
		* @type {Boolean}
		* @default false
		* @public
		*/
		loop: false,

		/**
		* If `true`, video will be stretched to fill the entire window (webOS only).
		* 
		* @type {Boolean}
		* @default false
		* @public
		*/
		fitToWindow: false,

		/**
		* The video aspect ratio, expressed as `width:height`.
		* 
		* @type {Number}
		* @default 0
		* @public
		*/
		aspectRatio: null,

		/**
		* Number of seconds to jump forward or backward.
		* 
		* @type {Number}
		* @default 30
		* @public
		*/
		jumpSec: 30,

		/**
		* Video playback rate.
		* 
		* @type {Number}
		* @default 1
		* @public
		*/
		playbackRate: 1,

		/**
		* Mapping of playback rate names to playback rate values that may be set.
		* ```
		* {
		*	fastForward: ['2', '4', '8', '16'],
		*	rewind: ['-2', '-4', '-8', '-16'],
		*	slowForward: ['1/4', '1/2', '1'],
		*	slowRewind: ['-1/2', '-1']
		* }
		* ```
		* 
		* @type {Object}
		* @default {
		*	fastForward: ['2', '4', '8', '16'],
		*	rewind: ['-2', '-4', '-8', '-16'],
		*	slowForward: ['1/4', '1/2'],
		*	slowRewind: ['-1/2', '-1']
		* }
		* @public
		*/
		playbackRateHash: {
			fastForward: ['2', '4', '8', '16'],
			rewind: ['-2', '-4', '-8', '-16'],
			slowForward: ['1/4', '1/2'],
			slowRewind: ['-1/2', '-1']
		}
	},

	/**
	* @private
	*/
	events: {
		onFastforward: '',
		onSlowforward: '',
		onRewind: '',
		onSlowrewind: '',
		onJumpForward: '',
		onJumpBackward: '',
		onPlay: '',
		onStart: ''
	},

	/**
	* @private
	*/
	handlers: {
		//* Catch video _loadedmetadata_ event
		onloadedmetadata: 'metadataLoaded',
		ontimeupdate: 'timeupdate',
		onratechange: 'ratechange',
		onplay: '_play',
		onChangeSource: 'load'
	},

	/**
	* @private
	*/
	observers: {
		updateSource: ['src', 'sourceComponents']
	},

	/**
	* @private
	*/
	tag: 'video',

	defaultKind: MediaSource,

	/**
	* @private
	*/
	_playbackRateArray: null,

	/**
	* @private
	*/
	_speedIndex: 0,

	/**
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.posterChanged();
			this.showControlsChanged();
			this.preloadChanged();
			this.autoplayChanged();
			this.loopChanged();
			// If no source has be specified, <source> elements may have been added directly
			// to the components block so skip updating sources to avoid erasing those
			// components.
			if(this.src || this.sourceComponents) {
				this.updateSource();
			}
		};
	}),

	/**
	* @method
	* @private
	*/
	rendered: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.hookupVideoEvents();
		};
	}),

	/**
	* @method
	* @private
	*/
	updateSource: function (old, value, source) {
		var src = this.get('src');
		var sources = this.get('sourceComponents');

		// if called due to a property change, clear the other property
		if(source === 'src' || (!source && src)) {
			this.sourceComponents = null;
			sources = [{src: src}];
		} else if(source === 'sourceComponents' || (!source && sources)) {
			src = this.src = '';
			if (!!this.getAttribute('src')) {
				this.setAttribute('src', '');
			}
		}

		// Always wipe out any previous sources before setting src or new sources
		this.destroyClientControls();
		if(sources) {
			this.createComponents(sources);
			if(this.hasNode()) {
				this.render();
			}
		}

		this.load();
	},

	/**
	* @private
	*/
	posterChanged: function () {
		if (this.poster) {
			var p = path.rewrite(this.poster);
			this.setAttribute('poster', p);
		}
		else {
			this.setAttribute('poster', null);
		}
	},

	/**
	* @private
	*/
	showControlsChanged: function () {
		this.setAttribute('controls', this.showControls ? 'controls' : null);
	},

	/**
	* @private
	*/
	preloadChanged: function () {
		this.setAttribute('preload', this.preload ? this.preload : null);
	},

	/**
	* @private
	*/
	autoplayChanged: function () {
		this.setAttribute('autoplay', this.autoplay ? 'autoplay' : null);
		this._prevCommand = this.autoplay ? 'play' : 'pause';
	},

	/**
	* @private
	*/
	loopChanged: function () {
		this.setAttribute('loop', this.loop ? 'loop' : null);
	},

	/**
	* @private
	*/
	fitToWindowChanged: function () {
		if (!this.hasNode()) {
			return;
		}
	},
	
	/**
	* Loads the current video [source]{@link module:enyo/Video~Video#src}.
	* 
	* @public
	*/
	load: function () {
		if(this.hasNode()) { this.hasNode().load(); }
	},

	/**
	* Unloads the current video [source]{@link module:enyo/Video~Video#src}, stopping all
	* playback and buffering.
	* 
	* @public
	*/
	unload: function() {
		this.src ='';
		this.sourceComponents = null;
		this.setAttribute('src', '');
		this.destroyClientControls();
		this.load();
	},

	/**
	* Initiates playback of the video data.
	* 
	* @public
	*/
	play: function () {
		if (!this.hasNode()) {
			return;
		}
		this._speedIndex = 0;
		this.setPlaybackRate(1);
		this.node.play();
		this._prevCommand = 'play';
	},

	/**
	* Pauses video playback.
	* 
	* @public
	*/
	pause: function () {
		if (!this.hasNode()) {
			return;
		}
		this._speedIndex = 0;
		this.setPlaybackRate(1);
		this.node.pause();
		this._prevCommand = 'pause';
	},

	/**
	* Changes the playback speed via [selectPlaybackRate()]{@link module:enyo/Video~Video#selectPlaybackRate}.
	*
	* @public
	*/
	fastForward: function () {
		var node = this.hasNode(),
			isNeedPlay = false;

		if (!node) {
			return;
		}
		switch (this._prevCommand) {
		case 'slowForward':
			if (this._speedIndex == this._playbackRateArray.length - 1) {
				// reached to the end of array => go to play
				this.play();
				return;
			} else {
				this._speedIndex = this.clampPlaybackRate(this._speedIndex+1);
			}
			break;
		case 'pause':
			this.selectPlaybackRateArray('slowForward');
			this._speedIndex = 0;
			if (this.isPaused()) {
				isNeedPlay = true;
			}
			this._prevCommand = 'slowForward';
			break;
		case 'rewind':
			node.play();
			this.selectPlaybackRateArray('fastForward');
			this._prevCommand = 'fastForward';
			this._speedIndex = 0;
			break;
		case 'slowRewind':
			this.selectPlaybackRateArray('slowForward');
			this._prevCommand = 'slowForward';
			this._speedIndex = 0;
			break;
		case 'fastForward':
			this._speedIndex = this.clampPlaybackRate(this._speedIndex+1);
			this._prevCommand = 'fastForward';
			break;
		default:
			this.selectPlaybackRateArray('fastForward');
			this._speedIndex = 0;
			this._prevCommand = 'fastForward';
			break;
		}

		this.setPlaybackRate(this.selectPlaybackRate(this._speedIndex));

		isNeedPlay && node.play();
	},

	/**
	* Changes the playback speed via [selectPlaybackRate()]{@link module:enyo/Video~Video#selectPlaybackRate}.
	* 
	* @public
	*/
	rewind: function () {
		var node = this.hasNode(),
		isNeedPlay = false;
		if (!node) {
			return;
		}
		switch (this._prevCommand) {
		case 'slowRewind':
			if (this._speedIndex == this._playbackRateArray.length - 1) {
				// reached to the end of array => go to rewind
				this.selectPlaybackRateArray('rewind');
				this._speedIndex = 0;
				this._prevCommand = 'rewind';
			} else {
				this._speedIndex = this.clampPlaybackRate(this._speedIndex+1);
			}
			break;
		case 'fastForward':
			this.selectPlaybackRateArray('rewind');
			this._prevCommand = 'rewind';
			this._speedIndex = 0;
			break;
		case 'slowForward':
			this.selectPlaybackRateArray('slowRewind');
			this._prevCommand = 'slowRewind';
			this._speedIndex = 0;
			break;
		case 'pause':
			this.selectPlaybackRateArray('slowRewind');
			this._speedIndex = 0;
			if (this.isPaused() && this.node.duration > this.node.currentTime) {
				isNeedPlay = true;
			}
			this._prevCommand = 'slowRewind';
			break;
		case 'rewind':
			this._speedIndex = this.clampPlaybackRate(this._speedIndex+1);
			this._prevCommand = 'rewind';
			break;
		default:
			this.selectPlaybackRateArray('rewind');
			this._speedIndex = 0;
			this._prevCommand = 'rewind';
			break;
		}


		this.setPlaybackRate(this.selectPlaybackRate(this._speedIndex));

		isNeedPlay && node.play();
	},

	/**
	* Jumps backward [jumpSec]{@link module:enyo/Video~Video#jumpSec} seconds from the current time.
	*
	* @fires module:enyo/Video~Video#doJumpBackward
	* @public
	*/
	jumpBackward: function () {
		var node = this.hasNode(),
			oldPlaybackRateNumber;

		if (!node) {
			return;
		}

		oldPlaybackRateNumber = this.calcNumberValueOfPlaybackRate(this.playbackRate);

		this.setPlaybackRate(1);
		node.currentTime -= this.jumpSec;
		this._prevCommand = 'jumpBackward';

		if(oldPlaybackRateNumber < 0) {
			this.node.play();
		}

		this.doJumpBackward(utils.mixin(this.createEventData(), {jumpSize: this.jumpSec}));
	},

	/**
	* Jumps forward [jumpSec]{@link module:enyo/Video~Video#jumpSec} seconds from the current time.
	*
	* @fires module:enyo/Video~Video#doJumpForward
	* @public
	*/
	jumpForward: function () {
		var node = this.hasNode(),
			oldPlaybackRateNumber;

		if (!node) {
			return;
		}

		oldPlaybackRateNumber = this.calcNumberValueOfPlaybackRate(this.playbackRate);

		this.setPlaybackRate(1);

		if(oldPlaybackRateNumber < 0) {
			this.node.play();	// Play before skip so video won't restart
		}

		node.currentTime += parseInt(this.jumpSec, 10);
		this._prevCommand = 'jumpForward';

		this.doJumpForward(utils.mixin(this.createEventData(), {jumpSize: this.jumpSec}));
	},

	/**
	* Jumps to beginning of media [source]{@link module:enyo/Video~Video#src} and sets 
	* [playbackRate]{@link module:enyo/Video~Video#playbackRate} to `1`.
	* 
	* @public
	*/
	jumpToStart: function () {
		var node = this.hasNode();

		if (!node) {
			return;
		}

		this.setPlaybackRate(1);
		node.pause();
		node.currentTime = 0;
		this._prevCommand = 'jumpToStart';
	},

	/**
	* Jumps to end of media [source]{@link module:enyo/Video~Video#src} and sets 
	* [playbackRate]{@link module:enyo/Video~Video#playbackRate} to `1`.
	* 
	* @public
	*/
	jumpToEnd: function () {
		var node = this.hasNode();

		if (!node) {
			return;
		}

		this.setPlaybackRate(1);
		node.pause();
		node.currentTime = this.node.duration;
		this._prevCommand = 'jumpToEnd';
	},

	/**
	* Sets the playback rate type (from the [keys]{@glossary Object.keys} of 
	* [playbackRateHash]{@link module:enyo/Video~Video#playbackRateHash}).
	*
	* @param {String} cmd - Key of the playback rate type.
	* @public
	*/
	selectPlaybackRateArray: function (cmd) {
		this._playbackRateArray = this.playbackRateHash[cmd];
	},

	/**
	* Changes [playbackRate]{@link module:enyo/Video~Video#playbackRate} to a valid value when initiating 
	* fast forward or rewind.
	*
	* @param {Number} idx - The index of the desired playback rate.
	* @public
	*/
	clampPlaybackRate: function (idx) {
		if (!this._playbackRateArray) {
			return;
		}

		return idx % this._playbackRateArray.length;
	},

	/**
	* Retrieves the playback rate name.
	*
	* @param {Number} idx - The index of the desired playback rate.
	* @returns {String} The playback rate name.
	* @public
	*/
	selectPlaybackRate: function (idx) {
		return this._playbackRateArray[idx];
	},

	/**
	* Sets [playbackRate]{@link module:enyo/Video~Video#playbackRate}.
	* 
	* @param {String} rate - The desired playback rate.
	* @public
	*/
	setPlaybackRate: function (rate) {
		var node = this.hasNode(),
			pbNumber;

		if (!node) {
			return;
		}

		// Stop rewind (if happenning)
		this.stopRewindJob();

		// Make sure rate is a string
		this.playbackRate = rate = String(rate);
		pbNumber = this.calcNumberValueOfPlaybackRate(rate);

		// Set native playback rate
		node.playbackRate = pbNumber;

		if (!(platform.webos || global.PalmSystem)) {
			// For supporting cross browser behavior
			if (pbNumber < 0) {
				this.beginRewind();
			}
		}
	},

	/**
	* Determines whether playback is in the paused state.
	*
	* @returns {Boolean} `true` if paused; otherwise, `false`.
	* @public
	*/
	isPaused: function () {
		return this.hasNode() ? this.hasNode().paused : true;
	},

	/**
	* Determines the current player position in the video.
	*
	* @returns {Number} The current player position in seconds.
	* @public
	*/
	getCurrentTime: function () {
		return this.hasNode() ? this.hasNode().currentTime : 0;
	},

	/**
	* Determines the buffered [time range]{@glossary TimeRanges}.
	*
	* @returns {TimeRanges} The buffered [time range]{@glossary TimeRanges}.
	* @public
	*/
	getBufferedTimeRange: function () {
		return this.hasNode() ? this.hasNode().buffered : 0;
	},

	/**
	* Sets the current player position in the video.
	*
	* @param {Number} time - The position (in seconds) to which the player should be set.
	* @public
	*/
	setCurrentTime: function (time) {
		if ((typeof time === 'number') && this.hasNode()) {
			this.node.currentTime = time;
		}
	},

	/**
	* Determines the play duration in the video.
	*
	* @returns {Number} The play duration in seconds.
	* @public
	*/
	getDuration: function () {
		return this.hasNode() ? this.hasNode().duration : 0;
	},

	/**
	* Determines the [readyState]{@glossary readyState} of the video.
	*
	* @returns {ReadyState} The [readyState]{@glossary readyState} of the video.
	* @public
	*/
	getReadyState: function () {
		return this.hasNode() ? this.hasNode().readyState : -1;
	},

	/**
	* Determines the seeking status of the player.
	*
	* @returns {Boolean} `true` if currently seeking; otherwise, `false`.
	* @public
	*/
	getSeeking: function () {
		return this.hasNode() ? this.hasNode().seeking : -1;
	},

	/**
	* Implements custom rewind functionality (until browsers support negative playback rate).
	* 
	* @private
	*/
	beginRewind: function () {
		this.node.pause();
		this.startRewindJob();
	},

	/**
	* Calculates the time that has elapsed since
	* 
	* @private
	*/
	_rewind: function () {
		var now = utils.perfNow(),
			distance = now - this.rewindBeginTime,
			pbRate = this.calcNumberValueOfPlaybackRate(this.playbackRate),
			adjustedDistance = Math.abs(distance * pbRate) / 1000,
			newTime = this.getCurrentTime() - adjustedDistance
		;

		this.setCurrentTime(newTime);
		this.startRewindJob();
	},

	/**
	* Starts rewind job.
	* 
	* @private
	*/
	startRewindJob: function () {
		this.rewindBeginTime = utils.perfNow();
		Job(this.id + 'rewind', this.bindSafely('_rewind'), 100);
	},

	/**
	* Stops rewind job.
	* 
	* @private
	*/
	stopRewindJob: function () {
		Job.stop(this.id + 'rewind');
	},

	/**
	* Calculates numeric value of playback rate (with support for fractions).
	* 
	* @private
	*/
	calcNumberValueOfPlaybackRate: function (rate) {
		var pbArray = String(rate).split('/');
		return (pbArray.length > 1) ? parseInt(pbArray[0], 10) / parseInt(pbArray[1], 10) : parseInt(rate, 10);
	},

	/**
	* 
	* Updates the [aspectRatio]{@link module:enyo/Video~Video#aspectRatio} property when the
	* video's metadata is received.
	*
	* @private
	*/
	metadataLoaded: function (sender, e) {
		var node = this.hasNode();
		this.setAspectRatio('none');
		if (!node || !node.videoWidth || !node.videoHeight) {
			return;
		}
		this.setAspectRatio(node.videoWidth/node.videoHeight+':1');
		e = utils.mixin(e, this.createEventData());
	},

	/**
	* @private
	*/
	timeupdate: function (sender, e) {
		var node = this.hasNode();

		if (!node) {
			return;
		}
		e = utils.mixin(e, this.createEventData());
	},

	/**
	* @fires module:enyo/Video~Video#doSlowforward
	* @fires module:enyo/Video~Video#doFastforward
	* @fires module:enyo/Video~Video#doSlowrewind
	* @fires module:enyo/Video~Video#doRewind
	* @fires module:enyo/Video~Video#doPlay
	* @private
	*/
	ratechange: function (sender, e) {
		var node = this.hasNode(),
			info,
			pbNumber;

		if (!node) {
			return;
		}

		info = this.createEventData();
		utils.mixin(e, utils.clone(info, true));
		info.originalEvent = utils.clone(e, true);

		pbNumber = this.calcNumberValueOfPlaybackRate(info.playbackRate);

		if (pbNumber > 0 && pbNumber < 1) {
			this.doSlowforward(info);
		} else if (pbNumber > 1) {
			this.doFastforward(info);
		} else if (pbNumber < 0 && pbNumber >= -1) {
			this.doSlowrewind(info);
		} else if (pbNumber < -1) {
			this.doRewind(info);
		} else if (pbNumber == 1) {
			this.doPlay(info);
		}
	},

	/**
	* @fires module:enyo/Video~Video#doStart
	* @private
	*/
	createEventData: function () {
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

	/**
	* Normalizes Enyo-generated `onPlay` [events]{@glossary event}.
	* 
	* @fires module:enyo/Video~Video#doPlay
	* @private
	*/
	_play: function (sender, e) {
		var node = this.hasNode();

		if (!node) {
			return;
		}

		e = utils.mixin(e, this.createEventData());

		this.doPlay(e);
	},

	/**
	* All HTML5 [video]{@glossary video} [events]{@glossary event}.
	* 
	* @private
	*/
	hookupVideoEvents: function () {
		dispatcher.makeBubble(this,
			'loadstart',
			'emptied',
			'canplaythrough',
			'ended',
			'ratechange',
			'progress',
			'stalled',
			'playing',
			'durationchange',
			'volumechange',
			'suspend',
			'loadedmetadata',
			'waiting',
			'timeupdate',
			'abort',
			'loadeddata',
			'seeking',
			'play',
			'error',
			'canplay',
			'seeked',
			'pause'
		);
	}
});
