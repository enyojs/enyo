### Looking for the issue tracker?
It's moved to [https://enyojs.atlassian.net](https://enyojs.atlassian.net).

---

# Quick Info

## Core

This repository contains Enyo core. We've pared it down to the essentials, so
folks can work at the metal. Widget sets, localization code, and other fancy
bits are in separate repos.

## Warning about file://

_Note_: In Chrome, various samples will not work from `file://` URLs because of
Chrome's security policy.  To work around this, run your app from a local http
server, use the `--allow-file-access-from-files` flag when starting Chrome, or
use the online samples at http://enyojs.com.

# What Is Enyo?

Enyo is an object-oriented JavaScript application framework emphasizing
modularity and encapsulation.  Enyo is suitable for both small- and large-scale
applications.

Enyo 1.x was the underlying framework used to develop applications for HP's
TouchPad tablet.  Enyo as shipped on the TouchPad included an complete set of
user interface components and service wrappers.  What you will find here is Enyo
2, what we informally call _core_: the primary infrastructure needed to support
any number of Enyo-based libraries.  Enyo 1.x is now available under an
open-source license.

Enyo was designed from the beginning to be highly extensible.  This repository
reflects a small working set of code that may be expanded with any number of
libraries or plugins.

Enyo 2 is lightweight, easy to digest, and powerful.

# What Do I Get?

The core code includes the Enyo kernel, the DOM extensions, some Ajax (XHR)
tools, and basic wrapper kinds for a lot of DOM form elements.  We believe this
is a useful working set of tools.

Enyo 2 provides a modularity concept (Component) and a view concept
(UiComponent).  The DOM aspect includes a widget concept (Control) and an
extensible event system (Dispatcher).  Ajax resources include basic XHR
functionality and an implementation of XHR as a Component (Ajax).  In the UI
arena, Enyo offers base kinds for common controls like buttons and popups, along
with layout-oriented kinds, such as platform-optimized scrollers.

By themselves, these pieces are sufficient to create large applications using
the Enyo encapsulation model.  Developers who only want this low-level code are
encouraged to roll-their-own application and UI layers.  For those who want a
richer set of tools, we have several pre-built libraries available.

# Why Do I Care?

First is our emphasis on cross-platform compatibility: Enyo core works on both
desktop and mobile browsers.

Second is Enyo's building block approach to applications.  Each piece of an
application is a Component, and Components are constructed out of other
Components.

For example, it's easy to define the combination of an `<input>` tag and a
`<label>` tag in one `LabeledInput` Component.

Now I can use (and re-use) `LabeledInput` as one atomic piece.

But that's just the beginning.  Ultimately, large pieces of functionality may be
exposed as single Components--for example, a fancy report generator, or a color
picker, or an entire painting application.

Use the Enyo encapsulation model to divide and conquer large projects.  No
particular piece of an application need be especially complex.  Because the
combining of pieces is central, factoring complex functionality into smaller
pieces comes naturally.  Moreover, because of the modularity, all these pieces
tend to be reusable--in the same project, in other projects, or even by the
public at large.

This is all part of our strategy to allow developers to focus on creativity and
_Avoid Repeating Themselves_.

# That's a Lot of Talk

The core Enyo design was proven out by the complex applications HP developed for
the TouchPad platform.  We don't claim that this was particularly easy; there
were a lot of hardworking developers on the apps teams, but we are confident in
the efficacy of Enyo's guiding principles on a large scale.

But don't take our word for it; see for yourself.

## Samples

All samples reside in a consolidated sample app for Enyo and its libraries:
[enyo-strawman](https://github.com/enyojs/enyo-strawman).

## Copyright and License Information

Unless otherwise specified, all content, including all source code files and
documentation files in this repository are:

Copyright (c) 2012-2015 LG Electronics

Unless otherwise specified or set forth in the NOTICE file, all content,
including all source code files and documentation files in this repository are:
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this content except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
