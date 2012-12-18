<b>Note:</b> The Enyo framework currently uses a [fork of Less](https://github.com/enyojs/less.js) with a minor change to [`lib/less/tree/url.js`](https://github.com/enyojs/less.js/blob/master/lib/less/tree/url.js) to ensure that URL paths are propertly rewritten relative to the file that defines the URL when running the node-based compiler used by Enyo's minifier (this is already the default behavior when compiling via the Less.js browser library).  

The `dist/less-1.3.0e.js` and `dist/less-1.3.0e.min.js` files are the browser library built from the head of the fork with the single url.js change above.

There is an active conversation happening [here on github](https://github.com/cloudhead/less.js/pull/96) aimed at resolving the inconsistency between the browser and node compilers which the Enyo team is tracking, with the goal of moving back to the less.js master.

===========

less.js
=======

The **dynamic** stylesheet language.

<http://lesscss.org>

about
-----

This is the JavaScript, and now official, stable version of LESS.

For more information, visit <http://lesscss.org>.

license
-------

See `LICENSE` file.

> Copyright (c) 2009-2011 Alexis Sellier
