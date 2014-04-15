(function (enyo) {
	
	var kind = enyo.kind
		, mixin = enyo.mixin
		, nop = enyo.nop;
	
	/**
		@public
		@class enyo.Runloop
	*/
	kind(
		/** @lends enyo.Runloop.prototype */ {
		name: "enyo.Runloop",
		kind: null,
		interval: 30,
		queueId: null,
		queued: false,
		flushing: false,
		
		constructor: function (props) {
			props && mixin(this, props);
			this.queue = this.queue || {};
		},
		
		done: function () {
			this.flushing = false;
			if (this.queued) {
				this.queued = false;
				this.trigger();
			}
		},
		
		reset: function () {
			var queue = this.queue;
			this.queue = {};
			return queue;
		},
		
		flush: nop,
		
		trigger: function () {
			var dit = this;
			
			if (!this.queued) {
				this.queued = true;
				
				if (!this.flushing) this.queueId = setTimeout(function () {
					dit.flushing = true;
					dit.queued = false;
					dit.flush();
				}, this.interval);
			}
		},
		
		add: function (name, props) {
			var queue = this.queue
				, pre = this.preprocess
				, entry;
			
			if (pre && pre[name]) {
				entry = queue[name] || (queue[name] = {});
				pre[name].call(this, props, entry, queue);
			}
			
			else {
				entry = queue[name] || (queue[name] = []);
				entry.push(props);
			}
			
			this.trigger();
		}
		
	});
	
})(enyo);