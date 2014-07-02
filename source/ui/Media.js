(function (enyo, scope) {
	/**
	* _enyo.Media_ implements an [HTML 5 Media element]{@link external:HTML5MediaElement}. It is not
	* intended to be used directly, but serves as the base [kind]{@link external:kind} for 
	* {@link enyo.Audio} and {@link enyo.Video}.
	*
	* @class enyo.Media
	* @public
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
		published: {
			/**
			* URL of the sound file to play; may be relative to the application HTML file.
			* 
			* @type {String}
			* @default ''
			* @memberof enyo.Media.prototype
			* @public
			*/
			src: '',

			/**
			* If `true`, [media]{@link enyo.Media} will automatically start playback when loaded.
			* 
			* @type {Boolean}
			* @default false
			* @memberof enyo.Media.prototype
			* @public
			*/
			autoplay: false,

			/**
			* The desired speed at which the [media]{@link enyo.Media} resource is to play.
			* 
			* @type {Number}
			* @default 1.0
			* @memberof enyo.Media.prototype
			* @public
			*/
			defaultPlaybackRate: 1.0,

			/**
			* The amount of time, in seconds, to jump forward or backward.
			* 
			* @type {Number}
			* @default 30
			* @memberof enyo.Media.prototype
			* @public
			*/
			jumpSec: 30,

			/**
			* The effective playback rate.
			* 
			* @type {Number}
			* @default 1.0
			* @memberof enyo.Media.prototype
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
			* @memberof enyo.Media.prototype
			* @public
			*/
			playbackRateHash: {
				fastForward: ['2', '4', '8', '16'],
				rewind: ['-2', '-4', '-8', '-16'],
				slowForward: ['1/4', '1/2', '1'],
				slowRewind: ['-1/2', '-1']
			},

			/**
			* Indicates how data should be preloaded, reflecting the preload HTML attribute 
			* ('none', 'metadata', 'auto').
			* 
			* @type {String}
			* @default 'none'
			* @memberof enyo.Media.prototype
			* @public
			*/
			preload: 'none',

			/**
			*  If `true`, [media]{@link enyo.Media} playback restarts from beginning when finished.
			* 
			* @type {Boolean}
			* @default false
			* @memberof enyo.Media.prototype
			* @public
			*/
			loop: false,

			/**
			* If true, [media]{@link enyo.Media} playback is muted.
			* 
			* @type {Boolean}
			* @default false
			* @memberof enyo.Media.prototype
			* @public
			*/
			muted: false,

			/**
			* If `true`, default [media]{@link enyo.Media} controls are shown.
			* 
			* @type {Boolean}
			* @default false
			* @memberof enyo.Media.prototype
			* @public
			*/
			showControls: false,

			/**
			* Current playback volume, as a number in the range from 0.0 to 1.0.
			* 
			* @type {Number}
			* @default 1.0
			* @memberof enyo.Media.prototype
			* @public
			*/
			volume: 1.0
		},

		/**
		* @private
		*/
		events: {
			/**
			* Fires when element stops fetching [media]{@link enyo.Media} data before it is 
			* completely downloaded, but not due to an error.
			*
			* @event enyo.Media#onAbort
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onAbort: "",

			/**
			* Fires when element can resume playback of the [media]{@link enyo.Media} data, but may 
			* need to stop for further buffering of content.
			*
			* @event enyo.Media#onCanPlay
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onCanPlay: '',

			/**
			* Fires when element can resume playback of the [media]{@link enyo.Media} data without 
			* needing to stop for further buffering of content.
			*
			* @event enyo.Media#onCanPlayThrough
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onCanPlayThrough: '',

			/**
			* Fires when the [duration]{@link enyo.Media#duration} attribute has been changed.
			*
			* @event enyo.Media#onDurationChange
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onDurationChange: '',

			/**
			* Fires when [networkState]{@link external:networkState} switches to `NETWORK_EMPTY` 
			* from another state.
			*
			* @event enyo.Media#onEmptied
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onEmptied: '',

			/**
			* Fires when [media]{@link enyo.Media} playback finishes normally.
			*
			* @event enyo.Media#onEnded
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onEnded: '',

			/**
			* Fires when an error occurs while fetching [media]{@link enyo.Media} data.
			*
			* @event enyo.Media#onError
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onError: '',

			/**
			* Fires when the [media]{@link enyo.Media} data is rendered.
			*
			* @event enyo.Media#onLoadedData
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onLoadedData: '',

			/**
			* Fires when the [media]{@link enyo.Media} data is rendered.
			*
			* @event enyo.Media#onLoadedMetaData
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onLoadedMetaData: '',

			/**
			* Fires when the [media]{@link enyo.Media} data is rendered.
			*
			* @event enyo.Media#onLoadStart
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onLoadStart: '',

			/**
			* Fires when playback is paused.
			*
			* @event enyo.Media#onPause
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onPause: '',

			/**
			* Fires when playback is no longer paused.
			*
			* @event enyo.Media#onPlay
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onPlay: '',

			/**
			* Fires when playback is ready to start after having been paused or delayed due to lack 
			* of [media]{@link enyo.Media} data.
			*
			* @event enyo.Media#onPlaying
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onPlaying: '',

			/**
			* Fires when fetching [media]{@link enyo.Media} data.
			*
			* @event enyo.Media#onProgress
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onProgress: '',

			/**
			* Fires when either [defaultPlaybackRate]{@link enyo.Media#defaultPlaybackRate} or 
			* [playbackRate]{@link enyo.Media#playbackRate} is updated.
			*
			* @event enyo.Media#onRateChange
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onRateChange: '',

			/**
			* Fires when the seeking IDL attribute changes to false.
			*
			* @event enyo.Media#onSeeked
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onSeeked: '',

			/**
			* Fires when the seeking IDL attribute changes to false.
			*
			* @event enyo.Media#onSeeking
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onSeeking: '',

			/**
			* Fires when [media]{@link enyo.Media} fetching is interrupted.
			*
			* @event enyo.Media#onStalled
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onStalled: '',

			/**
			* Fires when the [media]{@link enyo.Media} controller position changes.
			*
			* @event enyo.Media#onTimeUpdate
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onTimeUpdate: '',

			/**
			* Fires when either [volume]{@link enyo.Media#volume} or [muted]{@link enyo.Media#muted}
			* is updated.
			*
			* @event enyo.Media#onVolumeChange
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onVolumeChange: '',

			/**
			* Fires when playback has stopped because the next frame is not available, but is 
			* expected to be.
			*
			* @event enyo.Media#onWaiting
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onWaiting: '',

			/**
			* Fires when the playback rate has changed to a value > 1.
			*
			* @event enyo.Media#onFastforward
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onFastforward: '',

			/**
			* Fires when the playback rate has changed to a positive value < 1.
			*
			* @event enyo.Media#onSlowforward
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onSlowforward: '',

			/**
			* Fires when the playback rate has changed to a value < -1.
			*
			* @event enyo.Media#onRewind
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onRewind: '',

			/**
			* Fires when the playback rate has changed to a negative value > -1.
			*
			* @event enyo.Media#onSlowrewind
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onSlowrewind: '',

			/**
			* Fires when the playback has jumped forward by the number of seconds specified by the
			* [jumpSec property]{@link enyo.Media#jumpSec}.
			*
			* @event enyo.Media#onJumpForward
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onJumpForward: '',

			/**
			* Fires when the playback has jumped backward by the number of seconds specified by the
			* [jumpSec property]{@link enyo.Media#jumpSec}.
			*
			* @event enyo.Media#onJumpBackward
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
			onJumpBackward: '',

			/**
			* Fires when playback has started.
			*
			* @event enyo.Media#onStart
			* @type {Object}
			* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
			*	propagated the [event]{@link external:event}.
			* @property {Object} event - An [object]{@link external:Object} containing 
			*	[event]{@link external:event} information.
			* @public
			*/
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
		srcChanged: function() {
			var path = enyo.path.rewrite(this.src);
			this.setAttribute('src', path);
			if (this.hasNode()) {
				this.node.load();
			}
		},

		/**
		* @private
		*/
		autoplayChanged: function() {
			this.setAttribute('autoplay', this.autoplay ? 'autoplay' : null);
		},

		/**
		* @private
		*/
		loopChanged: function() {
			this.setAttribute('loop', this.loop ? 'loop' : null);
		},

		/**
		* @private
		*/
		mutedChanged: function() {
			this.setAttribute('muted', this.muted ? 'muted' : null);
		},

		/**
		* @private
		*/
		preloadChanged: function() {
			this.setAttribute('preload', this.preload);
		},

		/**
		* @private
		*/
		defaultPlaybackRateChanged: function() {
			if (this.hasNode()) {
				this.node.defaultPlaybackRate = this.defaultPlaybackRate;
			}
		},

		/**
		* @private
		*/
		selectPlaybackRateArray: function(cmd) {
			this._playbackRateArray = this.playbackRateHash[cmd];
		},

		/**
		* @private
		*/
		selectPlaybackRate: function(index) {
			return this._playbackRateArray[index];
		},

		/**
		* @private
		*/
		clampPlaybackRate: function(index) {
			if (!this._playbackRateArray) {
				return;
			}

			return index % this._playbackRateArray.length;
		},

		/**
		* @private
		*/
		playbackRateChanged: function() {
			if (this.hasNode()) {
				this.node.playbackRate = this.playbackRate;
			}
		},

		/**
		* @private
		*/
		showControlsChanged: function() {
			this.setAttribute('controls', this.showControls ? 'controls' : null);
		},

		/**
		* @private
		*/
		volumeChanged: function() {
			if (this.hasNode()) {
				this.node.volume = this.volume;
			}
		},

		/**
		* Called when element stops fetching media data before it has been completely downloaded, 
		* but not due to an error.
		* 
		* @private
		*/
		_abort: function() {
			this.doEnded();
		},

		/**
		* Called when element can resume playback of media data, but may need to stop for further 
		* buffering of content.
		* 
		* @private
		*/
		_canPlay: function() {
			this.doCanPlay();
		},
		/**
		* Called when element can resume playback of the media data without needing to stop for 
		* further buffering of content.
		* 
		* @private
		*/
		_canPlayThrough: function() {
			this.doCanPlayThrough();
		},
		
		/**
		* Called when the [duration attribute]{@link enyo.Media#duration} has been changed.
		* 
		* @private
		*/
		_durationChange: function() {
			this.doDurationChange();
		},

		/**
		* Called when [networkState]{@link external:networkState} switches to `NETWORK_EMPTY` from 
		* another state.
		* 
		* @private
		*/
		_emptied: function() {
			this.doEmptied();
		},

		/**
		* Called when playback reaches the end of the media data.
		* 
		* @private
		*/
		_ended: function() {
			this.doEnded();
		},

		/**
		* Called when an error occurs while fetching media data.
		* 
		* @private
		*/
		_error: function() {
			this.doError();
		},
		/**
		* Called when we can render the media data at the current playback position for the first 
		* time.
		* 
		* @private
		*/
		_loadedData: function() {
			this.doLoadedData();
		},
		/**
		* Called when the media duration and dimensions of the media resource/text tracks are ready.
		* 
		* @private
		*/
		_loadedMetaData: function() {
			this.doLoadedMetaData();
		},

		/**
		* Called when the media element begins looking for media data.
		* 
		* @private
		*/
		_loadStart: function() {
			this.doLoadStart();
		},

		/**
		* Called when playback is paused.
		* 
		* @private
		*/
		_pause: function() {
			this.doPause();
		},

		/**
		* Called when playback is no longer paused.
		* 
		* @private
		*/
		_play: function() {
			this.doPlay();
		},

		/**
		* Called when playback is ready to start after having been paused or delayed due to lack of 
		* media data.
		* 
		* @private
		*/
		_playing: function() {
			this.doPlaying();
		},

		/**
		* Called when the media element is fetching media data.
		* 
		* @private
		*/
		_progress: function() {
			this.doProgress();
		},

		/**
		* @private
		*/
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

		/**
		* Calculate the number value of the given playback rate (support for fractions).
		*
		* @param {String} rate The playback rate, which can be a fraction, that will be converted to
		*	a numerical value.
		* @returns {Number} The numerical representation of the playback rate.
		* @private
		*/
		calcNumberValueOfPlaybackRate: function(rate) {
			var pbArray = String(rate).split('/');
			return (pbArray.length > 1) ? parseInt(pbArray[0], 10) / parseInt(pbArray[1], 10) : parseInt(rate, 10);
		},
		/**
		* Called when either [defaultPlaybackRate]{@link enyo.Media#defaultPlaybackRate} or 
		* [playbackRate]{@link enyo.Media#playbackRate} has been updated.
		* 
		* @private
		*/
		_rateChange: function(inSender, inEvent) {
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

		/**
		* Called when fetching of media data is interrupted.
		* 
		* @private
		*/
		_stalled: function() {
			this.doStalled();
		},
		/**
		* Called when the seeking IDL attribute changes to `false`.
		* 
		* @private
		*/
		_seeked: function() {
			this.doSeeked();
		},

		/**
		* Called when the seeking IDL attribute changes to `true`.
		* 
		* @private
		*/
		_seeking: function() {
			this.doSeeking();
		},

		/**
		* Called when the media controller position has changed.
		* 
		* @private
		*/
		_timeUpdate: function(inSender, inEvent) {
			var node = this.hasNode();

			if (!node) {
				return;
			}
			inEvent = enyo.mixin(inEvent, this.createEventData());
		},

		/**
		* Called when either [volume]{@link enyo.Media#volume} or [muted]{@link enyo.Media#muted} is
		* updated.
		* 
		* @private
		*/
		_volumeChange: function() {
			this.doVolumeChange();
		},

		/**
		* Called when playback has stopped because the next frame is not available, but is expected 
		* to be.
		*
		* @private
		*/
		_waiting: function() {
			this.doWaiting();
		},

		/**
		* Initiates playback of the media data referenced in [src]{@link enyo.Media#src}.
		*
		* @public
		*/
		play: function() {
			if (this.hasNode()) {
				this.setPlaybackRate(1);
				this._prevCommand = 'play';
				this.node.play();
			}
		},

		/**
		* Pauses media playback.
		*
		* @public
		*/
		pause: function() {
			if (this.hasNode()) {
				this.setPlaybackRate(1);
				this._prevCommand = 'pause';
				this.node.pause();
			}
		},

		/**
		* Seeks to the specified time.
		*
		* @param {Number} time The time, in seconds, to seek to.
		* @public
		*/
		seekTo: function(time) {
			if (this.hasNode()) {
				this.node.currentTime = time;
			}
		},

		/**
		* Retrieve the buffered amount of the [media]{@link enyo.Media}.
		*
		* @returns {TimeRanges} The ranges of the [media]{@link enyo.Media} 
		*	[source]{@link enyo.Media#src} that have been buffered.
		* @public
		*/
		getBuffered: function() {
			if (this.hasNode()) {
				return this.node.buffered;
			}
			return 0;
		},

		/**
		* Retrieve the current playback position.
		*
		* @returns {Number} The current playback position in seconds.
		* @public
		*/
		getCurrentTime: function() {
			if (this.hasNode()) {
				return this.node.currentTime;
			}
			return 0;
		},

		/**
		* Retrieve the total duration time of the loaded [media]{@link enyo.Media}.
		*
		* @returns {Number} The duration in seconds.
		* @public
		*/
		getDuration: function() {
			if (this.hasNode()) {
				return this.node.duration;
			}
			return 0;
		},

		/** 
		* Determine whether the [media]{@link enyo.Media} element is paused.
		*
		* @returns {Boolean} Returns `true` if the [media]{@link enyo.Media} is paused; `false`
		*	otherwise.
		* @public
		*/
		getPaused: function() {
			if (this.hasNode()) {
				return this.node.paused;
			}
		},

		/** 
		* Retrieve the played amount of the [media]{@link enyo.Media} [source]{@link enyo.Media#src} 
		* that have been played, if any.
		*
		* @returns {TimeRanges} The ranges of the [media]{@link enyo.Media} 
		*	[source]{@link enyo.Media#src} that have been played.
		* @public
		*/
		getPlayed: function() {
			if (this.hasNode()) {
				return this.node.played;
			}
		},

		/** 
		* Determine the [readiness]{@link external:readyState} of the [media]{@link enyo.Media}.
		*
		* @returns {ReadyState} Returns the [readiness]{@link external:readyState} state.
		* @public
		*/
		getReadyState: function() {
			if (this.hasNode()) {
				return this.node.readyState;
			}
		},

		/** 
		* Retrieve the ranges of the [media]{@link enyo.Media} [source]{@link enyo.Media#src} that 
		* the user is able to seek to, if any.
		*
		* @returns {TimeRanges} The ranges of the [media]{@link enyo.Media} 
		*	[source]{@link enyo.Media#src} that are seekable.
		* @public
		*/
		getSeekable: function() {
			if (this.hasNode()) {
				return this.node.seekable;
			}
		},

		/** 
		* Set current player position in the video.
		*
		* @param {Number} time The player position, in seconds.
		* @public
		*/
		setCurrentTime: function(time) {
			if ((typeof time === 'number') && this.hasNode()) {
				this.node.currentTime = time;
			}
		},

		/** 
		* Custom rewind functionality until browsers support negative playback rate.
		*
		* @public
		*/
		beginRewind: function() {
			this.node.pause();
			this.startRewindJob();
		},

		/**
		* Calculate the time that has elapsed since.
		* 
		* @private
		*/
		_rewind: function() {
			var now = enyo.perfNow(),
				distance = now - this.rewindBeginTime,
				pbRate = this.calcNumberValueOfPlaybackRate(this.playbackRate),
				adjustedDistance = Math.abs(distance * pbRate) / 1000,
				newTime = this.getCurrentTime() - adjustedDistance;
			this.setCurrentTime(newTime);
			this.startRewindJob();
		},

		/** 
		* Start rewind job.
		*
		* @public
		*/
		startRewindJob: function() {
			this.rewindBeginTime = enyo.perfNow();
			enyo.job(this.id + 'rewind', this.bindSafely('_rewind'), 100);
		},

		/** 
		* Stop rewind job.
		*
		* @public
		*/
		stopRewindJob: function() {
			enyo.job.stop(this.id + 'rewind');
		},

		/** 
		* Determine whether the [media]{@link enyo.Media} is currently seeking to a new position.
		*
		* @returns {Boolean} Returns `true` if currently seeking, otherwise `false`.
		* @public
		*/
		getSeeking: function() {
			if (this.hasNode()) {
				return this.node.seeking;
			}
		},

		/** 
		* Determine if currently in a paused state.
		*
		* @returns {Boolean} Returns `true` if paused, otherwise `false`.
		* @public
		*/
		isPaused: function() {
			return this.hasNode() ? this.hasNode().paused : true;
		},

		/** 
		* Fast forward the [media]{@link enyo.Media}, taking into account the current playback state.
		*
		* @public
		*/
		fastForward: function() {
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
		* Rewind the [media]{@link enyo.Media}, taking into account the current playback state.
		*
		* @public
		*/
		rewind: function() {
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

		/** 
		* Jump backward by an amount specified by the [jumpSec property]{@link enyo.Media#jumpSec}.
		*
		* @public
		*/
		jumpBackward: function() {
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
		* Jump forward by an amount specified by the [jumpSec property]{@link enyo.Media#jumpSec}.
		*
		* @public
		*/
		jumpForward: function() {
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
		* Jump to the beginning of the [media]{@link enyo.Media} content.
		*
		* @public
		*/
		jumpToStart: function() {
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
		* Jump to the end of the [media]{@link enyo.Media} content.
		*
		* @public
		*/
		jumpToEnd: function() {
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
