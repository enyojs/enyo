(function (enyo, scope) {
	/**
	* Fires when [playbackRate]{@link enyo.Video#playbackRate} is changed to an integer greater than 
	* `1`.
	*
	* @event enyo.Video#event:onFastforward
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*	[event]{@link external:event} information.
	* @public
	*/

	/**
	* Fires when [playbackRate]{@link enyo.Video#playbackRate} is changed to a value between `0` and
	* `1`.
	*
	* @event enyo.Video#event:onSlowforward
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*	[event]{@link external:event} information.
	* @public
	*/

	/**
	* Fires when [playbackRate]{@link enyo.Video#playbackRate} is changed to an integer less than 
	* `-1`.
	*
	* @event enyo.Video#event:onRewind
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*	[event]{@link external:event} information.
	* @public
	*/

	/**
	* Fires when [playbackRate]{@link enyo.Video#playbackRate} is changed to a value less than `0` 
	* but greater than or equal to `-1`.
	*
	* @event enyo.Video#event:onSlowrewind
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*	[event]{@link external:event} information.
	* @public
	*/

	/**
	* Fires when [_jumpForward()_]{@link enyo.Video#jumpForward} is called.
	*
	* @event enyo.Video#event:onJumpForward
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*	[event]{@link external:event} information.
	* @public
	*/

	/**
	* Fires when [_jumpBackward()_]{@link enyo.Video#jumpBackward} is called.
	*
	* @event enyo.Video#event:onJumpBackward
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*	[event]{@link external:event} information.
	* @public
	*/

	/**
	* Fires when EventData is changed.
	*
	* @event enyo.Video#event:onPlay
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*	[event]{@link external:event} information.
	* @public
	*/

	/**
	* Fires when the [image]{@link enyo.Image} has loaded.
	*
	* @event enyo.Video#event:onStart
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*	[event]{@link external:event} information.
	* @public
	*/

	/**
	* _enyo.Video_ is a [control]{@link enyo.Control} that allows you to play video. It is an
	* abstraction of HTML 5 [Video]{@link external:video}.
	* 
	* Initialize a [video]{@link enyo.Video} [component]{@link enyo.Component} as follows:
	*
	* ```
	* {kind: 'Video', src: 'http://www.w3schools.com/html/movie.mp4'}
	* ```
	* 
	* To play a [video]{@link enyo.Video}, call `this.$.video.play()`.
	* 
	* To get a reference to the actual HTML 5 [Video]{@link external:video} element, call
	* `this.$.video.hasNode()`.
	*
	* @ui
	* @class enyo.Video
	* @extends enyo.Control
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Video.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Video',

		/**
		* @private
		*/
		kind: enyo.Control,

		/**
		* @private
		*/
		published: 
			/** @lends enyo.Video.prototype */ {

			/**
			* Source URL of the [video]{@link enyo.Video} file; may be relative to the application's
			* HTML file.
			* 
			* @type {String}
			* @default ''
			* @public
			*/
			src: '',

			/**
			* Specify multiple sources for the same [video]{@link enyo.Video} file.
			* 
			* @type {Object}
			* @default null
			* @public
			*/
			sourceComponents: null,

			/**
			* Source of image file to show when [video]{@link enyo.Video} is not available.
			* 
			* @type {String}
			* @default ''
			* @public
			*/
			poster: '',

			/**
			* If `true`, controls for starting and stopping the [video]{@link enyo.Video} player are
			* shown.
			* 
			* @type {Boolean}
			* @default false
			* @public
			*/
			showControls: false,

			/**
			* Determines how (or if) the [video]{@link enyo.Video} object is preloaded. Possible 
			* values: 
			* - 'auto': Preload the video data as soon as possible.
			* - 'metadata': Preload only the video metadata.
			* - 'none': Do not preload any video data.
			* 
			* @type {String}
			* @default 'metadata'
			* @public
			*/
			preload: 'metadata',

			/**
			* If `true`, [video]{@link enyo.Video} will automatically start playing.
			* 
			* @type {Boolean}
			* @default false
			* @public
			*/
			autoplay: false,

			/**
			* If `true`, when playback is finished, [video]{@link enyo.Video} player will restart 
			* from the beginning.
			* 
			* @type {Boolean}
			* @default false
			* @public
			*/
			loop: false,

			/**
			* If `true`, [video]{@link enyo.Video} is stretched to fill the entire window (webOS 
			* only).
			* 
			* @type {Boolean}
			* @default false
			* @public
			*/
			fitToWindow: false,

			/**
			* [Video]{@link enyo.Video} aspect ratio expressed as _width: height_
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
			* Mapping of playback rate names to playback rate values that can be set as follows:
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
			onplay: '_play'
		},

		/**
		* @private
		*/
		tag: 'video',

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
				this.posterChanged();
				this.showControlsChanged();
				this.preloadChanged();
				this.autoplayChanged();
				this.loopChanged();
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
				this.hookupVideoEvents();
			};
		}),

		/**
		* @private
		*/
		posterChanged: function() {
			if (this.poster) {
				var path = enyo.path.rewrite(this.poster);
				this.setAttribute('poster', path);
			}
			else {
				this.setAttribute('poster', null);
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
		preloadChanged: function() {
			this.setAttribute('preload', this.preload ? this.preload : null);
		},

		/**
		* @private
		*/
		autoplayChanged: function() {
			this.setAttribute('autoplay', this.autoplay ? 'autoplay' : null);
			this._prevCommand = this.autoplay ? 'play' : 'pause';
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
		fitToWindowChanged: function() {
			if (!this.hasNode()) {
				return;
			}
		},

		/**
		* @private
		*/
		srcChanged: function() {
			// We override the inherited method from enyo.Control because
			// it prevents us from setting src to a falsy value.
			this.setAttribute('src', enyo.path.rewrite(this.src));
		},
		
		/**
		* Load the current [video]{@link enyo.Video} [source]{@link enyo.Video#src}.
		* 
		* @public
		*/
		load: function() {
			if(this.hasNode()) { this.hasNode().load(); }
		},

		/**
		* Unloads the current [video]{@link enyo.Video} [source]{@link enyo.Video#src}, stopping all
		* playback and buffering.
		* 
		* @public
		*/
		unload: function() {
			this.set('src', '');
			this.load();
		},

		/**
		* Initiates playback of the media data.
		* 
		* @public
		*/
		play: function() {
			if (!this.hasNode()) {
				return;
			}
			this._speedIndex = 0;
			this.setPlaybackRate(1);
			this.node.play();
			this._prevCommand = 'play';
		},

		/**
		* Pauses media playback.
		* 
		* @public
		*/
		pause: function() {
			if (!this.hasNode()) {
				return;
			}
			this._speedIndex = 0;
			this.setPlaybackRate(1);
			this.node.pause();
			this._prevCommand = 'pause';
		},

		/**
		* Changes the playback speed via [selectPlaybackRate]{@link enyo.Video#selectPlaybackRate}.
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
		* Changes the playback speed via [selectPlaybackRate]{@link enyo.Video#selectPlaybackRate}.
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

		/**
		* Jumps backward [jumpSec]{@link enyo.Video#jumpSec} seconds from the current time.
		*
		* @fires enyo.Video#event:doJumpBackward
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
		* Jumps forward [jumpSec]{@link enyo.Video#jumpSec} seconds from the current time.
		*
		* @fires enyo.Video#event:doJumpForward
		* @public
		*/
		jumpForward: function() {
			var node = this.hasNode();

			if (!node) {
				return;
			}

			this.setPlaybackRate(1);
			node.currentTime += parseInt(this.jumpSec, 10);
			this._prevCommand = 'jumpForward';

			this.doJumpForward(enyo.mixin(this.createEventData(), {jumpSize: this.jumpSec}));
		},

		/**
		* Jumps to beginning of media [source]{@link enyo.Video#src} and sets 
		* [playbackRate]{@link enyo.Video#playbackRate} to `1`.
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
		* Jumps to end of media [source]{@link enyo.Video#src} and sets 
		* [playbackRate]{@link enyo.Video#playbackRate} to `1`.
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
		},

		/**
		* Sets the playback rate type (from the [keys]{@link external:Object.keys} of 
		* [playbackRateHash]{@link enyo.Video#playbackRateHash}).
		*
		* @param {String} cmd Key of the playback rate type.
		* @public
		*/
		selectPlaybackRateArray: function(cmd) {
			this._playbackRateArray = this.playbackRateHash[cmd];
		},

		/**
		* Changes [playbackRate]{@link enyo.Video#playbackRate} to a valid value when initiating 
		* fast forward or rewind.
		*
		* @param {Number} idx The index of the desired playback rate.
		* @public
		*/
		clampPlaybackRate: function(idx) {
			if (!this._playbackRateArray) {
				return;
			}

			return idx % this._playbackRateArray.length;
		},

		/**
		* Retrieve the playback rate name.
		*
		* @param {Number} idx The index of the desired playback rate.
		* @returns {String} The playback rate name.
		* @public
		*/
		selectPlaybackRate: function(idx) {
			return this._playbackRateArray[idx];
		},

		/**
		* Sets [playbackRate]{@link enyo.Video#playbackRate}.
		* 
		* @param {String} rate The desired playback rate.
		* @public
		*/
		setPlaybackRate: function(rate) {
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
		* Determine the paused state.
		*
		* @returns {Boolean} Returns `true if paused, `false` otherwise.
		* @public
		*/
		isPaused: function() {
			return this.hasNode() ? this.hasNode().paused : true;
		},

		/**
		* Determine the current player position in the [video]{@link enyo.Video}.
		*
		* @returns {Number} The current player position in seconds.
		* @public
		*/
		getCurrentTime: function() {
			return this.hasNode() ? this.hasNode().currentTime : 0;
		},

		/**
		* Determine the buffered [time range]{@link external:TimeRanges}.
		*
		* @returns {TimeRanges} The buffered [time range]{@link external:TimeRanges}.
		* @public
		*/
		getBufferedTimeRange: function() {
			return this.hasNode() ? this.hasNode().buffered : 0;
		},

		/**
		* Sets the current player position in the [video]{@link enyo.Video}.
		*
		* @param {Number} time The number of seconds to set the current player position to.
		* @public
		*/
		setCurrentTime: function(time) {
			if ((typeof time === 'number') && this.hasNode()) {
				this.node.currentTime = time;
			}
		},

		/**
		* Determine the play duration in the [video]{@link enyo.Video}.
		*
		* @returns {Number} The play duration in seconds.
		* @public
		*/
		getDuration: function() {
			return this.hasNode() ? this.hasNode().duration : 0;
		},

		/**
		* Determines the [readyState]{@link external:readyState} of the [video]{@link enyo.Video}.
		*
		* @returns {ReadyState} The [readyState]{@link external:readyState} of the 
		*	[video]{@link enyo.Video}.
		* @public
		*/
		getReadyState: function() {
			return this.hasNode() ? this.hasNode().readyState : -1;
		},

		/**
		* Determines the seeking status of the player.
		*
		* @returns {Boolean} Returns `true` if currently seeking, `false` otherwise.
		* @public
		*/
		getSeeking: function() {
			return this.hasNode() ? this.hasNode().seeking : -1;
		},

		/**
		* Custom rewind functionality until browsers support negative playback rate.
		* 
		* @private
		*/
		beginRewind: function() {
			this.node.pause();
			this.startRewindJob();
		},

		/**
		* Calculate the time that has elapsed since
		* 
		* @private
		*/
		_rewind: function() {
			var now = enyo.perfNow(),
				distance = now - this.rewindBeginTime,
				pbRate = this.calcNumberValueOfPlaybackRate(this.playbackRate),
				adjustedDistance = Math.abs(distance * pbRate) / 1000,
				newTime = this.getCurrentTime() - adjustedDistance
			;

			this.setCurrentTime(newTime);
			this.startRewindJob();
		},

		/**
		* Start rewind job
		* 
		* @private
		*/
		startRewindJob: function() {
			this.rewindBeginTime = enyo.perfNow();
			enyo.job(this.id + 'rewind', this.bindSafely('_rewind'), 100);
		},

		/**
		* Stop rewind job
		* 
		* @private
		*/
		stopRewindJob: function() {
			enyo.job.stop(this.id + 'rewind');
		},

		/**
		* Calc number value of rate (support for fractions)
		* 
		* @private
		*/
		calcNumberValueOfPlaybackRate: function(rate) {
			var pbArray = String(rate).split('/');
			return (pbArray.length > 1) ? parseInt(pbArray[0], 10) / parseInt(pbArray[1], 10) : parseInt(rate, 10);
		},

		/**
		* When we get the [video]{@link enyo.Video} metadata, update the
		* [aspectRatio]{@link enyo.Video#aspectRatio} property.
		* 
		* @private
		*/
		metadataLoaded: function(sender, e) {
			var node = this.hasNode();
			this.setAspectRatio('none');
			if (!node || !node.videoWidth || !node.videoHeight) {
				return;
			}
			this.setAspectRatio(node.videoWidth/node.videoHeight+':1');
			e = enyo.mixin(e, this.createEventData());
		},

		/**
		* @private
		*/
		timeupdate: function(sender, e) {
			var node = this.hasNode();

			if (!node) {
				return;
			}
			e = enyo.mixin(e, this.createEventData());
		},

		/**
		* @fires enyo.Video#event:doSlowforward
		* @fires enyo.Video#event:doFastforward
		* @fires enyo.Video#event:doSlowrewind
		* @fires enyo.Video#event:doRewind
		* @fires enyo.Video#event:doPlay
		* @private
		*/
		ratechange: function(sender, e) {
			var node = this.hasNode(),
				pbNumber
			;

			if (!node) {
				return;
			}

			e = enyo.mixin(e, this.createEventData());

			pbNumber = this.calcNumberValueOfPlaybackRate(e.playbackRate);

			if (pbNumber > 0 && pbNumber < 1) {
				this.doSlowforward(e);
			} else if (pbNumber > 1) {
				this.doFastforward(e);
			} else if (pbNumber < 0 && pbNumber >= -1) {
				this.doSlowrewind(e);
			} else if (pbNumber < -1) {
				this.doRewind(e);
			} else if (pbNumber == 1) {
				this.doPlay(e);
			}
		},

		/**
		* @fires enyo.Video#event:doStart
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
		* Normalizes enyo-generated _onPlay_ [events]{@link external:event}.
		* 
		* @fires enyo.Video#event:doPlay
		* @private
		*/
		_play: function(sender, e) {
			var node = this.hasNode();

			if (!node) {
				return;
			}

			e = enyo.mixin(e, this.createEventData());

			this.doPlay(e);
		},

		/**
		* Add all HTML5 [video]{@link external:video} [events]{@link external:event}.
		* 
		* @private
		*/
		hookupVideoEvents: function() {
			enyo.makeBubble(this,
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

})(enyo, this);
