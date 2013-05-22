/**
	_enyo.DataTable_ enables the creation of data-driven tables.
	Along with _enyo.Table_, this is a work in progress.
*/
enyo.kind({
	name: "enyo.DataTable",
	kind: "enyo.DataRepeater",
	controller: "enyo.Collection",
	defaultKind: "enyo.TableRow",
	style: "display: table;",
	_container: {
		kind: "enyo.Table",
		name: "container",
		style: "width: 100%;"
	},
	initComponents: function() {
		this.inherited(arguments);
		this._child_kind.prototype.tag = null;
	}
});