/**
A component that allows you to play sound effects or other audio resources.  This component is an abstraction of HTML 5 Audio object.

Initialize a sound component as follows:

	{kind: "Sound", src: "http://mydomain.com/media/myfile.mp3"}
	
To play a sound, do this:

	this.$.sound.play();

You can get a reference to the actual HTML 5 Audo object via <code>this.$.sound.audio</code>.
*/
enyo.kind({
	name: "enyo.Sound",
	kind: enyo.Component,
	published: {
		src: "",
		preload: true
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.srcChanged();
		this.preloadChanged();
	},
	srcChanged: function() {
		var path = enyo.path.rewrite(this.src);
		if (window.PhoneGap) {
			this.media = new Media(path);
		} else {
			this.audio = new Audio();
			this.audio.src = path;
		}
		//this.setAttribute("src", path);
	},
	preloadChanged: function() {
		//this.setAttribute("autobuffer", this.preload ? "autobuffer" : null);
		//this.setAttribute("preload", this.preload ? "preload" : null);
	},
	//* @public
	//* Play the sound
	play: function() {
		if (window.PhoneGap) {
			//new Media(this.src).play()
			this.media.play();
		} else {
			if (!this.audio.paused) {
				this.audio.currentTime = 0;
			} else {
				this.audio.play();
			}
		}
	}
});
