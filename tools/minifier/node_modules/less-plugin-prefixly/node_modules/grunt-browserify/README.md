[![build status](https://secure.travis-ci.org/jmreidy/grunt-browserify.png)](http://travis-ci.org/jmreidy/grunt-browserify)
[![NPM version](https://badge.fury.io/js/grunt-browserify.png)](http://badge.fury.io/js/grunt-browserify)
# grunt-browserify

Grunt task for node-browserify.

## Getting Started
This plugin requires [Grunt](https://gruntjs.com) `~0.4.0`.

Install this grunt plugin with:
```shell
npm install grunt-browserify --save-dev
```

Then add this line to your project's `grunt.js` Gruntfile:

```javascript
grunt.loadNpmTasks('grunt-browserify');
```

## 3.0 Release
An important note for those running the latest release of grunt-browserify:
the newest version (>3.0) incorporates breaking changes from Browserify
which REMOVED BUNDLE OPTIONS. All options to browserify must now be passed
in the `browserifyOptions` hash.

## In the Wild
Most simply, Browserify is a tool for taking your CommonJS-style Javascript
code and packaging it for use in the browser. Grunt-Browserify provides the
glue to better integrate Browserify into your Grunt-based development workflow.

For JavaScripters unfamiliar with CJS-style code and the Node ecosystem, moving
to Browserify can be a bit confusing. Writing your client-side code as CJS
modules allows for smaller, easier to understand files that perform one task
well. These modules, because of their simplicity, will be significantly easier
to use across projects. CJS modules also help to expose the dependency graph
inherent in your code, allowing you to write cleaner, more-maintainable
modules. As [Alex MacCaw writes](http://spinejs.com/docs/commonjs):
>CommonJS modules are one of the best solutions to JavaScript dependency
>management.

>CommonJS modules solve JavaScript scope issues by making sure each module is
>executed in its own namespace. Modules have to explicitly export variables
>they want to expose to other modules, and explicitly import other modules; in
>other words, there's no global namespace.

(A note to AMD fans that the benefits above are not unique to the CJS
style of writing JavaScript modules, but the ease-of-interoperability with
Node.JS code is a plus of CJS.)

As you begin to write your client-side code in small, reusable modules, you
start to have a lot more files to manage. At the same time, you need to
integrate these files with other client-side libraries, some of which do not
play particularly nicely with a CJS module system. The simplicity provided by
CJS modules can be lost as build complexity is increased and Browserify
compilation time gets out of control.


## Documentation
Run this task with the `grunt browserify` command. As with other Grunt plugins, the `src` and `dest` properties are most important: `src` will use the Grunt glob pattern to specify files for inclusion in the browserified package, and `dest` will specify the outfile for the compiled module.

The current version of grunt-browserify sticks as close to the core browserify API as possible. Additional functionality can be added via the rich ecosystem of browserify transforms and plugins.

The following task options are supported:

#### alias
Type: `Object{alias:path}`

Browserify can alias files or modules to a certain name. For example, `require('./foo')` can be aliased to be used as `require('foo')`.
```js
options: {
  alias: {
    'foo': './foo.js'
  }
}
```

The `alias` option is just a shortcut to require a file and expose a different name for it. You could do exactly the same thing using `require` instead of `alias`. It's equivalent to `require: [ ['./foo.js', {expose: 'foo'} ] ]`

If you need alias mappings, you can use @joeybaker's [remapify plugin](https://github.com/joeybaker/remapify), as demonstrated in the code below:

```js
options: {
  plugin: [
  ['remapify', [
    {
      src: './client/views/**/*.js',  // glob for the files to remap
      expose: 'views', // this will expose `__dirname + /client/views/home.js` as `views/home.js`
      cwd: __dirname  // defaults to process.cwd()
    }
  ]
}
```

#### banner
Type: `String`
Default: empty string

The string will be prepended to the output. Template strings (e.g. `<%= config.value %>` will be expanded automatically.

#### require
Type: `[String]` or `[String:String]` or `[[String, Object]]`

Specifies files to be required in the browserify bundle. String filenames are parsed into their full paths with `path.resolve`. Aliases can be provided by using the `filePathString:aliasName` format.

Each require can also be provided with an options hash; in this case, the require should be specified as an array of `[filePathString, optionsHash]`.

#### ignore
Type: `[String]`

Specifies files to be ignored in the browserify bundle.
String filenames are parsed into their full paths with `path.resolve`.
Globbing patterns are supported.

#### exclude
Type: `[String]`

Specifies files or modules to be excluded in the browserify bundle.
Globbing patterns are supported; globbed filenames are parsed into their full paths.

#### external
Type: `[String]` or `Object{alias:path}`.

Specifies id strings which will be loaded from a previously loaded, “common” bundle.
That is to say, files in the bundle that require the target String will assume
that the target is provided externally.

The secondary form of this option
follows the format of `alias` above, and will externalise the ids specified in
the alias object. This second form allows for the declaration of a single alias
object which can be supplied to one bundle's `alias` option and another option's
`external` option.

In either case, globbing patterns are supported.


#### transform
Type: `[String || Function]` or `[[String || Function,  Object]]`

Specifies a pipeline of functions (or modules) through which the browserified bundle will be run. The transform can either be a literal function, or a string referring to a NPM module. The [browserify docs themselves](https://github.com/substack/node-browserify#btransformtr) explain transform well, but below is an example of transform used with `grunt-browserify` to automatically compile coffeescript files for use in a bundle:

```javascript
browserify: {
  dist: {
    files: {
      'build/module.js': ['client/scripts/**/*.js', 'client/scripts/**/*.coffee'],
    },
    options: {
      transform: ['coffeeify']
    }
  }
}
```

Transforms can also be provided with an options hash; in this case, the transform should be specified as an array of `[transformStringOrFn, optionsHash]`.

Note for [browserify-shim](https://github.com/thlorenz/browserify-shim), the configuration of this transformation has to be inside `package.json`. Please see documentation of `browserify-shim` and [our example](/examples/browserify-shim).

#### plugin
Type: `[String || Function]`
Register a browserify plugin with the bundle. As with transforms, plugins are identified with either their NPM name (String) or a function literal.

#### browserifyOptions
Type: Object

A hash of options that are passed to browserify during instantiation. Task-level `browserifyOptions` are not merged into target-level options.
If a target overrides task-level `browserifyOptions`, it overrides all of it.
[Browserify Github README](https://github.com/substack/node-browserify#var-b--browserifyfiles-or-opts)

#### watch
Type: Boolean
If true, invoke [watchify](https://github.com/substack/watchify) instead of browserify.

For watchify to work properly, you have to keep the process running. The option `keepAlive` can help you do that, or you can use another `grunt-watch` task.

#### keepAlive
Type: Boolean
If true and if `watch` above is true, keep the Grunt process alive (simulates grunt-watch functionality).

#### watchifyOptions
Type: Object
A hash of options that are passed to watchify during instantiation.
[Watchify Github README](https://github.com/substack/watchify#var-w--watchifyb-opts)

#### configure
Type: `Function (b)`

An optional callback function that is invoked once before the bundle runs. This can be used for programatically configuring browserify using it's API.
`b` is the `browserify` instance for the bundle.

#### preBundleCB
Type: `Function (b)`

An optional callback function, that will be called before bundle completion.
`b` is the `browerify` instance that will output the bundle.

__NB:__ This callback will be invoked every time the bundle is built so when used with the `watch` option set to true it will be called multiple times. Do not register transforms in this callback or they will end up being registered multiple times.

#### postBundleCB
Type: `Function (err, src, next)`

An optional callback function, which will be called after bundle completion and
before writing of the bundle. The `err` and `src` arguments are provided
directly from browserify. The `next` callback should be called with `(err,
modifiedSrc)`; the `modifiedSrc` is what will be written to the output file.

__NB:__ This callback will be invoked every time the bundle is built so when used with the `watch` option set to true it will be called multiple times.


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

See the [CHANGELOG](https://github.com/jmreidy/grunt-browserify/blob/master/CHANGELOG.md).

## License
Copyright (c) 2013-2015 `grunt-browserify` contributors
Licensed under the MIT license.
