(function (enyo, scope) {
	/**
	* {@link enyo.Audio} extends {@link enyo.Media} to implement an
	* [HTML 5 Media element]{@glossary HTML5MediaElement} that allows you to play
	* audio data.
	*
	* Initialize an audio component as follows:
	*
	* ```
	* {kind: 'enyo.Audio', src: 'http://www.w3schools.com/tags/horse.mp3'}
	* ```
	* 
	* To play the audio, call `this.$.audio.play()`.
	* 
	* To get a reference to the actual [HTML 5 Media element]{@glossary HTML5MediaElement}, 
	* call `this.$.audio.hasNode()`.
	*
	* @class enyo.Audio
	* @extends enyo.Media
	* @ui
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
		published: 
			/** @lends enyo.Audio.prototype */ {
			
			/** 
			* Indicates how data should be preloaded, reflecting the `preload` HTML attribute.
			* Will be one of `'none'`, `'metadata'`, or `'auto'` (the default).
			*
			* @type {String}
			* @default 'auto'
			* @public
			*/
			preload: 'auto'
		}
	});
	
})(enyo, this);
