(function (enyo, scope) {
	/**
	* _enyo.Audio_ extends {@link enyo.Media} to implement an 
	* [HTML 5 Media element]{@link external:HTML5MediaElement} that allows you to play audio data.
	* 
	* Initialize an audio component as follows:
	*
	* ```
	* {kind: 'enyo.Audio', src: 'http://www.w3schools.com/tags/horse.mp3'}
	* ```
	* 
	* To play the audio, call `this.$.audio.play()`.
	* 
	* To get a reference to the actual HTML 5 Media element, call `this.$.audio.hasNode()`.
	*
	* @class enyo.Audio
	* @extends enyo.Media
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Audio.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Audio',

		/**
		* @private
		*/
		kind: 'enyo.Media',

		/**
		* @private
		*/
		tag: 'audio',

		/**
		* @private
		*/
		published: {
			/** 
			* Indicates how data should be preloaded, reflecting the 
			* [preload HTML attribute]{@link external:audio} ('none', 'metadata', 'auto').
			*
			* @type {String}
			* @default 'auto'
			* @memberof enyo.Audio.prototype
			* @public
			*/
			preload: 'auto'
		}
	});
})(enyo, this);
