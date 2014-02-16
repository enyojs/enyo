/*
	Copyright 2014 LG Electronics, Inc.

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/
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
