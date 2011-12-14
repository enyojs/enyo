/**
A control that allows you to play video.  This component is an abstraction of HTML 5 Video.

Initialize a video component as follows:

	{kind: "Video", src: "http://www.w3schools.com/html5/movie.mp4"}
	
To play a video, do this:

	this.$.video.play();

You can get a reference to the actual HTML 5 Video element via <code>this.$.video.hasNode()</code>.
*/
enyo.kind({
	name: "enyo.Video",
	kind: enyo.Control,
	published: {
		/** source URL of the video file, can be relative to the application's HTML file */
		src: "",
		/** source of image file to show when video isn't available */
		poster: "",
		/** if true, show controls for starting and stopping video playback */
		showControls: true,
		/** if true, video will automatically start */
		autoplay: false,
		/** if true, restart video playback from beginning when finished */
		loop: false,
		/** (webOS only) if true, stretch the video to fill the entire window */
		fitToWindow: false
	},
	components: [ 
		{name: "mediad", kind: "PalmService"} 
	], 
	//* @protected
	tagName: "video",
	create: function() {
		this.inherited(arguments);
		this.srcChanged();
		this.posterChanged();
		this.showControlsChanged();
		this.autoplayChanged();
		this.loopChanged();
	},
	rendered: function() {
		// delayed until here because we need the node to be created 
		// to modify this property
		this.fitToWindowChanged();
	},
	srcChanged: function() {
		var path = enyo.path.rewrite(this.src);
		this.setAttribute("src", path);
		// HTML5 spec says that if you change src after page is loaded, 
		// you need to call load() to load the new data
		if (this.hasNode()) {
			this.node.load();
		}
	},
	posterChanged: function() {
		if (this.poster) {
			var path = enyo.path.rewrite(this.poster);
			this.setAttribute("poster", path);
		}
		else {
			this.setAttribute("poster", null);
		}
	},
	showControlsChanged: function() {
		this.setAttribute("controls", this.showControls ? "controls" : null);
	},
	autoplayChanged: function() {
		this.setAttribute("autoplay", this.autoplay ? "autoplay" : null);
	},
	loopChanged: function() {
		this.setAttribute("loop", this.loop ? "loop" : null);
	},
	fitToWindowChanged: function() { 
		if (!this.hasNode()) {
			return;
		}
		
		var mediaPlayerUrl = this.node.getAttribute("x-palm-media-control");
		if (mediaPlayerUrl) { 
			this.$.mediad.call(
				{ args: (this.fitToWindow ? [ "VIDEO_FIT" ] : [ "VIDEO_FILL" ]) }, 
				{ service: mediaPlayerUrl,  method: "setFitMode" });
		}
	}, 
	//* @public
	//* Play the video
	play: function() {
		if (this.hasNode()) {
			if (!this.node.paused) {
				this.node.currentTime = 0;
			} else {
				this.node.play();
			}
		}
	},
	//* Pause the video
	pause: function() {
		if (this.hasNode()) {
			this.node.pause();
		}
	}
});
