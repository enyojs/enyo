enyo.kind({
	name: "enyo.sample.TableSample",
	classes: "table-sample enyo-fit",
	components: [
		{name: "month", classes: "section"},
		{kind: "enyo.Table", components: [
			{classes: "header", components: [
				{content: "Sun"},
				{content: "Mon"},
				{content: "Tue"},
				{content: "Wed"},
				{content: "Thu"},
				{content: "Fri"},
				{content: "Sat"}
			]}
		]}
	],
	monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	create: function() {
		this.inherited(arguments);

		// calculate current date
		var dateObj = new Date();
		var currentDate = dateObj.getDate();

		// calculate date of first day of the month
		dateObj.setDate(1);
		var offset = dateObj.getDay();

		// calculate date of last day of the month
		var lastDate = this.getDaysInMonth(dateObj.getMonth(), dateObj.getYear());

		for (var i=0; i<lastDate+offset+(((lastDate+offset)%7)?7-((lastDate+offset)%7):0); i++) {
			if (i%7 === 0) {
				var currentRow = this.$.table.createComponent({});
			}
			if (i<offset || i>=lastDate+offset) {
				currentRow.createComponent({});
			} else {
				var cellDay = {content: (i-offset+1)};
				if ((i-offset+1) === currentDate) {
					cellDay = enyo.mixin(cellDay, {classes: "current"});
				}
				currentRow.createComponent(cellDay);
			}
		}

		// set month display
		this.$.month.setContent(this.monthNames[dateObj.getMonth()] + " " + dateObj.getFullYear());
	},
	// adapted from http://stackoverflow.com/questions/1810984/number-of-days-in-any-month
	getDaysInMonth: function(m, y) {
	   return /8|3|5|10/.test(m)?30:m==1?(!(y%4)&&y%100)||!(y%400)?29:28:31;
	}
});