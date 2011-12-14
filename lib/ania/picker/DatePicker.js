/**
A <a href="#enyo.PickerGroup">PickerGroup</a> that offers selection of the month, day and year.  The DatePicker uses the JavaScript Date object to represent the chosen date.

	{kind: "DatePicker", content: "birthday", onChange: "pickerPick"}

The selected date can be retrieved by calling <code>getValue</code>, like so:

	pickerPick: function(inSender) {
		var bDate = this.$.datePicker.getValue();
	}
	
The year range can be adjusted by setting the minYear and maxYear properties, like so:

	{kind: "DatePicker", content: "birthday", minYear: 1900, maxYear: 2011, onChange: "pickerPick"}
*/
enyo.kind({
	name: "enyo.DatePicker",
	kind: enyo.PickerGroup,
	published: {
		content: enyo._$L("date"),
		//* `value` is used as a starting point and consumed internally. `onChange` will return a new Date object every time.
		value: null,
		hideDay: false,
		hideMonth: false,
		hideYear: false,
		minYear: 1900,
		maxYear: 2099
	},
	components: [
	],
	//* @protected
	initComponents: function() {
		this.inherited(arguments);
		
		//this._tf = new enyo.g11n.Fmts();
		var dfmVisible = {};
		if (!this.hideDay) { dfmVisible.d = 'day' };
		if (!this.hideMonth) { dfmVisible.m = 'month' };
		if (!this.hideYear) { dfmVisible.y = 'year' };
		var dfm = {d: 'day', m: 'month', y: 'year'};
		//var ordering = this._tf.getDateFieldOrder();
		var ordering = "mdy";
		var orderingArr = ordering.split("");
		var o,f,l;
		for(f = 0, l = orderingArr.length; f < l; f++) {
			o = orderingArr[f];
			var dateComp = this.createComponent({name: dfm[o]});
			if (!dfmVisible[o]){
				dateComp.setShowing(false);
			}
		}
	},
	create: function() {
		this.inherited(arguments);
		this.value = this.value || new Date();
		this.setupMonth();
		this.yearRangeChanged();
		this.valueChanged();
	},
	setupMonth: function() {
		var i = 0;
		//var ms = this._tf.getMonthFields().map(function(m) { return {content:m, value:i++}; });
		var monthFields = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		var ms = monthFields.map(function(m) { return {content:m, value:i++}; });
		this.$.month.setItems(ms);
	},
	monthLength: function(inYear, inMonth) {
		// determine number of days in a particular month/year
		return 32 - new Date(inYear, inMonth, 32).getDate();
	},
	setupDay: function(inYear, inMonth, inDay) {
		var n = this.monthLength(inYear, inMonth);
		var items = [];
		for (var i=1; i<=n; i++) {
			items.push(String(i));
		}
		this.$.day.setItems(items);
		this.$.day.value = "";
		this.$.day.setValue(inDay > n ? n : inDay);
	},
	minYearChanged: function() {
		this.yearRangeChanged();
	},
	maxYearChanged: function() {
		this.yearRangeChanged();
	},
	yearRangeChanged: function() {
		var items = [];
		for (var i=this.minYear; i<=this.maxYear; i++) {
			items.push(String(i));
		}
		this.$.year.setItems(items);
	},
	hideDayChanged: function(){
		this.$.day.setShowing(!this.hideDay);
	},
	hideMonthChanged: function(){
		this.$.month.setShowing(!this.hideMonth);
	},
	hideYearChanged: function(){
		this.$.year.setShowing(!this.hideYear);
	},
	valueChanged: function() {
		var v = this.value;
		var m = v.getMonth();
		var d = v.getDate();
		var y = v.getFullYear();
		
		this.setupDay(y, m, d);
		this.$.month.setValue(m);
		this.$.year.setValue(y);
	},
	pickerChange: function(inSender) {
		var m, d, y;
		y = parseInt(this.$.year.getValue());
		m = parseInt(this.$.month.getValue());
		d = Math.min(parseInt(this.$.day.getValue()), this.monthLength(y, m));
		var h = this.value.getHours(), mm = this.value.getMinutes(), s = this.value.getSeconds(), ms = this.value.getMilliseconds();
		this.setValue(new Date(y, m, d, h, mm, s, ms));
		this.inherited(arguments);
	}
});
