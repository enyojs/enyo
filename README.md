# Quick Info

## Core

This repository contains Enyo core. We've pared it down to the essentials, so folks can work at the metal. Widget libraries, g11n code, and other fancy bits are optional packages.

## Lib

Packages should go in a folder named _lib_ (e.g. the _extra_ or _canvas_ repositories on GitHub). _lib_ is a magic name that enyo uses to work with add-on packages. It's recommended you create a _lib_ folder as sibling to _enyo_ and keep your packages there, but you can make as many _lib_ folders as you like and put them anywhere.

## Api Viewer

The Api Viewer application parses and renders documentation in real-time from the Enyo source. Run the application by loading _tools/api/index.html_. 

## Warning about file://

_Note_: in Chrome, various samples will not work from file:// because of Chrome's security policy. Run from a local http server, use the --allow-file-access-from-files in Chrome, or use the online versions at http://enyojs.com.

# What Is Enyo

Enyo is an object-oriented JavaScript application framework emphasizing modularity and encapsulation. Enyo is suitable for small and large-scale applications.

Enyo up to 1.x was the underlying framework used to develop applications for HP's TouchPad tablet. Enyo as shipped on the TouchPad included an complete set of user interface components and service wrappers. What you will find here is Enyo 2, what we informally call _core_: the primary infrastructure needed to support any number of Enyo-based libraries. Not to worry, Enyo 1.x itself is open-source licensed, and work is progressing on packaging up those controls and goodies to work with Enyo 2.

Enyo was designed from the beginning to be highly extensible. This repository reflects a small working set of code, that can be expanded with any number of libraries or plugins. 

Enyo 2 is lightweight (at the time of this writing, roughly 13k gzipped), easy to digest, and powerful. 

# What Do I Get

The core code includes the Enyo kernel, the DOM extensions, and some Ajax (XHR) tools. These things are actually separable (it's easy to make micro-builds of Enyo), but we believe this is a useful working set. 

The Enyo 2 kernel provides a modularity concept (Component) and a view concept (UiComponent). The DOM aspect includes a widget concept (Control) and an extensible event system (Dispatcher). The Ajax package includes basic xhr functionality and an implementation of xhr as a Component (Ajax).

Just these pieces are sufficient to create large applications using the Enyo encapsulation model. Developers that want only this low-level code are encouraged to roll-their-own. For those that want a richer set of tools, there are some pre-built libraries already available, and much more on the way.

# Why Do I Care

First is our emphasis on cross-platform: Enyo core works on both desktop and mobile browsers.

Second is Enyo's building block approach to applications. Each piece of an application is a Component, and Components are constructed out of other Components.

For example, it's easy to define a combination of an `<input>` tag with a `<label>` tag into one _LabeledInput_ Component. 

Now I can use (and re-use) LabeledInput as one atomic piece. 

But that's just the beginning. Ultimately, large pieces of functionality can be exposed as single Components, for example a fancy report generator, or a color picker, or an entire painting application.

Use the Enyo encapsulation model to divide and conquer large projects. No particular piece of an application need be especially complex. Because combining pieces is central, it's natural to factor complex sections into smaller pieces. And because of the modularity, all these pieces tend to be reusable, in the same project, in other projects, or even for the public at large.

This is all part of our strategy to allow developers to focus on creativity and avoid Repeating Themselves.

# That's a Lot of Talk

The core Enyo design was proven out by the complex applications HP developed for the TouchPad platform. We don't claim this was particularly easy, there were a lot of hardworking developers on the apps teams, but we are confident the Enyo principles are effective on a large scale.

In any case, roll your sleeves up and try it for yourself.

# Give me the Basics

Here is an Enyo Hello World:

	<!doctype html>
	<html>
	<head>
		<title>Enyo</title>
		<script src="enyojs/2.0/enyo.js" type="text/javascript"></script>
	</head>
	<body>
		<script type="text/javascript">
			new enyo.Control({content: "Hello From Enyo"}).write();
		</script>
	</body>
	</html>

This example loads an enyo.js build from _enyojs/2.0/_. If you downloaded the SDK you have a versioned build file. If you pulled from GitHub, you can either make your own build using a minify script in _enyo/source/minify_ (requires Node), or you can load directly from the source (_enyo/source/enyo.js_). Loading from source is also called 'debug loading' because the modules are loaded as individual files, which is easier for debugging, but much less efficient.

The base enyo.Control works much like an HTML tag. You can assign _classes_ and _attributes_ and give it a _style_. E.g.

	new enyo.Control({content: "Hello From Enyo", classes: "foo", style: "color: red", attributes: {tabIndex: 0}}).write();

produces

	<div class="foo" style="color: red;" tabIndex="0">Hello From Enyo</div>

Now, the good parts start when you combine more than one Control, e.g.

	new enyo.Control({
		components: [
			{content: "Hello From Enyo"},
			{tag: "hr"}
		]
	}).write();

This Control now encapsulates two Controls into one scope (we can encapsulate any type of Component, that's why the property is called _components_. Controls are one kind of Component.) The outer Control is responsible for the encapsulated components: it manages their lifecycle, listens to their messages, and maintains references to them. For example:

	new enyo.Control({
		components: [
			{name: "hello", content: "Hello From Enyo", ontap: "helloTap"},
			{tag: "hr"}
		],
		helloTap: function() {
			this.$.hello.addStyles("color: red");
		}
	}).write();

Here we've given one of the components a name ('hello') and told it to send a 'helloTap' message when it's tapped (tap is basically the same as the DOM click event, but it works in both mouse and touch environments). The _$_ property is a hash that references all the sub-components (we don't store these references directly on _this_ to avoid name conflicts). Btw, notice there is no add/remove machinery to listen to this event, that's all taken care of.

The main point is that 'hello' and the 'hr', their references and behavior, are completely contained inside the outer control. Now, to re-use this, we need to make it a prototype.

Enyo contains a constructor/prototype-generator that we call enyo.kind. Constructors that enyo.kind produces are called _kinds_. Kinds are not magic, they are just regular old JavaScript constructors. Using the enyo.kind factory however allows us to remove boilerplate from our prototype generation (DRY) and have compact syntax. We can convert the Control above to a kind like so:

	enyo.kind({
		name: "Hello",
		kind: enyo.Control,
		components: [
			{name: "hello", content: "Hello From Enyo", ontap: "helloTap"},
			{tag: "hr"}
		],
		helloTap: function() {
			this.$.hello.addStyles("color: red");
		}
	});
	// make two, they're small
	new Hello().write();
	new Hello().write();

The code above creates a new kind called "Hello" derived from enyo.Control. It contains some components and some behavior. I can create as many "Hello" objects as I want, each instance is independent, and the user of a "Hello" doesn't need to know anything about its internals.

This ability to define encapsulated objects and behavior (Components) and to re-use those encapsulations as prototypes (kinds) is money.
