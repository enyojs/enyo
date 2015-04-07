(function (enyo, scope) {

	enyo.singleton({
		name: 'enyo.NewAnimator',
		kind: 'enyo.Object',
		animate: function(fn, duration) {
			var t0 = enyo.perfNow(),
				cb = function() {
					var t = enyo.perfNow(),
						p = Math.min(1, ((t - t0) / duration));

					fn(p);

					if (p < 1) {
						enyo.Loop.request(cb);
					}
				};

			enyo.Loop.request(cb);
		}
	});

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