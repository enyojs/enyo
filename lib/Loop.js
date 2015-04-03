(function (enyo, scope) {

	enyo.singleton({
		name: 'enyo.Loop',
		kind: 'enyo.Object',
		qs: [ [], [] ],
		qi: 0,
		initLoopCallback: function () {
			this.lcb = this.bindSafely(function () {
				var i = this.qi,
					q = this.qs[i];

				this.qi = i ? 0 : 1;

				while (q.length) {
					(q.shift())();
				}
			});
			return this.lcb;
		},
		trigger: function () {
			window.requestAnimationFrame(this.lcb || this.initLoopCallback());
		},
		request: function (cb) {
			var q = this.qs[this.qi];
			q.push(cb);
			this.trigger();
		}
	});

})(enyo, this);