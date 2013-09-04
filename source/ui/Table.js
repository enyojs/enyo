/*
	TODO: Won't work in IE8 because	we can't set innerHTML
	on table elements. We'll need to fall back to divs with
	table display styles applied.

	Should also facade certain useful table functionality
	(specific set TBD).
*/

/**
	_enyo.Table_ implements an HTML &lt;table&gt; element.
	This is a work in progress.
*/
enyo.kind({
	name: "enyo.Table",
	tag: "table",
	attributes: {cellpadding: "0", cellspacing: "0"},
	defaultKind: "enyo.TableRow"
});

/**
	_enyo.TableRow_ implements an HTML &lt;tr&gt; element.
*/
enyo.kind({
    name: "enyo.TableRow",
    tag: "tr",
    defaultKind: "enyo.TableCell"
});

/**
	_enyo.TableCell_ implements an HTML &lt;td&gt; element.
*/
enyo.kind({
    name: "enyo.TableCell",
    tag: "td"
});
