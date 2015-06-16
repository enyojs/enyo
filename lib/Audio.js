require('enyo');

/**
* Contains the declaration for the {@link enyo.Audio} kind.
* @module enyo/Audio
*/

var
	kind = require('./kind');
var
	Media = require('./Media');

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
* @namespace enyo
* @class enyo.Audio
* @extends enyo.Media
* @ui
* @definedby module:enyo/Audio
* @public
*/
module.exports = kind(
	/** @lends enyo.Audio.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.Audio',

	/**
	* @private
	*/
	kind: Media,

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
