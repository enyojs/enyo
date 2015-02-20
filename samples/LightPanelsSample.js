enyo.kind({
	name: 'enyo.sample.LightPanelsSample',
	classes: 'light-panels-sample',
	components: [
		{kind: 'enyo.LightPanels', name: 'lightHorizontal'},
		{kind: 'enyo.LightPanels', name: 'lightVertical', orientation: 'vertical'}
	],
	rendered: function () {
		this.inherited(arguments);
		this.pushSinglePanel(this.$.lightHorizontal);
		this.pushSinglePanel(this.$.lightVertical);
	},
	pushSinglePanel: function (panels) {
		panels.pushPanels([{
			classes: 'light-panel',
			style: 'background-color: ' + this.bgcolors[Math.floor(Math.random() * this.bgcolors.length)],
			components: [
				{content: panels.getPanels().length, classes: 'label'},
				{content: 'Prev', kind: 'enyo.Button', classes: 'previous', ontap: 'prevTapped'},
				{content: 'Next', kind: 'enyo.Button', classes: 'next', ontap: 'nextTapped'}
			]
		}], {owner: this});
	},
	prevTapped: function (sender, ev) {
		ev.originator.parent.parent.previous();
		return true;
	},
	nextTapped: function (sender, ev) {
		this.pushSinglePanel(ev.originator.parent.parent);
		return true;
	},
	bgcolors: ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']
});
