/**
A container for a group of buttons designed to go inside a
<a href="#enyo.Toolbar">Toolbar</a>. The buttons are laid out
horizontally.

By default, the components in a menu toolbar are instances of
<a href="#enyo.GroupedToolButton">GroupedToolButton</a>.

	{kind: "Toolbar", components: [
		{kind: "ToolButtonGroup", components: [
			{icon: "images/menu-icon-back.png", onclick: "goBack"},
			{icon: "images/menu-icon-forward.png", onclick: "goForward"},
			{icon: "images/menu-icon-refresh.png", onclick: "refresh"}
		]}
	]}
*/
enyo.kind({
	name: "enyo.ToolButtonGroup",
	kind: enyo.OrderedContainer,
	className: "enyo-menu-toolbar",
	defaultKind: "GroupedToolButton"
});
