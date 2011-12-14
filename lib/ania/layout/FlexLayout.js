/**
A layout type that encapsulates the flexible box model exposed by CSS3.

Flex layouts are particularly useful for designs that need to fit objects 
to spaces. For example, say you have a header, middle section, and footer, 
and you want the header and footer to be always visible, 
with the middle section taking up the remaining space.

Note: Traditional HTML is not good at this kind of structure. 
In HTML, the sizing of objects generally proceeds from the inside out, 
which is, in a way, the opposite of fitting objects to a fixed space. 
(This dichotomy in the approach to layout is something that comes up regularly
in discussions of Web-centric vs. desktop-centric applications.)

The FlexLayout aligns controls into vertically- or horizontally-stacked boxes.
When the flex property is set on a control in a FlexLayout, the control expands
to fill the available space not occupied by other controls. If multiple controls
have their flex property set, they share the available space, each taking the
fraction specified by its own flex value divided by the total flex value. For
example, a control with flex: 5 in a layout with a total flex of 20 will take up
one-quarter (i.e., 5/20) of the available space.

The pack property specifies how controls are aligned with respect to the main axis.
Similarly, the align property specifies how controls are aligned along the
orthogonal axis.

See <a href="#enyo.HFlexLayout">enyo.HFlexLayout</a> and 
<a href="#enyo.VFlexLayout">enyo.VFlexLayout</a>.

*/
enyo.kind({
	name: "enyo.FlexLayout", 
	//* Set to one of "start", "center", "end", or "justify"
	pack: "start",
	//* Set to one of "start", "center", "end", "baseline", "stretch"
	align: "stretch",
	//* @protected
	constructor: function(inContainer) {
		// FIXME: not ideal
		this.prefix = enyo.isMoz ? "-moz" : "-webkit";
		if (inContainer) {
			// propagate settings from the container
			// TODO: containers should have layoutProps bag to support
			// arbitrary layouts. Certain extremely common layout options
			// (namely flex, pack, align) can be published as high level
			// properties that virtualize eponymous layoutProps.
			// Currently, we are simply reading these properties directly.
			this.pack = inContainer.pack || this.pack;
			this.align = inContainer.align || this.align;
		}
		this.container = inContainer;
	},
	destroy: function() {
		if (this.container) {
			delete this.container.setFlex;
			this.container.removeClass(this.flexClass);
		}
	},
	flowExtent: function(inControls, inExtent, inExtentNick) {
		for (var i=0, c, s, f; (c=inControls[i]); i++) {
			f = c.flex;
			s = c.domStyles;
			//
			//s["-webkit-box-flex"] = s["-moz-box-flex"] = s["-ms-box-flex"] = f;
			s[this.prefix + "-box-flex"] = f;
			//
			if (f) {
				// we redefine flex to mean 'be exactly the left over space'
				// as opposed to 'natural size plus the left over space'
				if (!s[inExtent]) {
					s[inExtent] = "0px";
				}
				// Mozilla doesn't seem to 'stretch' correctly on this axis
				if (enyo.isMoz && inExtent == "height" && this.align == "stretch") {
					s.width = "100%";
				}
			}
			c.domStylesChanged();
		}
	},
	flow: function(inContainer) {
		var s = inContainer.domStyles;
		//s["-webkit-box-pack"] = s["-moz-box-pack"] = s["-ms-box-pack"] = inContainer.pack || this.pack;
		//s["-webkit-box-align"] = s["-moz-box-align"] = s["-ms-box-align"] = inContainer.align || this.pack;
		s[this.prefix + "-box-pack"] = inContainer.pack || this.pack;
		s[this.prefix + "-box-align"] = inContainer.align || this.align;
		this._flow(inContainer.children);
		inContainer.domStylesChanged();
		inContainer.addClass(this.flexClass);
	}
});

/**
A horizontal <a href="#enyo.FlexLayout">flexible layout</a> that displays controls left-to-right.

To create a content with natural width, followed by a set of three equally-spaced buttons to the right, try:

	{layoutKind: "HFlexLayout", style: "width: 500px;", components: [
		{content: "Here are some buttons:"},
		{kind: "Button", flex: 1, content: "Left"},
		{kind: "Button", flex: 1, content: "Center"},
		{kind: "Button", flex: 1, content: "Right"}
	]}

To control the alignment left-to-right, change the pack property's value.
To control the alignment top-to-bottom, change the align property's value. For example, 
this creates a a set of horizontally-centered buttons positioned at the bottom of the container.

	{kind: "Control", layoutKind: "HFlexLayout", style: "width: 300px; height: 500px;",
		pack: "center", align: "end", components: [
		{kind: "Button", content: "Left"},
		{kind: "Button", content: "Right"}
	]}

*/
enyo.kind({
	name: "enyo.HFlexLayout", 
	//* @protected
	kind: enyo.FlexLayout,
	flexClass: "enyo-hflexbox",
	_flow: function(inControls) {
		this.flowExtent(inControls, "width", "w");
	}
});

/**
A vertical <a href="#enyo.FlexLayout">flexible layout</a> that displays controls top-to-bottom.

To create a content with natural height, followed by a set of three equally-spaced buttons below, try:

	{layoutKind: "VFlexLayout", style: "height: 500px;", components: [
		{content: "Here are some buttons:"},
		{kind: "Button", flex: 1, content: "Top"},
		{kind: "Button", flex: 1, content: "Middle"},
		{kind: "Button", flex: 1, content: "Bottom"}
	]}

To control the alignment top-to-bottom, change the pack property's value.
To control the alignment left-to-right, change the align property's value. For example, 
this creates a a set of vertically-centered buttons positioned at the right of the container.

	{kind: "Control", layoutKind: "VFlexLayout", style: "width: 300px; height: 500px;",
		pack: "center", align: "end", components: [
		{kind: "Button", content: "Top"},
		{kind: "Button", content: "Bottom"}
	]}
*/
enyo.kind({
	name: "enyo.VFlexLayout", 
	//* @protected
	kind: enyo.FlexLayout,
	flexClass: "enyo-vflexbox",
	_flow: function(inControls) {
		this.flowExtent(inControls, "height", "h");
	}
});

/**
An HFlexBox displays controls using an <a href="#enyo.HFlexLayout">enyo.HFlexLayout</a>.

It is equivalent to specifying a Control with layoutKind set to HFlexLayout.
*/
enyo.kind({
	name: "enyo.HFlexBox",
	//* @protected
	kind: enyo.Control,
	layoutKind: "HFlexLayout"
});

/**
An VFlexBox displays controls using an <a href="#enyo.VFlexLayout">enyo.VFlexLayout</a>.

It is equivalent to specifying a Control with layoutKind set to VFlexLayout.
*/
enyo.kind({
	name: "enyo.VFlexBox",
	//* @protected
	kind: enyo.Control,
	layoutKind: "VFlexLayout"
});