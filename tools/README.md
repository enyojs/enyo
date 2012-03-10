# Enyo Minifier

The enyo minifier uses NodeJS, [UglifyJS](http://github.com/mishoo/uglifyjs) and the enyo dependency loader to compress any enyo package into a minimized form.

## Invocation
For convenience, there are both Windows and Unix versions of the script that invokes the node tool.
They follow the same invocation:

	path/to/enyo/tools/minify/minify.sh -output /path/to/build/dir/buildfilename package.js

The last parameter in the output path, if not ending in a `/`, will be used as the name of the output build files.
The `package.js` file must be in the same directory as the invocation.

For convenience, packages should include a `minify` folder with both a Windows batch and Unix shell script that runs the minifier.
