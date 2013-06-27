enyo.kind({
	name: "enyo.sample.AudioSample",
	classes: "audio-sample",
	components: [
		{kind: "enyo.Audio", onEnded: "ended"},
		{content: "Sounds", classes:"audio-sample-divider"},
		{classes: "onyx-toolbar-inline", components: [
			{kind: "onyx.PickerDecorator", components: [
				{},
				{kind: "onyx.Picker", onSelect: "itemSelected", components: [
					{content: "Birds", active: true},
					{content: "Cat"},
					{content: "Cow"},
					{content: "Guitar"}
				]}
			]},
			{kind: "onyx.Button", content: "Play", ontap: "togglePlay"}
		]},
		{tag: "br"},
		{name: "console"}
	],
	sounds: [
		{label: "Birds", src: "http://www.universal-soundbank.com/mp3/sounds/12591.mp3"},
		{label: "Cat", src: "http://www.universal-soundbank.com/mp3/sounds/986.mp3"},
		{label: "Cow", src: "http://www.universal-soundbank.com/mp3/sounds/101.mp3"},
		{label: "Guitar", src: "http://www.universal-soundbank.com/mp3/sounds/18265.mp3"}
	],
	rendered: function() {
		this.inherited(arguments);
		this.loadAudio(0);
	},
	loadAudio: function(inIndex) {
		this.$.audio.setSrc(this.sounds[inIndex].src);
		this.$.console.setContent("");
		this.$.button.setContent("Play");
	},
	playAudio: function() {
		this.$.audio.play();
		this.$.button.setContent("Pause");
		this.$.console.setContent("Audio playing");
	},
	pauseAudio: function() {
		this.$.audio.pause();
		this.$.button.setContent("Play");
		this.$.console.setContent("Audio paused");
	},
	togglePlay: function(inSender, inResponse) {
		if (this.$.audio.getPaused()) {
			this.playAudio();
		} else {
			this.pauseAudio();
		}
	},
	ended: function(inSender, inResponse) {
		this.$.console.setContent("Audio ended");
		this.$.button.setContent("Play");
	},
	itemSelected: function(inItem) {
		var content = inItem.selected.getContent();
		var soundCount = this.sounds.length;
		for (var i=0; i<soundCount; i++) {
			if (content === this.sounds[i].label) {
				this.loadAudio(i);
				break;
			}
		}
	}
});