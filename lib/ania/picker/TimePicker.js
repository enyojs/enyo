/**
A <a href="#enyo.PickerGroup">PickerGroup</a> that offers selection of the hour and minutes, with an optional AM/PM selector.  The TimePicker uses the JavaScript Date object to represent the chosen time.

	{kind: "TimePicker", content: "start time", onChange: "pickerPick"}

The selected time can be retrieved by calling <code>getValue</code>, like so:

	pickerPick: function(inSender) {
		var startTime = this.$.timePicker.getValue();
	}
	
To enable 24-hour mode, do this:

	{kind: "TimePicker", content: "start time", is24HrMode: true, onChange: "pickerPick"}
*/
enyo.kind({
	name: "enyo.TimePicker",
	kind: enyo.PickerGroup,
	published: {
		content: enyo._$L("time"),
		//* `value` is used as a starting point and consumed internally. `onChange` will return a new Date object every time.
		value: null,
		minuteInterval: 1,
		is24HrMode: null
	},
	components: [
	],
	//* @protected
	initComponents: function() {
		this.inherited(arguments);
		var tfm = {h: "hour", m: "minute", a: "ampm"};
		//this._tf = new enyo.g11n.Fmts();
		var ordering = "hma";
		var orderArr = ordering.split("");
		var o,f,l;
		for (f = 0, l = orderArr.length; f < l; f++) {
			o = orderArr[f];
			this.createComponent({name: tfm[o]});
		}
	
		//this.$.ampm.setItems([{content: this._tf.getAmCaption(), value: 0}, {content: this._tf.getPmCaption(), value: 12}]);
		this.$.ampm.setItems([{content: "AM", value: 0}, {content: "PM", value: 12}]);
		this.$.ampm.setValue(0);
		//if (typeof(this.is24HrMode) !== 'boolean') {
			// fall back on locale specific 24 hour mode if not specified
			//this.is24HrMode = !this._tf.isAmPm();
		//}
	},
	create: function() {
		this.inherited(arguments);
		this.value = this.value || new Date();
		this.minuteIntervalChanged();
		this.is24HrModeChanged();
	},
	minuteIntervalChanged: function() {
		var items = [];
		for (var i=0; i<60; i+=this.minuteInterval) {
			items.push(i < 10 ? ("0"+i) : String(i));
		}
		this.$.minute.setItems(items);
	},
	is24HrModeChanged: function() {
		this.$.ampm.setShowing(!this.is24HrMode);
		this.setupHour();
		this.valueChanged();
	},
	setupHour: function() {
		var items = [];
		for (var i=(this.is24HrMode ? 0 : 1); i<=(this.is24HrMode ? 23 : 12); i++) {
			items.push(String(i));
		}
		this.$.hour.setItems(items);
	},
	valueChanged: function() {
		var v = this.value;
		var h = v.getHours();
		var m = Math.floor(v.getMinutes()/this.minuteInterval) * this.minuteInterval;
		var ampm = (h >= 12) * 12;
		this.$.hour.setValue(this.is24HrMode ? h : h - ampm || 12);
		this.$.minute.setValue(m < 10 ? ("0"+m) : String(m));
		this.$.ampm.setValue(ampm);
	},
	pickerChange: function() {
		var h = parseInt(this.$.hour.getValue());
		var m = parseInt(this.$.minute.getValue(), 10);
		var ap = this.$.ampm.getValue();
		h = (this.is24HrMode) ? h : h + (h == 12 ? -!ap*12 : ap);
		var y = this.value.getFullYear(), mo = this.value.getMonth(), d = this.value.getDate(), s = this.value.getSeconds(), ms = this.value.getMilliseconds();
		this.setValue(new Date(y, mo, d, h, m, s, ms));
		this.inherited(arguments);
	}
});
