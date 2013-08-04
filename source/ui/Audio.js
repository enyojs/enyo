/**
	_enyo.Audio_ extends [enyo.Media](#enyo.Media) to implement an HTML 5 Media
	element that allows you to play audio data.

	Initialize an audio component as follows:

		{kind: "enyo.Audio", src: "http://www.w3schools.com/tags/horse.mp3"}

	To play the audio, call _this.$.audio.play()_.

	To get a reference to the actual HTML 5 Media element, call
	_this.$.audio.hasNode()_.
*/
enyo.kind({
	name: "enyo.Audio",
	kind: "enyo.Media",
	tag: "audio",
	published: {
		//* Indicates how data should be preloaded, reflecting the preload HTML attribute (none, metadata, auto)
		preload: "auto"
	}
});