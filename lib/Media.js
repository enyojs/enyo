require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Media~Media} kind.
* @module enyo/Media
*/

var
	kind = require('./kind'),
	dispatcher = require('./dispatcher'),
	utils = require('./utils'),
	platform = require('./platform'),
	path = require('./path');
var
	Control = require('./Control'),
	Job = require('./job');

/**
* Fires when element stops fetching [media]{@link module:enyo/Media~Media} data before it is
* completely downloaded, but not due to an error.
*
* @event module:enyo/Media~Media#onAbort
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/ 

/**
* Fires when element can resume playback of the [media]{@link module:enyo/Media~Media} data, but may
* need to stop for further buffering of content.
*
* @event module:enyo/Media~Media#onCanPlay
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when element can resume playback of the [media]{@link module:enyo/Media~Media} data without
* needing to stop for further buffering of content.
*
* @event module:enyo/Media~Media#onCanPlayThrough
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently 
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when the [duration]{@link module:enyo/Media~Media#duration} attribute has been changed.
*
* @event module:enyo/Media~Media#onDurationChange
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when [networkState]{@glossary networkState} switches to `NETWORK_EMPTY`
* from another state.
*
* @event module:enyo/Media~Media#onEmptied
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when [media]{@link module:enyo/Media~Media} playback finishes normally.
*
* @event module:enyo/Media~Media#onEnded
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when an error occurs while fetching [media]{@link module:enyo/Media~Media} data.
*
* @event module:enyo/Media~Media#onError
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when the [media]{@link module:enyo/Media~Media} data at the current playback position
* can be rendered for the first time.
*
* @event module:enyo/Media~Media#onLoadedData
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when the duration and dimensions of the [media]{@link module:enyo/Media~Media}
* resource/text tracks are ready.
*
* @event module:enyo/Media~Media#onLoadedMetaData
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when the [media]{@link module:enyo/Media~Media} element begins looking for media data.
*
* @event module:enyo/Media~Media#onLoadStart
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when playback is paused.
*
* @event module:enyo/Media~Media#onPause
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when playback is no longer paused.
*
* @event module:enyo/Media~Media#onPlay
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when playback is ready to start after having been paused or delayed due to lack
* of [media]{@link module:enyo/Media~Media} data.
*
* @event module:enyo/Media~Media#onPlaying
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when fetching [media]{@link module:enyo/Media~Media} data.
*
* @event module:enyo/Media~Media#onProgress
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when either [defaultPlaybackRate]{@link module:enyo/Media~Media#defaultPlaybackRate} or
* [playbackRate]{@link module:enyo/Media~Media#playbackRate} is updated.
*
* @event module:enyo/Media~Media#onRateChange
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when the seeking IDL attribute changes to `false`.
*
* @event module:enyo/Media~Media#onSeeked
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when the seeking IDL attribute changes to `true`.
*
* @event module:enyo/Media~Media#onSeeking
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when [media]{@link module:enyo/Media~Media} fetching is interrupted.
*
* @event module:enyo/Media~Media#onStalled
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when the [media]{@link module:enyo/Media~Media} controller position changes.
*
* @event module:enyo/Media~Media#onTimeUpdate
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when either [volume]{@link module:enyo/Media~Media#volume} or [muted]{@link module:enyo/Media~Media#muted}
* is updated.
*
* @event module:enyo/Media~Media#onVolumeChange
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when playback has stopped because the next frame is not available, but is
* expected to be.
*
* @event module:enyo/Media~Media#onWaiting
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when the playback rate has changed to a value > 1.
*
* @event module:enyo/Media~Media#onFastforward
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when the playback rate has changed to a positive value < 1.
*
* @event module:enyo/Media~Media#onSlowforward
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when the playback rate has changed to a value < -1.
*
* @event module:enyo/Media~Media#onRewind
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when the playback rate has changed to a negative value > -1.
*
* @event module:enyo/Media~Media#onSlowrewind
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when the playback has jumped forward by the number of seconds specified by the
* [jumpSec property]{@link module:enyo/Media~Media#jumpSec}.
*
* @event module:enyo/Media~Media#onJumpForward
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when the playback has jumped backward by the number of seconds specified by the
* [jumpSec property]{@link module:enyo/Media~Media#jumpSec}.
*
* @event module:enyo/Media~Media#onJumpBackward
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when playback has started.
*
* @event module:enyo/Media~Media#onStart
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* {@link module:enyo/Media~Media} implements an HTML5 [Media]{@glossary HTML5MediaElement} element.
* It is not intended to be used directly, but serves as the base [kind]{@glossary kind}
* for {@link module:enyo/Audio~Audio} and {@link module:enyo/Video~Video}.
*
* @class Media
* @extends module:enyo/Control~Control
* @ui
* @protected
*/
module.exports = kind(
	/** @lends module:enyo/Media~Media.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.Media',

	/**
	* @private
	*/
	kind: Control,
	
	/**
	* @private
	*/
	published: 
		/** @lends module:enyo/Media~Media.prototype */ {
		
		/**
		* URL of the [media]{@link module:enyo/Media~Media} file to play; may be relative to the
		* application HTML file.
		* 
		* @type {String}
		* @default ''
		* @public
		*/
		src: '',

		/**
		* If `true`, [media]{@link module:enyo/Media~Media} will automatically start playback when loaded.
		* 
		* @type {Boolean}
		* @default false
		* @public
		*/
		autoplay: false,

		/**
		* The desired speed at which the [media]{@link module:enyo/Media~Media} resource is to play.
		* 
		* @type {Number}
		* @default 1.0
		* @public
		*/
		defaultPlaybackRate: 1.0,

		/**
		* The amount of time, in seconds, to jump forward or backward.
		* 
		* @type {Number}
		* @default 30
		* @public
		*/
		jumpSec: 30,

		/**
		* The effective playback rate.
		* 
		* @type {Number}
		* @default 1.0
		* @public
		*/
		playbackRate: 1.0,
		/** Hash of playback rates that can be set as follows:
		* ```
		* playbackRateHash: {
		*	fastForward: ['2', '4', '8', '16'],
		*	rewind: ['-2', '-4', '-8', '-16'],
		*	slowForward: ['1/4', '1/2'],
		*	slowRewind: ['-1/2', '-1']
		* }
		* ```
		* 
		* @type {Object}
		* @default {
		*	fastForward: ['2', '4', '8', '16'],
		*	rewind: ['-2', '-4', '-8', '-16'],
		*	slowForward: ['1/4', '1/2', '1'],
		*	slowRewind: ['-1/2', '-1']
		* }
		* @public
		*/
		playbackRateHash: {
			fastForward: ['2', '4', '8', '16'],
			rewind: ['-2', '-4', '-8', '-16'],
			slowForward: ['1/4', '1/2', '1'],
			slowRewind: ['-1/2', '-1']
		},

		/**
		* Indicates how data should be preloaded, reflecting the `preload` HTML attribute.
		* Will be one of `'none'` (the default), `'metadata'`, or `'auto'`.
		* 
		* @type {String}
		* @default 'none'
		* @public
		*/
		preload: 'none',

		/**
		*  If `true`, [media]{@link module:enyo/Media~Media} playback restarts from beginning when finished.
		* 
		* @type {Boolean}
		* @default false
		* @public
		*/
		loop: false,

		/**
		* If `true`, [media]{@link module:enyo/Media~Media} playback is muted.
		* 
		* @type {Boolean}
		* @default false
		* @public
		*/
		muted: false,

		/**
		* If `true`, default [media]{@link module:enyo/Media~Media} controls are shown.
		* 
		* @type {Boolean}
		* @default false
		* @public
		*/
		showControls: false,

		/**
		* Current playback volume, as a number in the range from 0.0 to 1.0.
		* 
		* @type {Number}
		* @default 1.0
		* @public
		*/
		volume: 1.0
	},

	/**
	* @private
	*/
	events: {
		onAbort: "",
		onCanPlay: '',
		onCanPlayThrough: '',
		onDurationChange: '',
		onEmptied: '',
		onEnded: '',
		onError: '',
		onLoadedData: '',
		onLoadedMetaData: '',
		onLoadStart: '',
		onPause: '',
		onPlay: '',
		onPlaying: '',
		onProgress: '',
		onRateChange: '',
		onSeeked: '',
		onSeeking: '',
		onStalled: '',
		onTimeUpdate: '',
		onVolumeChange: '',
		onWaiting: '',
		onFastforward: '',
		onSlowforward: '',
		onRewind: '',
		onSlowrewind: '',
		onJumpForward: '',
		onJumpBackward: '',
		onStart: ''
	},
	
	/**
	* @private
	*/
	handlers: {
		onabort: '_abort',
		oncanplay: '_canPlay',
		oncanplaythrough: '_canPlayThrough',
		ondurationchange: '_durationChange',
		onemptied: '_emptied',
		onended: '_ended',
		onerror: '_error',
		onloadeddata: '_loadedData',
		onloadedmetadata: '_loadedMetaData',
		onloadstart: '_loadStart',
		onpause: '_pause',
		onplay: '_play',
		onplaying: '_playing',
		onprogress: '_progress',
		onratechange: '_rateChange',
		onseeked: '_seeked',
		onseeking: '_seeking',
		onstalled: '_stalled',
		ontimeupdate: '_timeUpdate',
		onvolumechange: '_volumeChange',
		onwaiting: '_waiting'
	},

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
			this.autoplayChanged();
			this.loopChanged();
			this.preloadChanged();
			this.showControlsChanged();
			this.srcChanged();
		};
	}),

	/**
	* @method
	* @private
	*/
	rendered: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			dispatcher.makeBubble(this, 'abort');
			dispatcher.makeBubble(this, 'canplay');
			dispatcher.makeBubble(this, 'canplaythrough');
			dispatcher.makeBubble(this, 'durationchange');
			dispatcher.makeBubble(this, 'emptied');
			dispatcher.makeBubble(this, 'ended');
			dispatcher.makeBubble(this, 'error');
			dispatcher.makeBubble(this, 'loadeddata');
			dispatcher.makeBubble(this, 'loadedmetadata');
			dispatcher.makeBubble(this, 'loadstart');
			dispatcher.makeBubble(this, 'pause');
			dispatcher.makeBubble(this, 'play');
			dispatcher.makeBubble(this, 'playing');
			dispatcher.makeBubble(this, 'progress');
			dispatcher.makeBubble(this, 'ratechange');
			dispatcher.makeBubble(this, 'seeked');
			dispatcher.makeBubble(this, 'seeking');
			dispatcher.makeBubble(this, 'stalled');
			dispatcher.makeBubble(this, 'timeupdate');
			dispatcher.makeBubble(this, 'volumechange');
			dispatcher.makeBubble(this, 'waiting');
			this.defaultPlaybackRateChanged();
			this.mutedChanged();
			this.playbackRateChanged();
			this.volumeChanged();
		};
	}),

	/**
	* @private
	*/
	srcChanged: function () {
		var _path = path.rewrite(this.src);
		this.setAttribute('src', _path);
		if (this.hasNode()) {
			this.node.load();
		}
	},

	/**
	* @private
	*/
	autoplayChanged: function () {
		this.setAttribute('autoplay', this.autoplay ? 'autoplay' : null);
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
	mutedChanged: function () {
		this.setAttribute('muted', this.muted ? 'muted' : null);
	},

	/**
	* @private
	*/
	preloadChanged: function () {
		this.setAttribute('preload', this.preload);
	},

	/**
	* @private
	*/
	defaultPlaybackRateChanged: function () {
		if (this.hasNode()) {
			this.node.defaultPlaybackRate = this.defaultPlaybackRate;
		}
	},

	/**
	* @private
	*/
	selectPlaybackRateArray: function (cmd) {
		this._playbackRateArray = this.playbackRateHash[cmd];
	},

	/**
	* @private
	*/
	selectPlaybackRate: function (idx) {
		return this._playbackRateArray[idx];
	},

	/**
	* @private
	*/
	clampPlaybackRate: function (idx) {
		if (!this._playbackRateArray) {
			return;
		}

		return idx % this._playbackRateArray.length;
	},

	/**
	* @private
	*/
	playbackRateChanged: function () {
		if (this.hasNode()) {
			this.node.playbackRate = this.playbackRate;
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
	volumeChanged: function () {
		if (this.hasNode()) {
			this.node.volume = this.volume;
		}
	},

	/**
	* Called when element stops fetching media data before it has been completely downloaded,
	* but not due to an error.
	*
	* @fires module:enyo/Media~Media#onEnded
	* @private
	*/
	_abort: function () {
		this.doEnded();
	},

	/**
	* Called when element can resume playback of media data, but may need to stop for further
	* buffering of content.
	*
	* @fires module:enyo/Media~Media#onCanPlay
	* @private
	*/
	_canPlay: function () {
		this.doCanPlay();
	},
	/**
	* Called when element can resume playback of the media data without needing to stop for
	* further buffering of content.
	*
	* @fires module:enyo/Media~Media#onCanPlayThrough
	* @private
	*/
	_canPlayThrough: function () {
		this.doCanPlayThrough();
	},
	
	/**
	* Called when the [duration]{@link module:enyo/Media~Media#duration} attribute has been changed.
	*
	* @fires module:enyo/Media~Media#onDurationChange
	* @private
	*/
	_durationChange: function () {
		this.doDurationChange();
	},

	/**
	* Called when [networkState]{@glossary networkState} switches to `NETWORK_EMPTY` from
	* another state.
	*
	* @fires module:enyo/Media~Media#onEmptied
	* @private
	*/
	_emptied: function () {
		this.doEmptied();
	},

	/**
	* Called when playback reaches the end of the media data.
	*
	* @fires module:enyo/Media~Media#onEnded
	* @private
	*/
	_ended: function () {
		this.doEnded();
	},

	/**
	* Called when an error occurs while fetching media data.
	* 
	* @private
	*/
	_error: function () {
		this.doError();
	},
	/**
	* Called when we can render the media data at the current playback position for the first
	* time.
	*
	* @fires module:enyo/Media~Media#onLoadedData
	* @private
	*/
	_loadedData: function () {
		this.doLoadedData();
	},
	/**
	* Called when the media duration and dimensions of the media resource/text tracks are ready.
	* 
	* @private
	*/
	_loadedMetaData: function () {
		this.doLoadedMetaData();
	},

	/**
	* Called when the media element begins looking for media data.
	*
	* @fires module:enyo/Media~Media#onLoadStart
	* @private
	*/
	_loadStart: function () {
		this.doLoadStart();
	},

	/**
	* Called when playback is paused.
	*
	* @fires module:enyo/Media~Media#onPause
	* @private
	*/
	_pause: function () {
		this.doPause();
	},

	/**
	* Called when playback is no longer paused.
	*
	* @fires module:enyo/Media~Media#onPlay
	* @private
	*/
	_play: function () {
		this.doPlay();
	},

	/**
	* Called when playback is ready to start after having been paused or delayed due to lack of
	* media data.
	*
	* @fires module:enyo/Media~Media#onPlaying
	* @private
	*/
	_playing: function () {
		this.doPlaying();
	},

	/**
	* Called when the media element is fetching media data.
	*
	* @fires module:enyo/Media~Media#onProgress
	* @private
	*/
	_progress: function () {
		this.doProgress();
	},

	/**
	* @fires module:enyo/Media~Media#onStart
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
	* Calculates the number value of the given playback rate (with support for fractions).
	*
	* @param {String} rate - The playback rate, which may be a fraction, that will be converted to
	*	a numerical value.
	* @returns {Number} The numerical representation of the playback rate.
	* @private
	*/
	calcNumberValueOfPlaybackRate: function (rate) {
		var pbArray = String(rate).split('/');
		return (pbArray.length > 1) ? parseInt(pbArray[0], 10) / parseInt(pbArray[1], 10) : parseInt(rate, 10);
	},
	/**
	* Called when either [defaultPlaybackRate]{@link module:enyo/Media~Media#defaultPlaybackRate} or 
	* [playbackRate]{@link module:enyo/Media~Media#playbackRate} has been updated.
	*
	* @fires module:enyo/Media~Media#onSlowforward
	* @fires module:enyo/Media~Media#onFastforward
	* @fires module:enyo/Media~Media#onSlowrewind
	* @fires module:enyo/Media~Media#onRewind
	* @fires module:enyo/Media~Media#onPlay
	* @private
	*/
	_rateChange: function (sender, e) {
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
	* Called when fetching of media data is interrupted.
	*
	* @fires module:enyo/Media~Media#onStalled
	* @private
	*/
	_stalled: function () {
		this.doStalled();
	},
	/**
	* Called when the seeking IDL attribute changes to `false`.
	*
	* @fires module:enyo/Media~Media#onSeeked
	* @private
	*/
	_seeked: function () {
		this.doSeeked();
	},

	/**
	* Called when the seeking IDL attribute changes to `true`.
	*
	* @fires module:enyo/Media~Media#onSeeking
	* @private
	*/
	_seeking: function () {
		this.doSeeking();
	},

	/**
	* Called when the media controller position has changed.
	* 
	* @private
	*/
	_timeUpdate: function (sender, e) {
		var node = this.hasNode();

		if (!node) {
			return;
		}
		e = utils.mixin(e, this.createEventData());
	},

	/**
	* Called when either [volume]{@link module:enyo/Media~Media#volume} or [muted]{@link module:enyo/Media~Media#muted} is
	* updated.
	*
	* @fires module:enyo/Media~Media#onVolumeChange
	* @private
	*/
	_volumeChange: function () {
		this.doVolumeChange();
	},

	/**
	* Called when playback has stopped because the next frame is not available, but is expected
	* to be.
	*
	* @fires module:enyo/Media~Media#onWaiting
	* @private
	*/
	_waiting: function () {
		this.doWaiting();
	},

	/**
	* Initiates playback of the [media]{@link module:enyo/Media~Media} data referenced in
	* [src]{@link module:enyo/Media~Media#src}.
	*
	* @public
	*/
	play: function () {
		if (this.hasNode()) {
			this.setPlaybackRate(1);
			this._prevCommand = 'play';
			this.node.play();
		}
	},

	/**
	* Pauses [media]{@link module:enyo/Media~Media} playback.
	*
	* @public
	*/
	pause: function () {
		if (this.hasNode()) {
			this.setPlaybackRate(1);
			this._prevCommand = 'pause';
			this.node.pause();
		}
	},

	/**
	* Seeks to the specified time.
	*
	* @param {Number} time - The time, in seconds, to seek to.
	* @public
	*/
	seekTo: function (time) {
		if (this.hasNode()) {
			this.node.currentTime = time;
		}
	},

	/**
	* Retrieves the ranges of the [media]{@link module:enyo/Media~Media} [source]{@link module:enyo/Media~Media#src}
	* that have been buffered.
	*
	* @returns {TimeRanges} The ranges of the [media]{@link module:enyo/Media~Media} 
	*	[source]{@link module:enyo/Media~Media#src} that have been buffered.
	* @public
	*/
	getBuffered: function () {
		if (this.hasNode()) {
			return this.node.buffered;
		}
		return 0;
	},

	/**
	* Retrieves the current playback position.
	*
	* @returns {Number} The current playback position in seconds.
	* @public
	*/
	getCurrentTime: function () {
		if (this.hasNode()) {
			return this.node.currentTime;
		}
		return 0;
	},

	/**
	* Retrieves the total duration time of the loaded [media]{@link module:enyo/Media~Media}.
	*
	* @returns {Number} The duration in seconds.
	* @public
	*/
	getDuration: function () {
		if (this.hasNode()) {
			return this.node.duration;
		}
		return 0;
	},

	/** 
	* Determines whether the [media]{@link module:enyo/Media~Media} element is paused.
	*
	* @returns {Boolean} `true` if the [media]{@link module:enyo/Media~Media} is paused;
	*	otherwise, `false`.
	* @public
	*/
	getPaused: function () {
		if (this.hasNode()) {
			return this.node.paused;
		}
	},

	/** 
	* Retrieves the ranges of the [media]{@link module:enyo/Media~Media} [source]{@link module:enyo/Media~Media#src} 
	* that have been played, if any.
	*
	* @returns {TimeRanges} The ranges of the [media]{@link module:enyo/Media~Media} 
	*	[source]{@link module:enyo/Media~Media#src} that have been played.
	* @public
	*/
	getPlayed: function () {
		if (this.hasNode()) {
			return this.node.played;
		}
	},

	/** 
	* Determines the [readiness]{@glossary readyState} of the [media]{@link module:enyo/Media~Media}.
	*
	* @returns {ReadyState} The [readiness]{@glossary readyState} state.
	* @public
	*/
	getReadyState: function () {
		if (this.hasNode()) {
			return this.node.readyState;
		}
	},

	/** 
	* Retrieves the ranges of the [media]{@link module:enyo/Media~Media} [source]{@link module:enyo/Media~Media#src}
	* that the user may seek to, if any.
	*
	* @returns {TimeRanges} The ranges of the [media]{@link module:enyo/Media~Media}
	*	[source]{@link module:enyo/Media~Media#src} that are seekable.
	* @public
	*/
	getSeekable: function () {
		if (this.hasNode()) {
			return this.node.seekable;
		}
	},

	/** 
	* Sets current player position in the [media]{@link module:enyo/Media~Media} element.
	*
	* @param {Number} time - The player position, in seconds.
	* @public
	*/
	setCurrentTime: function (time) {
		if ((typeof time === 'number') && this.hasNode()) {
			this.node.currentTime = time;
		}
	},

	/** 
	* Implements custom rewind functionality (until browsers support negative playback rate).
	*
	* @public
	*/
	beginRewind: function () {
		this.node.pause();
		this.startRewindJob();
	},

	/**
	* Calculates the time that has elapsed since.
	* 
	* @private
	*/
	_rewind: function () {
		var now = utils.perfNow(),
			distance = now - this.rewindBeginTime,
			pbRate = this.calcNumberValueOfPlaybackRate(this.playbackRate),
			adjustedDistance = Math.abs(distance * pbRate) / 1000,
			newTime = this.getCurrentTime() - adjustedDistance;
		this.setCurrentTime(newTime);
		this.startRewindJob();
	},

	/** 
	* Starts rewind job.
	*
	* @public
	*/
	startRewindJob: function () {
		this.rewindBeginTime = utils.perfNow();
		Job(this.id + 'rewind', this.bindSafely('_rewind'), 100);
	},

	/** 
	* Stops rewind job.
	*
	* @public
	*/
	stopRewindJob: function () {
		Job.stop(this.id + 'rewind');
	},

	/** 
	* Determines whether the [media]{@link module:enyo/Media~Media} is currently seeking to a new position.
	*
	* @returns {Boolean} `true` if currently seeking; otherwise, `false`.
	* @public
	*/
	getSeeking: function () {
		if (this.hasNode()) {
			return this.node.seeking;
		}
	},

	/** 
	* Determines whether the [media]{@link module:enyo/Media~Media} is currently in a paused state.
	*
	* @returns {Boolean} `true` if paused; otherwise, `false`.
	* @public
	*/
	isPaused: function () {
		return this.hasNode() ? this.hasNode().paused : true;
	},

	/** 
	* Fast forwards the [media]{@link module:enyo/Media~Media}, taking into account the current
	* playback state.
	*
	* @public
	*/
	fastForward: function () {
		var node = this.hasNode();

		if (!node) {
			return;
		}
		switch (this._prevCommand) {
		case 'slowForward':
			if (this._speedIndex == this._playbackRateArray.length - 1) {
				// reached to the end of array => go to fastforward
				this.selectPlaybackRateArray('fastForward');
				this._speedIndex = 0;
				this._prevCommand = 'fastForward';
			} else {
				this._speedIndex = this.clampPlaybackRate(this._speedIndex+1);
				this._prevCommand = 'slowForward';
			}
			break;
		case 'pause':
			this.selectPlaybackRateArray('slowForward');
			this._speedIndex = 0;
			if (this.isPaused()) {
				node.play();
			}
			this._prevCommand = 'slowForward';
			break;
		case 'rewind':
			var pbNumber = this.calcNumberValueOfPlaybackRate(this.playbackRate);
			if (pbNumber < 0) {
				this.selectPlaybackRateArray('slowForward');
				this._prevCommand = 'slowForward';
			} else {
				this.selectPlaybackRateArray('fastForward');
				this._prevCommand = 'fastForward';
			}
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

	},

	/** 
	* Rewinds the [media]{@link module:enyo/Media~Media}, taking into account the current
	* playback state.
	*
	* @public
	*/
	rewind: function () {
		var node = this.hasNode();

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
				this._prevCommand = 'slowRewind';
			}
			break;
		case 'pause':
			this.selectPlaybackRateArray('slowRewind');
			this._speedIndex = 0;
			if (this.isPaused() && this.node.duration > this.node.currentTime) {
				node.play();
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
	},


	setPlaybackRate: function (rate) {
		var node = this.hasNode(),
			pbNumber
		;

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
	* Jumps backward by an amount specified by the [jumpSec]{@link module:enyo/Media~Media#jumpSec}
	* property.
	*
	* @fires module:enyo/Media~Media#onJumpBackward
	* @public
	*/
	jumpBackward: function () {
		var node = this.hasNode();

		if (!node) {
			return;
		}

		this.setPlaybackRate(1);
		node.currentTime -= this.jumpSec;
		this._prevCommand = 'jumpBackward';

		this.doJumpBackward(utils.mixin(this.createEventData(), {jumpSize: this.jumpSec}));
	},

	/** 
	* Jumps forward by an amount specified by the [jumpSec]{@link module:enyo/Media~Media#jumpSec}
	* property.
	*
	* @fires module:enyo/Media~Media#onJumpForward
	* @public
	*/
	jumpForward: function () {
		var node = this.hasNode();

		if (!node) {
			return;
		}

		this.setPlaybackRate(1);
		node.currentTime += this.jumpSec;
		this._prevCommand = 'jumpForward';

		this.doJumpForward(utils.mixin(this.createEventData(), {jumpSize: this.jumpSec}));
	},

	/** 
	* Jumps to the beginning of the [media]{@link module:enyo/Media~Media} content.
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
	* Jumps to the end of the [media]{@link module:enyo/Media~Media} content.
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
	}
});
