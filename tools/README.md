# Enyo Minifier

The enyo minifier uses Node.js, [UglifyJS](http://github.com/mishoo/uglifyjs) and the enyo dependency loader to compress any enyo package into a minimized form.

Using the all-in-one `deploy.js` (which  minifies both Enyo  itself & the application) is generally prefered. 

## Invocation

For convenience, there are both Windows and Unix versions of the script that invokes the node tool.
They follow the same invocation:

	path/to/enyo/tools/minify/minify.sh -output relative/path/to/build/dir/buildfilename package.js

The `-o` is the output path, if not ending in a `/`, will be used as the name of the output build files.  `-h` gives full usage details.

## Running tests

1. You first need to install an http server handling php (MANP or WAMP, ...)
2. Configure your http server to serve the files of the enyo project
3. Point your browser to enyo/tools/... to run the various testcases
