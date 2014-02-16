/*
	Copyright 2014 LG Electronics, Inc.

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/
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