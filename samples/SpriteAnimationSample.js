enyo.kind({
	kind: "FittableRows",
	name: "enyo.sample.SpriteAnimationSample",
	classes: "sprite-animation-sample",
	components: [
		{content: "Sprite Animation (Horizontally Sprited)", classes: "section"},
		{kind: "enyo.SpriteAnimation", name: "sprite1", src: "http://www.polybeast.de/portfolio/SkybusterExplosion.jpg", width: 320, height: 240, rows: 5, columns: 4, duration: 2000},
		{kind: "enyo.Select", name: "sprite1Picker", onchange: "select1Changed", components: [
			{content: "0.5s", value: "500"},
			{content: "1s", value: "1000"},
			{content: "2s", value: "2000", selected: true},
			{content: "3s", value: "3000"},
			{content: "4s", value: "4000"},
			{content: "5s", value: "5000"},
			{content: "6s", value: "6000"},
			{content: "7s", value: "7000"},
			{content: "8s", value: "8000"},
			{content: "9s", value: "9000"},
			{content: "10s", value: "10000"}
		]},
		// {kind: "moon.SimpleIntegerPicker", name: "sprite1Picker", value: 2},
		{content: "Sprite Animation (Vertically Sprited)", classes: "section"},
		{kind: "enyo.SpriteAnimation", name: "sprite2", src: "http://media.pyweek.org/dl/3/RoeBros/herring-sub.png", cellOrientation: "vertical", width: 50, height: 50, rows: 3, columns: 16, duration: 6000},
		{kind: "enyo.Select", name: "sprite2Picker", onchange: "select2Changed", components: [
			{content: "0.5s", value: "500"},
			{content: "1s", value: "1000"},
			{content: "2s", value: "2000"},
			{content: "3s", value: "3000"},
			{content: "4s", value: "4000"},
			{content: "5s", value: "5000"},
			{content: "6s", value: "6000", selected: true},
			{content: "7s", value: "7000"},
			{content: "8s", value: "8000"},
			{content: "9s", value: "9000"},
			{content: "10s", value: "10000"}
		]}
	],
	bindings: [
		{from: ".$.sprite1Picker.value", to: ".$.sprite1.duration"},
		{from: ".$.sprite2Picker.value", to: ".$.sprite2.duration"}
	]
});
