enyo.kind({
	name: 'enyo.sample.LightPanelsSample',
	classes: 'light-panels-sample',
	components: [
		{kind: 'enyo.LightPanels'}
	],
	rendered: function () {
		this.inherited(arguments);
		this.pushSinglePanel();
	},
	pushSinglePanel: function () {
		this.$.lightPanels.pushPanels([{
			classes: 'light-panel',
			style: 'background-color: ' + this.bgcolors[Math.floor(Math.random() * this.bgcolors.length)],
			components: [
				{content: 'Panel ' + this.$.lightPanels.getPanels().length},
				{content: 'Prev', kind: 'enyo.Button', style: 'position:absolute;left:0;bottom:50%', ontap: 'prevTapped'},
				{content: 'Next', kind: 'enyo.Button', style: 'position:absolute;right:0;bottom:50%', ontap: 'nextTapped'}
			]
		}], {owner: this});
	},
	prevTapped: function () {
		this.$.lightPanels.previous();
		return true;
	},
	nextTapped: function () {
		this.pushSinglePanel();
		return true;
	},
	bgcolors: ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']
});
