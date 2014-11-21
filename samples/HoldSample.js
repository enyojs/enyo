(function (enyo, scope) {

	var h = {
		ontap: 'tapped',
		ondown: 'setConfig',
		onSpotlightKeyDown: 'setConfigSpotlight',
		onhold: 'held',
		onholdpulse: 'pulse',
		onrelease: 'released'
	};

	enyo.kind({
		name: 'enyo.sample.HoldSample',
		kind:'FittableRows',
		components: [
			{tag: 'h2', content: 'Configuration'},
			{name: 'config', kind: 'enyo.TextArea', style: 'display: block; width: 100%; height: 25em;'},
			{tag: 'h2', content: 'Hold This...'},
			{name: 'aButton', mixins: [h], spotlight: true, kind: 'enyo.Button', minWidth: false, content: 'Button A', },
			{tag: 'h2', content: 'Display'},
			{tag: 'ul', components: [
				{tag: 'li', name: 'd', allowHtml: true, idleContent: '<i>waiting for hold events...</i>'},
				{tag: 'li', name: 'd2', allowHtml: true, idleContent: '<i>waiting for pulse events...</i>'},
				{tag: 'li', name: 'd3', allowHtml: true, idleContent: '<i>waiting for other events...</i>'}
			]}
		],
		bindings: [
			{from: '$.config.value', to: 'config', transform: 'parseConfig'}
		],
		parseConfig: function(str) {
			var cfg;
			try {
				cfg = JSON.parse(str);
				this.setHandlers(cfg);
			} catch (e) {
				this.log('oops');
				cfg = this.config1;
			}
			return cfg;
		},
		setHandlers: function(cfg) {
			var evts = cfg.events,
				i,
				evt;
			if (evts) {
				for (i = 0; evt = evts[i]; i++) {
					this.handlers['on' + evt.name] = 'held';
				}
			}
		},
		create: function() {
			this.inherited(arguments);
			['d', 'd2', 'd3'].forEach(this.bindSafely(function(d) {
				this.reset(d);
			}));
			this.$.config.set('value', JSON.stringify(this.config1, undefined, 2));
		},
		reset: function(display) {
			d = this.$[display];
			d.set('content', d.get('idleContent'))
		},
		resetSoon: function(display) {
			this.startJob('reset_' + display, function() {
				this.reset(display);
			}, 2000);
		},
		report: function(actor, action, display) {
			this.$[display].setContent(actor.content + ': ' + action);
			this.resetSoon(display);
		},
		setConfig: function(sender, event) {
			event.configureHoldPulse(this.config);
		},
		setConfigSpotlight: function(sender, event) {
			if (event.keyCode === 13 && !enyo.Spotlight.Accelerator.isAccelerating()) {
				event.configureHoldPulse(this.config);
			}
		},
		tapped: function(sender, event) {
			this.report(sender, 'tapped', 'd3');
		},
		pulse: function(sender, event) {
			this.report(sender, 'pulsing (' + event.holdTime + ')', 'd2');
		},
		held: function(sender, event) {
			this.report(sender, event.type, 'd');
		},
		released: function(sender, event) {
			this.report(sender, 'released', 'd');
		},
		config1: {
			frequency: 200, resume: true, endHold: 'onLeave',
			events: [
				{name: 'hold', time: 200},
				{name: 'longpress', time: 1000},
				{name: 'reallylongpress', time: 2000}
			]
		}
	});

})(enyo, this);
