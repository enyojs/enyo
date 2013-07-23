/**
	_enyo.Audio_ implements an HTML 5 Media element by extending _enyo.Media_,
	allowing you to play audio.

	Initialize an audio component as follows:

		{kind: "enyo.Audio", src: "http://www.w3schools.com/tags/horse.mp3"}

	To play the audio, call 'this.$.audio.play()'.

	To get a reference to the actual HTML 5 Media element, call
	'this.$.audio.hasNode()'.
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