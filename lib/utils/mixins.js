// 'mixins' feature
enyo.kind.features.push(function(ctor, props) {
	if (props.mixins) {
		var cp = ctor.prototype;
		for (var i=0, m; (m=props.mixins[i]); i++) {
			var mp = m;
			for (var n in mp) {
				if (mp.hasOwnProperty(n) && !props.hasOwnProperty(n)) {
					var v = mp[n];
					if (enyo.isFunction(v) && (v.toString().indexOf("inherited") >= 0)) {
						cp[n] = enyo.kind._wrapFn(v, cp, n);
					} else {
						cp[n] = v;
					}
				}
			}
		}
	}
});

enyo.kind._wrapFn = function(fn, proto, name) {
	var inh = function(args) { 
		return proto.base.prototype[name].apply(this, args); 
	};
	return function() {
		this.inherited = inh;
		fn.apply(this, arguments);
		this.inherited = enyo.kind.inherited;
	};
};
