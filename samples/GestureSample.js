enyo.kind({
	name: "enyo.sample.GestureSample",
	kind: "FittableRows",
	classes: "gesture-sample enyo-fit enyo-unselectable",
	components: [
		{
			classes:"gesture-sample-pad",
			name: "gestureSamplePad",
			fit:true,
			doubleTapEnabled: false,
			ondown: "handleEvent",
			onup: "handleEvent",
			ontap: "handleEvent",
			onmove: "handleEvent",
			onenter: "handleEvent",
			onleave: "handleEvent",
			ondragstart: "handleEvent",
			ondrag: "handleEvent",
			ondragover: "handleEvent",
			onhold: "handleEvent",
			onrelease: "handleEvent",
			onholdpulse: "handleEvent",
			onflick: "handleEvent",
			ongesturestart: "handleEvent",
			ongesturechange: "handleEvent",
			ongestureend: "handleEvent",
			ondoubletap: "handleEvent",
			onlongpress: "handleEvent",
			onlongerpress: "handleEvent",
			components: [
				{content: "Perform gestures here", style: "pointer-events: none;"},
				{classes: "gesture-sample-note", content:"(tap below for options)", style: "pointer-events: none;"}
			]
		},
		{kind: "onyx.Groupbox", ontap:"toggleSettings", components: [
			{kind: "onyx.GroupboxHeader", content: "Events"},
			{name: "eventList", style:"font-size:12px;", onDone:"removeEvent", components: [
				{name:"waiting", content: "Waiting for events...", style:"padding:4px;font-style:italic;color:gray;"}
			]}
		]},
		{ontap:"toggleSettings", name:"settings", showing:false, components: [
			{kind: "onyx.Groupbox", classes:"gesture-sample-padded", components: [
				{kind: "onyx.GroupboxHeader", content: "Options"},
				{classes:"gesture-sample-setting", components: [
					{content:"Truncate detail on small screen: "},
					{name:"truncateDetail", onchange:"truncateChanged", ontap:"preventDefault", kind:"onyx.Checkbox", checked:true}
				]},
				{classes:"gesture-sample-setting", components: [
					{content:"Enable Double Tap: "},
					{name:"enableDoubleTap", onchange:"doubleTapChanged", ontap:"preventDefault", kind:"onyx.Checkbox", checked:false}
				]},
				{classes:"gesture-sample-setting", style:"min-height:40px;", components: [
					{content:"Monitor event: "},
					{kind:"onyx.PickerDecorator", ontap:"preventDefault", onSelect:"monitorEventSelected", components: [
						{content:"Select event", style:"width:140px; margin-bottom:5px;"},
						{name:"eventPicker", kind:"onyx.Picker", classes:"gesture-sample-left"}
					]}
				]}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.eventList = {};
		this.eventCount = 0;
		enyo.forEach(
			["All events","down","up","tap","move","enter","leave","dragstart","drag","dragover","hold","release",
				"holdpulse","flick","gesturestart","gesturechange","gestureend","doubletap", "longpress", "longerpress"],
			this.bindSafely(function(event) {
				this.$.eventPicker.createComponent({content:event, style:"text-align:left"});
			}));
	},
	handleEvent: function(inSender, inEvent) {
		var event = enyo.clone(inEvent);
		if (this.monitorEvent && (event.type != this.monitorEvent)) {
			return true;
		}
		var eventItem = this.eventList[event.type];
		if (eventItem) {
			eventItem.set("event", event, true);
		} else {
			this.eventCount++;
			eventItem = this.$.eventList.createComponent({
				kind: "enyo.sample.EventItem",
				event:event,
				truncate: this.$.truncateDetail.get("value"),
				persist: this.monitorEvent
			});
			this.eventList[event.type] = eventItem;
		}
		eventItem.render();
		this.$.waiting.hide();
		this.reflow();
		return true;
	},
	truncateChanged: function() {
		for (var i in this.eventList) {
			this.eventList[i].set("truncate", this.$.truncateDetail.get("value"));
		}
		this.reflow();
		return false;
	},
	doubleTapChanged: function() {
		this.$.gestureSamplePad.doubleTapEnabled = this.$.enableDoubleTap.checked;
	},
	removeEvent: function(inSender, inEvent) {
		this.eventCount--;
		this.eventList[inEvent.type].destroy();
		delete this.eventList[inEvent.type];
		if (this.eventCount === 0) {
			this.$.waiting.show();
		}
		this.reflow();
		return true;
	},
	removeAllEvents: function() {
		for (var i in this.eventList) {
			this.eventList[i].destroy();
			delete this.eventList[i];
		}
		this.eventCount = 0;
		this.$.waiting.show();
		this.reflow();
	},
	toggleSettings: function() {
		this.$.settings.set("showing", !this.$.settings.get("showing"));
		this.reflow();
	},
	preventDefault: function() {
		return true;
	},
	monitorEventSelected: function(inSender, inEvent) {
		this.removeAllEvents();
		if (inEvent.originator.content == "All events") {
			this.monitorEvent = null;
		} else {
			this.monitorEvent = inEvent.originator.content;
		}
	}
});

enyo.kind({
	name:"enyo.sample.EventItem",
	published: {
		event:"",
		truncate: true,
		persist: false
	},
	style:"padding:4px;",
	events: {
		onDone:""
	},
	components: [
		{name:"eventProps", allowHtml:true},
		{kind:"Animator", duration:1000, startValue:0, endValue:255, onStep:"stepAnimation", onEnd:"animationEnded"}
	],
	create: function() {
		this.inherited(arguments);
		this.eventChanged();
		this.truncateChanged();
	},
	truncateChanged: function() {
		this.$.eventProps.addRemoveClass("gesture-sample-truncate", this.truncate);
	},
	eventChanged: function(inOld) {
		if (this.event) {
			if (this.timeout) {
				clearTimeout(this.timeout);
				this.timeout = null;
			}
			this.$.animator.stop();
			this.$.eventProps.set("content", this.getPropsString());
			this.$.animator.play();
		}
	},
	stepAnimation: function(inSender, inEvent) {
		var v = Math.floor(inSender.value);
		this.applyStyle("background-color", "rgb(" + v + ",255," + v + ");");
		return true;
	},
	animationEnded: function() {
		if (!this.persist) {
			this.timeout = setTimeout(this.bindSafely(function() {
				this.doDone({type:this.event.type});
			}), 2000);
		}
		return true;
	},
	destroy: function() {
		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = null;
		}
		this.inherited(arguments);
	},
	getPropsString: function() {
		var props = [];
		for (var i in this.event) {
			if ((this.event[i] !== undefined) &&
				(this.event[i] !== null) &&
				!(this.event[i] instanceof Object) &&
				(i != "type")) {
				props.push(i + ": " + this.event[i]);
			}
		}
		if (this.event.srcEvent && this.event.srcEvent.type) {
			props.push("srcEvent.type: " + this.event.srcEvent.type);
		}
		return "<b>" + this.event.type + "</b>: { " + props.join(", ") + " }";
	}
});

enyo.gesture.drag.configureHoldPulse({
	frequency: 100,
	events: [
	    {name: 'hold', time: 200},
	    {name: 'longpress', time: 500},
	    {name: 'longerpress', time: 1000}
	],
	endHold: 'onMove',
	moveTolerance: 16,
	resume: false
});