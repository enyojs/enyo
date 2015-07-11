### 3.8.0
- Update dependencies. Browserify 10.0
- New: Users can specify the alias with {alias: path} [#316](/grunt-browserify/316)

### 3.7.0
- Update dependencies.
- Update to Watchify 3.0 (#314 via @jonbretman)
- New: browserify-shim example
- Fix: [#289](/grunt-browserify/issues/289) with #317 by adding more details in readme for watchify.

### 3.6.0
- New: List only the required files in package.json
- New: Added node 0.12 for Travis.
- Fix: Run tasks in parallel instead of in series to fix [#199](/grunt-browserify/issues/199).

### 3.5.1
- Update dependencies.
- Update watchify to fix an issue with *.json files ([watchify#160](https://github.com/substack/watchify/pull/160) with #308 (@Pleochism))

### 3.5.0
- New: Support for passing options to watchify (watchifyOptions) (#299 via @nfvs)
- New: JSHint in Travis (#300 via @jonbretman)
- New: require option can now takes options hash (#302 via @jonbretman)
- New: configure option to be able to configure the bundle using the browserify api. (#303 via @oliverwoodings)

### 3.4.0
- Update dependencies. Browserify to v9.
- Fix: Update require to expose as per browserify (#292 via @justinjmoses)
- New: Add example with factor-bundle

### 3.3.0
- Update dependencies. Browserify to v8.

### 3.2.1
- Fix: Remove errant console.log (#257 via @tleunen)
- Fix: Deep clone browserify options to prevent dupes (#261 via @wgcrouch)

### 3.2.0
- New: Add support for browserify entries option (@JoshuaToenyes)
- New: Add Banner option (@tleunen)
- Fix: Merge options.alias with options.require (@tleunen)

### 3.1.0
- Update dependencies. Browserify to v6.

### 3.0.1
- Fix regression #227: keep failed process alive

### 3.0
- Release of 2.2-beta
- Actually moving to semver from this point forward

### 2.2-beta
- Update browserify to v5 and watchify to v1

### v2.1.4
- Update browserify to deal with security vulnerability

### v2.1.3
- Fix ignore/exclude behavior

### v2.1.2
- Fix onBundleComplete regression

### v2.1.1
- Update dependencies layout
- Only write bundle if src exists
- Properly append semicolons to bundle output

### v2.1.0
- Update to Browserify 4.x

### v2.0.8
- Exclude should only resolve filenames for glob patterns.

### v2.0.7
- Allow watchify bundle updates to fail without killing grunt

### v2.0.6
- Add support for globbing patterns for ignore, exclude, and external

### v2.0.5
- Update deps

### v2.0.4
- Allow `alias` to work with modules. (via @daviwil)

### v2.0.3
- Restore keepAlive and watch support.

### v2.0.2
- Remove browserify-shim dependency, since it's now an optional transform

### v2.0.1
- Complete rewrite of grunt-browserify internals, and update of the API.
(2.0.0 was mis-published to NPM and removed).

### v1.3.2
  - Adding `require` and global `transform` options.

### v1.3.1
  - Adding support for Browserify 3.2 paths (via @trevordixon)

### v1.3.0
  - Bump to Browserify v3

### v1.2.12
  - Add `preBundleCB` option (via @alexstrat)

### v1.2.11
  - Move to browserify 2.35 for upstream dedupe fix

### v1.2.10
  - Fix #106

### v1.2.9
  - Fix peerDependency version requirements

### v1.2.8
  - Add postBundle callback support (via @Bockit)

### v1.2.7
  - Fix bug in sharing shimmed files across bundles (#89)

### v1.2.6
  - Move browserify to a peer dependency, to allow custom versions (via @nrn)
  - Add support for browserify extension flag (from browserify v2.31)

### v1.2.5
  - Documentation fix (via @alanshaw)
  - Allow aliasing inner modules (via @bananushka)
  - Fix multitask shim bug (via @byronmwong)

### v1.2.4
  - Flatten options arrays, to prevent any weird behavior (via @joeybaker)

### v1.2.3
  - Allow aliasing with arbitrary ids. For example, you could alias `./vendor/client/jquery/jquery.js` to `/vendor/jquery`
  for consumption by other bundles. See the updated `complex` and `externals` examples

### v1.2.2
  - Change `alias` destination behavior to only treat the destination as a
    filepath if it exists

### v1.2.1
  - Bumping dependency versions

### v1.2
  - `Externalize` has been deprecated in favor of `alias` (#69)
  - Allow `external` to use module names, in addition to file paths (#68). Waiting on Browserify changes for this to actually work.
  - Much improved docs (#67)
  - Allow non-files to be ignored (#50), via @joshuarubin

### v1.1.1
  - Fix regression where shimmed modules not being parsed

### v1.1.0
  - Added support for noParse option
  - Change browserify() call to pass files as opts.entries

### v1.0.5
  - Bumping to latest Browserify (2.18.x)

### v1.0.4
  - Adding directory support for `external` parameter

### v1.0.3
  - Add new aliasMappings functionality

### v1.0.2
  - Move away from browserify-stream to callback approach

### v1.0.0
  - Really should've been released at v0.2, but better late than never!

### v0.2.5
  - Update externalize to expose npm modules to external bundles

### v0.2.4
  - Add externalize option, to expose modules to external bundles
  - Add browserify-shim support
  - Completely rewrote and significantly improved tests
  - Various fixes

### v0.2.0
  - Add support for Browserify 2

### v0.1.1
  - Properly support compact and full grunt task syntax

### v0.1.0
  - Initial release