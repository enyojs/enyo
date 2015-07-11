# watchify

watch mode for [browserify](https://github.com/substack/node-browserify) builds

[![build status](https://secure.travis-ci.org/substack/watchify.png)](http://travis-ci.org/substack/watchify)

Update any source file and your browserify bundle will be recompiled on the
spot.

# example

```
$ watchify main.js -o static/bundle.js
```

Now as you update files, `static/bundle.js` will be automatically incrementally rebuilt on
the fly.

The `-o` option can be a file or a shell command (not available on Windows)
that receives piped input:

``` sh
watchify main.js -o 'exorcist static/bundle.js.map > static/bundle.js' -d
```

``` sh
watchify main.js -o 'uglifyjs -cm > static/bundle.min.js'
```

You can use `-v` to get more verbose output to show when a file was written and how long the bundling took (in seconds):

```
$ watchify browser.js -d -o static/bundle.js -v
610598 bytes written to static/bundle.js (0.23 seconds)
610606 bytes written to static/bundle.js (0.10 seconds)
610597 bytes written to static/bundle.js (0.14 seconds)
610606 bytes written to static/bundle.js (0.08 seconds)
610597 bytes written to static/bundle.js (0.08 seconds)
610597 bytes written to static/bundle.js (0.19 seconds)
```

# usage

Use `watchify` with all the same options as `browserify` except that `-o` (or
`--outfile`) is mandatory. Additionally, there are also:

```
Standard Options:

  --outfile=FILE, -o FILE

    This option is required. Write the browserify bundle to this file. If
    the file contains the operators `|` or `>`, it will be treated as a
    shell command, and the output will be piped to it (not available on
    Windows).

  --verbose, -v                     [default: false]

    Show when a file was written and how long the bundling took (in
    seconds).

  --version

    Show the watchify and browserify versions with their module paths.
```

```
Advanced Options:

  --delay                           [default: 600]

    Amount of time in milliseconds to wait before emitting an "update"
    event after a change.

  --ignore-watch=GLOB, --iw GLOB    [default: false]

    Ignore monitoring files for changes that match the pattern. Omitting
    the pattern will default to "**/node_modules/**".

  --poll=INTERVAL                   [default: false]

    Use polling to monitor for changes. Omitting the interval will default
    to 100ms. This option is useful if you're watching an NFS volume.
```

# methods

``` js
var watchify = require('watchify');
var fromArgs = require('watchify/bin/args');
```

## var w = watchify(b, opts)

Wrap a browserify bundle `b` with watchify, returning the wrapped bundle
instance as `w`.

When creating the browserify instance `b` you MUST set these properties in the
constructor:

``` js
var b = browserify({ cache: {}, packageCache: {} });
var w = watchify(b);
```

You can also just do:

``` js
var b = browserify(watchify.args);
var w = watchify(b);
```

**By default, watchify doesn't display any output, see [events](https://github.com/substack/watchify#events) for more info.**

`w` is exactly like a browserify bundle except that caches file contents and
emits an `'update'` event when a file changes. You should call `w.bundle()`
after the `'update'` event fires to generate a new bundle. Calling `w.bundle()`
extra times past the first time will be much faster due to caching.

`opts.delay` is the amount of time in milliseconds to wait before emitting
an "update" event after a change. Defaults to `600`.

`opts.ignoreWatch` ignores monitoring files for changes. If set to `true`,
then `**/node_modules/**` will be ignored. For other possible values see
Chokidar's [documentation](https://github.com/paulmillr/chokidar#path-filtering) on "ignored".

`opts.poll` enables polling to monitor for changes. If set to `true`, then
a polling interval of 100ms is used. If set to a number, then that amount of
milliseconds will be the polling interval. For more info see Chokidar's
[documentation](https://github.com/paulmillr/chokidar#performance) on
"usePolling" and "interval".
_This option is useful if you're watching an NFS volume._

## w.close()

Close all the open watch handles.

## var w = fromArgs(args)

Create a watchify instance `w` from an array of arguments `args`. The required
constructor parameters will be set up automatically.

# events

## w.on('update', function (ids) {})

When the bundle changes, emit the array of bundle `ids` that changed.

## w.on('bytes', function (bytes) {})

When a bundle is generated, this event fires with the number of bytes.

## w.on('time', function (time) {})

When a bundle is generated, this event fires with the time it took to create the
bundle in milliseconds.

## w.on('log', function (msg) {})

This event fires to with messages of the form:

```
X bytes written (Y seconds)
```

with the number of bytes in the bundle X and the time in seconds Y.

# install

With [npm](https://npmjs.org) do:

```
$ npm install -g watchify
```

to get the watchify command and:

```
$ npm install watchify
```

to get just the library.

# troubleshooting

## rebuilds on OS X never trigger

It may be related to a bug in `fsevents` (see [#250](https://github.com/substack/watchify/issues/205#issuecomment-98672850)
and [SO](http://stackoverflow.com/questions/26708205/webpack-watch-isnt-compiling-changed-files/28610124#28610124)).
Try the `--poll` flag and/or renaming the project's directory - that might
help.

# license

MIT
