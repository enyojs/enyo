(function (enyo, scope) {
	/**
	* Fires when element stops fetching [media]{@link enyo.Media} data before it is
	* completely downloaded, but not due to an error.
	*
	* @event enyo.Media#onAbort
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/ 

	/**
	* Fires when element can resume playback of the [media]{@link enyo.Media} data, but may
	* need to stop for further buffering of content.
	*
	* @event enyo.Media#onCanPlay
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when element can resume playback of the [media]{@link enyo.Media} data without
	* needing to stop for further buffering of content.
	*
	* @event enyo.Media#onCanPlayThrough
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when the [duration]{@link enyo.Media#duration} attribute has been changed.
	*
	* @event enyo.Media#onDurationChange
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when [networkState]{@glossary networkState} switches to `NETWORK_EMPTY`
	* from another state.
	*
	* @event enyo.Media#onEmptied
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when [media]{@link enyo.Media} playback finishes normally.
	*
	* @event enyo.Media#onEnded
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when an error occurs while fetching [media]{@link enyo.Media} data.
	*
	* @event enyo.Media#onError
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when the [media]{@link enyo.Media} data at the current playback position
	* can be rendered for the first time.
	*
	* @event enyo.Media#onLoadedData
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when the duration and dimensions of the [media]{@link enyo.Media}
	* resource/text tracks are ready.
	*
	* @event enyo.Media#onLoadedMetaData
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when the [media]{@link enyo.Media} element begins looking for media data.
	*
	* @event enyo.Media#onLoadStart
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when playback is paused.
	*
	* @event enyo.Media#onPause
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when playback is no longer paused.
	*
	* @event enyo.Media#onPlay
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when playback is ready to start after having been paused or delayed due to lack
	* of [media]{@link enyo.Media} data.
	*
	* @event enyo.Media#onPlaying
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when fetching [media]{@link enyo.Media} data.
	*
	* @event enyo.Media#onProgress
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when either [defaultPlaybackRate]{@link enyo.Media#defaultPlaybackRate} or
	* [playbackRate]{@link enyo.Media#playbackRate} is updated.
	*
	* @event enyo.Media#onRateChange
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when the seeking IDL attribute changes to `false`.
	*
	* @event enyo.Media#onSeeked
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when the seeking IDL attribute changes to `true`.
	*
	* @event enyo.Media#onSeeking
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when [media]{@link enyo.Media} fetching is interrupted.
	*
	* @event enyo.Media#onStalled
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when the [media]{@link enyo.Media} controller position changes.
	*
	* @event enyo.Media#onTimeUpdate
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when either [volume]{@link enyo.Media#volume} or [muted]{@link enyo.Media#muted}
	* is updated.
	*
	* @event enyo.Media#onVolumeChange
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when playback has stopped because the next frame is not available, but is
	* expected to be.
	*
	* @event enyo.Media#onWaiting
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when the playback rate has changed to a value > 1.
	*
	* @event enyo.Media#onFastforward
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when the playback rate has changed to a positive value < 1.
	*
	* @event enyo.Media#onSlowforward
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when the playback rate has changed to a value < -1.
	*
	* @event enyo.Media#onRewind
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when the playback rate has changed to a negative value > -1.
	*
	* @event enyo.Media#onSlowrewind
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when the playback has jumped forward by the number of seconds specified by the
	* [jumpSec property]{@link enyo.Media#jumpSec}.
	*
	* @event enyo.Media#onJumpForward
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when the playback has jumped backward by the number of seconds specified by the
	* [jumpSec property]{@link enyo.Media#jumpSec}.
	*
	* @event enyo.Media#onJumpBackward
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when playback has started.
	*
	* @event enyo.Media#onStart
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* {@link enyo.Media} implements an HTML5 [Media]{@glossary HTML5MediaElement} element.
	* It is not intended to be used directly, but serves as the base [kind]{@glossary kind}
	* for {@link enyo.Audio} and {@link enyo.Video}.
	*
	* @class enyo.Media
	* @extends enyo.Control
	* @ui
	* @protected
	*/
	enyo.kind(
		/** @lends enyo.Media.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Media',

		/**
		* @private
		*/
		kind: 'enyo.Control',
		
		/**
		* @private
		*/
		published: 
			/** @lends enyo.Media.prototype */ {
			
			/**
			* URL of the [media]{@link enyo.Media} file to play; may be relative to the
			* application HTML file.
			* 
			* @type {String}
			* @default ''
			* @public
			*/
			src: '',

			/**
			* If `true`, [media]{@link enyo.Media} will automatically start playback when loaded.
			* 
			* @type {Boolean}
			* @default false
			* @public
			*/
			autoplay: false,

			/**
			* The desired speed at which the [media]{@link enyo.Media} resource is to play.
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
			*  If `true`, [media]{@link enyo.Media} playback restarts from beginning when finished.
			* 
			* @type {Boolean}
			* @default false
			* @public
			*/
			loop: false,

			/**
			* If `true`, [media]{@link enyo.Media} playback is muted.
			* 
			* @type {Boolean}
			* @default false
			* @public
			*/
			muted: false,

			/**
			* If `true`, default [media]{@link enyo.Media} controls are shown.
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

		/**
		* @method
		* @private
		*/
		rendered: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				enyo.makeBubble(this, 'abort');
				enyo.makeBubble(this, 'canplay');
				enyo.makeBubble(this, 'canplaythrough');
				enyo.makeBubble(this, 'durationchange');
				enyo.makeBubble(this, 'emptied');
				enyo.makeBubble(this, 'ended');
				enyo.makeBubble(this, 'error');
				enyo.makeBubble(this, 'loadeddata');
				enyo.makeBubble(this, 'loadedmetadata');
				enyo.makeBubble(this, 'loadstart');
				enyo.makeBubble(this, 'pause');
				enyo.makeBubble(this, 'play');
				enyo.makeBubble(this, 'playing');
				enyo.makeBubble(this, 'progress');
				enyo.makeBubble(this, 'ratechange');
				enyo.makeBubble(this, 'seeked');
				enyo.makeBubble(this, 'seeking');
				enyo.makeBubble(this, 'stalled');
				enyo.makeBubble(this, 'timeupdate');
				enyo.makeBubble(this, 'volumechange');
				enyo.makeBubble(this, 'waiting');
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
			var path = enyo.path.rewrite(this.src);
			this.setAttribute('src', path);
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
		* @fires enyo.Media#onEnded
		* @private
		*/
		_abort: function () {
			this.doEnded();
		},

		/**
		* Called when element can resume playback of media data, but may need to stop for further
		* buffering of content.
		*
		* @fires enyo.Media#onCanPlay
		* @private
		*/
		_canPlay: function () {
			this.doCanPlay();
		},
		/**
		* Called when element can resume playback of the media data without needing to stop for
		* further buffering of content.
		*
		* @fires enyo.Media#onCanPlayThrough
		* @private
		*/
		_canPlayThrough: function () {
			this.doCanPlayThrough();
		},
		
		/**
		* Called when the [duration]{@link enyo.Media#duration} attribute has been changed.
		*
		* @fires enyo.Media#onDurationChange
		* @private
		*/
		_durationChange: function () {
			this.doDurationChange();
		},

		/**
		* Called when [networkState]{@glossary networkState} switches to `NETWORK_EMPTY` from
		* another state.
		*
		* @fires enyo.Media#onEmptied
		* @private
		*/
		_emptied: function () {
			this.doEmptied();
		},

		/**
		* Called when playback reaches the end of the media data.
		*
		* @fires enyo.Media#onEnded
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
		* @fires enyo.Media#onLoadedData
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
		* @fires enyo.Media#onLoadStart
		* @private
		*/
		_loadStart: function () {
			this.doLoadStart();
		},

		/**
		* Called when playback is paused.
		*
		* @fires enyo.Media#onPause
		* @private
		*/
		_pause: function () {
			this.doPause();
		},

		/**
		* Called when playback is no longer paused.
		*
		* @fires enyo.Media#onPlay
		* @private
		*/
		_play: function () {
			this.doPlay();
		},

		/**
		* Called when playback is ready to start after having been paused or delayed due to lack of
		* media data.
		*
		* @fires enyo.Media#onPlaying
		* @private
		*/
		_playing: function () {
			this.doPlaying();
		},

		/**
		* Called when the media element is fetching media data.
		*
		* @fires enyo.Media#onProgress
		* @private
		*/
		_progress: function () {
			this.doProgress();
		},

		/**
		* @fires enyo.Media#onStart
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
		* Called when either [defaultPlaybackRate]{@link enyo.Media#defaultPlaybackRate} or 
		* [playbackRate]{@link enyo.Media#playbackRate} has been updated.
		*
		* @fires enyo.Media#onSlowforward
		* @fires enyo.Media#onFastforward
		* @fires enyo.Media#onSlowrewind
		* @fires enyo.Media#onRewind
		* @fires enyo.Media#onPlay
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
			enyo.mixin(e, enyo.clone(info, true));
			info.originalEvent = enyo.clone(e, true);

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
		* @fires enyo.Media#onStalled
		* @private
		*/
		_stalled: function () {
			this.doStalled();
		},
		/**
		* Called when the seeking IDL attribute changes to `false`.
		*
		* @fires enyo.Media#onSeeked
		* @private
		*/
		_seeked: function () {
			this.doSeeked();
		},

		/**
		* Called when the seeking IDL attribute changes to `true`.
		*
		* @fires enyo.Media#onSeeking
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
			e = enyo.mixin(e, this.createEventData());
		},

		/**
		* Called when either [volume]{@link enyo.Media#volume} or [muted]{@link enyo.Media#muted} is
		* updated.
		*
		* @fires enyo.Media#onVolumeChange
		* @private
		*/
		_volumeChange: function () {
			this.doVolumeChange();
		},

		/**
		* Called when playback has stopped because the next frame is not available, but is expected
		* to be.
		*
		* @fires enyo.Media#onWaiting
		* @private
		*/
		_waiting: function () {
			this.doWaiting();
		},

		/**
		* Initiates playback of the [media]{@link enyo.Media} data referenced in
		* [src]{@link enyo.Media#src}.
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
		* Pauses [media]{@link enyo.Media} playback.
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
		* Retrieves the ranges of the [media]{@link enyo.Media} [source]{@link enyo.Media#src}
		* that have been buffered.
		*
		* @returns {TimeRanges} The ranges of the [media]{@link enyo.Media} 
		*	[source]{@link enyo.Media#src} that have been buffered.
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
		* Retrieves the total duration time of the loaded [media]{@link enyo.Media}.
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
		* Determines whether the [media]{@link enyo.Media} element is paused.
		*
		* @returns {Boolean} `true` if the [media]{@link enyo.Media} is paused;
		*	otherwise, `false`.
		* @public
		*/
		getPaused: function () {
			if (this.hasNode()) {
				return this.node.paused;
			}
		},

		/** 
		* Retrieves the ranges of the [media]{@link enyo.Media} [source]{@link enyo.Media#src} 
		* that have been played, if any.
		*
		* @returns {TimeRanges} The ranges of the [media]{@link enyo.Media} 
		*	[source]{@link enyo.Media#src} that have been played.
		* @public
		*/
		getPlayed: function () {
			if (this.hasNode()) {
				return this.node.played;
			}
		},

		/** 
		* Determines the [readiness]{@glossary readyState} of the [media]{@link enyo.Media}.
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
		* Retrieves the ranges of the [media]{@link enyo.Media} [source]{@link enyo.Media#src}
		* that the user may seek to, if any.
		*
		* @returns {TimeRanges} The ranges of the [media]{@link enyo.Media}
		*	[source]{@link enyo.Media#src} that are seekable.
		* @public
		*/
		getSeekable: function () {
			if (this.hasNode()) {
				return this.node.seekable;
			}
		},

		/** 
		* Sets current player position in the [media]{@link enyo.Media} element.
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
			var now = enyo.perfNow(),
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
			this.rewindBeginTime = enyo.perfNow();
			enyo.job(this.id + 'rewind', this.bindSafely('_rewind'), 100);
		},

		/** 
		* Stops rewind job.
		*
		* @public
		*/
		stopRewindJob: function () {
			enyo.job.stop(this.id + 'rewind');
		},

		/** 
		* Determines whether the [media]{@link enyo.Media} is currently seeking to a new position.
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
		* Determines whether the [media]{@link enyo.Media} is currently in a paused state.
		*
		* @returns {Boolean} `true` if paused; otherwise, `false`.
		* @public
		*/
		isPaused: function () {
			return this.hasNode() ? this.hasNode().paused : true;
		},

		/** 
		* Fast forwards the [media]{@link enyo.Media}, taking into account the current
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
		* Rewinds the [media]{@link enyo.Media}, taking into account the current
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

			if (!(enyo.platform.webos || window.PalmSystem)) {
				// For supporting cross browser behavior
				if (pbNumber < 0) {
					this.beginRewind();
				}
			}
		},

		/** 
		* Jumps backward by an amount specified by the [jumpSec]{@link enyo.Media#jumpSec}
		* property.
		*
		* @fires enyo.Media#onJumpBackward
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

			this.doJumpBackward(enyo.mixin(this.createEventData(), {jumpSize: this.jumpSec}));
		},

		/** 
		* Jumps forward by an amount specified by the [jumpSec]{@link enyo.Media#jumpSec}
		* property.
		*
		* @fires enyo.Media#onJumpForward
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

			this.doJumpForward(enyo.mixin(this.createEventData(), {jumpSize: this.jumpSec}));
		},

		/** 
		* Jumps to the beginning of the [media]{@link enyo.Media} content.
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
		* Jumps to the end of the [media]{@link enyo.Media} content.
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

})(enyo, this);
