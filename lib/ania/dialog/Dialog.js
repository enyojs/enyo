/**
	A fixed width <a href="#enyo.Menu">Popup</a>, with a header, and should be used as an interactive dialog box.

		{kind: "	Dialog", content: "Dialog Title"}
*/

enyo.kind({
	name: "enyo.Dialog",
	kind: enyo.Popup,
	className: "enyo-popup enyo-dialog",
	scrim: true,
	modal: true,
	showHideMode: "transition",
	openClassName: "enyo-dialog-open",
	dismissWithClick: false,
	published: {
		/**
			Height to apply to the content of the popup. Specify when the popup's content should
			be explicitly rather than naturally sized.
		*/
		contentHeight: "",
		/**
			A css class name to apply to the content of the popup.
		*/
		contentClassName: ""
	},
	dialogChrome: [
		{className: "enyo-dialog-container", components: [
			{name: "dialogContent", className: "enyo-dialog-content"},
			{name: "client", className: "enyo-dialog-content"}
		]}
	],
	//* @protected
	// size is clamped via the client region so that client size can be dynamic
	calcContentSizeDelta: function() {
		var r = this.inherited(arguments);
		this.beginMeasureSize();
		var n = this.hasNode();
		var cn = this.$.client.hasNode();
		// adjust by client's node offset.
		var o = enyo.dom.calcNodeOffset(cn, n);
		// and offset by border
		var b = enyo.dom.calcBorderExtents(n);
		var d = o.top - b.t;
		r.height += d;
		this.finishMeasureSize();
		return r;
	},
	componentsReady: function() {
		this.createChrome(this.dialogChrome);
		this.inherited(arguments);
		this.contentHeightChanged();
		this.contentClassNameChanged();
		this.layoutKindChanged();
		this.contentChanged();
	},
	contentChanged: function() {
		if (this.$.dialogContent) {
			this.$.dialogContent.setContent(this.content);
		}
	},
	contentHeightChanged: function() {
		this.$.client.applyStyle("height", this.contentHeight || null);
	},
	contentClassNameChanged: function(inOldValue) {
		if (inOldValue) {
			this.$.client.removeClass(inOldValue);
		}
		this.$.client.addClass(this.contentClassName);
	},
	layoutKindChanged: function() {
		if (this.$.client) {
			this.$.client.align = this.align;
			this.$.client.pack = this.pack;
			this.$.client.setLayoutKind(this.layoutKind);
		}
	}
});
