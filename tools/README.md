# Enyo Minifier

The enyo minifier uses NodeJS, [UglifyJS](http://github.com/mishoo/uglifyjs) and the enyo dependency loader to compress any enyo package into a minimized form.

## Invocation
For convenience, there are both Windows and Unix versions of the script that invokes the node tool.
They follow the same invocation:

	path/to/enyo/tools/minify/minify.sh package.js -output /relative/path/to/build/dir/buildfilename

An example for lib/onyx, a UI widget set, run from `lib/onyx/minify/minify.sh`, building to `lib/onyx/build`

	../../../enyo/tools/minify/minify.sh -output ../build/onyx package.js

The last parameter in the output path, if not ending in a `/`, will be used as the name of the output build files.
The `package.js` file must be in the same directory as the invocation.

For convenience, packages should include a `minify` folder with both a Windows batch and Unix shell script that runs the minifier.
