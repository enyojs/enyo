enyo.kind({
	name: "enyo.BoxLayout",
	kind: enyo.Layout,
	layoutClass: "enyo-box",
	unit: "px",
	//* @protected
	_flow: function(measure, mAttr, nAttr, pAttr, qAttr, boxClass) {
		var ex, m = 0, b = {}, p = ("pad" in this.container) ? Number(this.container.pad) : 0, c;
		b[pAttr] = p;
		b[qAttr] = p;
		var c$ = this.container.children;
		for (var i=0; (c=c$[i]); i++) {
			m += p;
			c.applyStyle("position", "absolute");
			//c.addClass(boxClass + "-div");
			if (c[measure] == "fill") {
				break;
			}
			b[measure] = ex = Number(c[measure]) || 96;
			b[mAttr] = m;
			c.setBounds(b, this.unit);
			m += ex;
		}
		delete b[mAttr];
		if (c) {
			var client = c, n = 0;
			for (i=c$.length-1; c=c$[i]; i--) {
				c.applyStyle("position", "absolute");
				//c.addClass(boxClass + "-div");
				n += p;
				if (c == client) {
					break;
				}
				b[measure] = ex = Number(c[measure]) || 96;
				b[nAttr] = n;
				c.setBounds(b, this.unit);
				n += ex;
			}
			delete b[measure];
			b[mAttr] = m;
			b[nAttr] = n;
			client.setBounds(b, this.unit);
		}
	},
	flow: function() {
		if (this.orient == "h") {
			this._flow("width", "left", "right", "top", "bottom", "enyo-hbox");
		} else {
			this._flow("height", "top", "bottom", "left", "right", "enyo-vbox");
		}
	}
});

enyo.kind({
	name: "enyo.HBoxLayout",
	kind: enyo.BoxLayout,
	orient: "h"
});

enyo.kind({
	name: "enyo.VBoxLayout",
	kind: enyo.BoxLayout,
	orient: "v"
});

enyo.kind({
	name: "enyo.HBox",
	kind: enyo.Control,
	layoutKind: "enyo.HBoxLayout"
});

enyo.kind({
	name: "enyo.VBox",
	kind: enyo.Control,
	layoutKind: "enyo.VBoxLayout"
});