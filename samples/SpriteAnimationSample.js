enyo.kind({
	kind: 'FittableRows',
	name: 'enyo.sample.SpriteAnimationSample',
	classes: 'sprite-animation-sample',
	handlers: {
		onSpriteAnimationEnds: 'animationEndHandler'
	},
	components: [
		{content: 'Sprite Animation (Horizontally Sprited)', classes: 'section'},
		{kind: 'enyo.SpriteAnimation', name: 'sprite1', classes: 'animation', src: 'http://www.polybeast.de/portfolio/SkybusterExplosion.jpg', width: 320, height: 240, rows: 5, columns: 4, duration: 2000},
		{kind: 'enyo.SpriteAnimation', name: 'sprite3', classes: 'animation', useCssAnimation: false, src: 'http://www.polybeast.de/portfolio/SkybusterExplosion.jpg', width: 320, height: 240, rows: 5, columns: 4, duration: 2000},
		{components: [
			{tag: 'label', content: 'Animation Duration:'},
			{kind: 'enyo.Select', name: 'sprite1Picker', onchange: 'select1Changed', components: [
				{content: '0.5s', value: 500},
				{content: '1s', value: 1000},
				{content: '2s', value: 2000, selected: true},
				{content: '3s', value: 3000},
				{content: '4s', value: 4000},
				{content: '5s', value: 5000},
				{content: '6s', value: 6000},
				{content: '7s', value: 7000},
				{content: '8s', value: 8000},
				{content: '9s', value: 9000},
				{content: '10s', value: 10000}
			]}
		]},
		{components: [
			{tag: 'label', content: ' Loop count:'},
			{kind: 'enyo.Select', name: 'iterationPicker', onchange: 'iterationChanged', components: [
				{content: 'Infinite', value: null},
				{content: '1', value: 1},
				{content: '2', value: 2},
				{content: '3', value: 3},
				{content: '4', value: 4},
				{content: '5', value: 5, selected: true},
				{content: '6', value: 6},
				{content: '7', value: 7},
				{content: '8', value: 8},
				{content: '9', value: 9},
				{content: '10', value: 10}
			]}
		]},
		{content: 'Sprite Animation (Vertically Sprited)', classes: 'section'},
		{kind: 'enyo.SpriteAnimation', name: 'sprite2', classes: 'animation', src: 'http://media.pyweek.org/dl/3/RoeBros/herring-sub.png', cellOrientation: 'vertical', width: 50, height: 50, rows: 3, columns: 16, duration: 6000},
		{kind: 'enyo.SpriteAnimation', name: 'sprite4', classes: 'animation', useCssAnimation: false, src: 'http://media.pyweek.org/dl/3/RoeBros/herring-sub.png', cellOrientation: 'vertical', width: 50, height: 50, rows: 3, columns: 16, duration: 6000},
		{components: [
			{tag: 'label', content: 'Animation Duration:'},
			{kind: 'enyo.Select', name: 'sprite2Picker', onchange: 'select2Changed', components: [
				{content: '0.5s', value: 500},
				{content: '1s', value: 1000},
				{content: '2s', value: 2000},
				{content: '3s', value: 3000},
				{content: '4s', value: 4000},
				{content: '5s', value: 5000},
				{content: '6s', value: 6000, selected: true},
				{content: '7s', value: 7000},
				{content: '8s', value: 8000},
				{content: '9s', value: 9000},
				{content: '10s', value: 10000}
			]}
		]}
	],
	bindings: [
		{from: '$.sprite1Picker.value', to: '$.sprite1.duration'},
		{from: '$.sprite1Picker.value', to: '$.sprite3.duration'},
		{from: '$.sprite2Picker.value', to: '$.sprite2.duration'},
		{from: '$.sprite2Picker.value', to: '$.sprite4.duration'},
		{from: '$.iterationPicker.value', to: '$.sprite3.iterationCount'},
		{from: '$.iterationPicker.value', to: '$.sprite1.iterationCount'}
	],
	animationEndHandler: function(sender, ev) {
		enyo.log('onEnd', sender.id, sender.useCssAnimation, sender.iterationCount);
	}
});
