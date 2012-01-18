(function() {
	enyo = window.enyo || {};

	enyo.path = {
		paths: {
		},
		addPath: function(inName, inPath) {
			return this.paths[inName] = inPath;
		},
		addPaths: function(inPaths) {
			if (inPaths) {
				for (var n in inPaths) {
					this.addPath(n, inPaths[n]);
				}
			}
		},
		includeTrailingSlash: function(inPath) {
			return inPath ? (inPath.charAt(inPath.length - 1) == "/" ? inPath : inPath + "/") : "";
		},
		// match $name
		rewritePattern: /\$([^\/\\]*)(\/)?/g,
		// replace macros of the form $pathname with the mapped value of paths.pathname
		rewrite: function (inPath) {
			var working, its = this.includeTrailingSlash, paths = this.paths;
			var fn = function(macro, name) {
				working = true;
				return its(paths[name]);
			};
			var result = inPath;
			do {
				working = false;
				result = result.replace(this.rewritePattern, fn);
			} while (working);
			return result;
		},
		unwrite: function(inPath) {
			for (var n in this.paths) {
				var p = this.paths[n] || '';
				var l = p.length;
				// if inPath is rooted at path p, replace that path with n (p's alias)
				if (inPath.slice(0, l) == p) {
					//return this.includeTrailingSlash("$" + n) + inPath.slice(l);
					return "$" + n + inPath.slice(l);
				}
			}
			return inPath;
		}
	};

	enyo.loaderFactory = function(inMachine) {
		this.machine = inMachine;
		// package information
		this.packages = [];
		// module information
		this.modules = [];
		// stylesheet paths
		this.sheets = [];
		// (protected) internal dependency stack
		this.stack = [];
	};

	enyo.loaderFactory.prototype  = {
		packageManifest: "package",
		package: "",
		packageFolder: "",
		verbose: false,
		//
		loadScript: function(inScript) {
			this.machine.script(inScript);
		},
		loadSheet: function(inSheet) {
			this.machine.sheet(inSheet);
		},
		loadPackage: function(inPackage) {
			this.machine.script(inPackage);
		},
		report: function() {
		},
		//
		load: function(/*<inDependency0, inDependency1 ...>*/) {
			// begin processing dependencies
			this.more({
				index: 0,
				depends: arguments || []
			});
		},
		finish: function() {
			this.packageFolder = "";
			this.verbose && console.log("-------------- fini");
		},
		more: function(inBlock) {
			// a 'block' is a dependency list with a bookmark
			// the bookmark (index) allows us to interrupt 
			// processing and then continue asynchronously.
			if (inBlock) {
				// returns true if this block has asynchronous requirements
				// in that case, we unwind the stack. The asynchronous loader
				// must provide the continuation (by calling 'more' again).
				if (this.continueBlock(inBlock)) {
					return;
				}
			}
			// A package is now complete. Pop the block that was interrupted for that package (if any).
			var block = this.stack.pop();
			if (block) {
				// block.package is the name of the package that interrupted us
				//this.report("finished package", block.package);
				this.verbose && console.groupEnd("* finish package (" + (block.package || "anon") + ")");
				//this.verbose && console.log("* finish package (" + (block.package || "anon") + ")");
				// cache the folder for the currently processing package
				this.packageFolder = block.folder;
				// no current package
				this.package = "";
				// process this new block
				this.more(block);
			} else {
				this.finish();
			}
		},
		continueBlock: function(inBlock) {
			while (inBlock.index < inBlock.depends.length) {
				var d = inBlock.depends[inBlock.index++];
				if (d) {
					if (typeof d == "string") {
						if (this.require(d, inBlock)) {
							// return true to indicate we need to interrupt
							// processing until asynchronous file load completes
							// the load process itself must provide the 
							// continuation
							return true;
						}
					/*
					} else if ("paths" in d) {
						enyo.path.addPaths(d.paths);
					}
					*/
					} else {
						enyo.path.addPaths(d);
					}
				}
			}
		},
		require: function(inPath, inBlock) {
			// process aliases
			var path = enyo.path.rewrite(inPath);
			// get path root
			var prefix = this.getPathPrefix(inPath);
			// assemble path
			path = prefix + path;
			// process path
			if (path.slice(-3) == "css") {
				this.verbose && console.log("+ stylesheet: [" + prefix + "][" + inPath + "]");
				this.requireStylesheet(path);
			} else if (path.slice(-2) == "js" && path.slice(-10) != "package.js") {
				this.verbose && console.log("+ module: [" + prefix + "][" + inPath + "]");
				this.requireScript(inPath, path);
			} else {
				// package
				this.requirePackage(path, inBlock);
				// return true to indicate a package was located and 
				// we need to interrupt further processing until it's completed
				return true;
			}
		},
		getPathPrefix: function(inPath) {
			var delim = inPath.slice(0, 1);
			if ((delim != "/") && (delim != "\\") && (delim != "$") && (inPath.slice(0, 5) != "http:")) {
				return this.packageFolder;
			}
			return "";
		},
		requireStylesheet: function(inPath) {
			// stylesheet
			this.sheets.push(inPath);
			this.loadSheet(inPath);
		},
		requireScript: function(inRawPath, inPath) {
			// script file
			this.modules.push({
				package: this.package,
				rawPath: inRawPath,
				path: inPath
			});
			this.loadScript(inPath);
		},
		aliasPackage: function(inPath) {
			// package can encoded in two ways: 
			//
			//	1. [folder]/[package file name (must end in "package" or "package.js")]
			//	2. [folder]
			//
			// example of #1:
			//
			//	"foo"
			//
			// the package name is 'foo', $foo will point to "foo/", 
			// the manifest file is "foo/package.js"
			//
			// examples of #2:
			//
			//	"foo/package.js"
			//
			// the package name is 'foo', $foo will point to "foo/", 
			// the manifest is "foo/package.js"
			//
			//	"foo/bar-package.js"
			//
			// the package name is 'foo', $foo will point to "foo/", 
			// the manifest is "foo/bar-package.js"
			//
			var parts = inPath.split("/");
			// the last string contains the package name
			var name = parts.pop();
			// reconstitute (at least part of) the folder
			var folder = parts.length ? (parts.join("/") + "/") : "";
			// if the name defines a package file explicitly
			if (name.slice(-10) == "package.js") {
				// use the specified package
				this.manifest = folder + name;
				// name comes from the folder
				name = parts.pop();
			} else {
				// otherwise, it's a folder, so rebuild the path (ensure trailling slash)
				folder = folder + name + "/";
				// this is the package path
				this.manifest = folder + "package.js";
			}
			//
			// construct an alias for this package based on it's path
			// 1. replace known paths with aliases
			// e.g. "../bar/zot/foo/zing" can become "$foo/zing", if "$foo" is registered
			var n$ = enyo.path.unwrite(folder).split("/");
			// 2. '$enyo' is magic, such that "enyo" is left out of the alias
			// e.g. package at "$enyo/fu" is aliased simply as "$fu"
			if (n$[0] == "$enyo") {
				name = n$.slice(1).join("/");
			}
			// 3. '$lib' is magic, such "lib" is left out of the alias
			// e.g. package at "$lib/fu" is aliased as "$fu" instead of "$lib-fu"
			else if (n$[0] == "$lib") {
				name = n$.slice(1).join("/");
			}
			// 4. 'lib' is magic, such that the entire path up to an including "lib" is left out of the alias,
			//    allowing multiple lib folders to exist, and packages to be portable between lib folders,
			//    as long as the package names are unique.
			// e.g. package at "<any path>/lib/fu" is aliased as "$fu" instead of "$<any-path>-lib-fu"
			for (var i=n$.length-1; i>=0; i--) {
				if (n$[i] == "lib") {
					name = n$.slice(i+1).join("/");
					break;
				}
			}
			//
			// now clean the path a bit (remove "..", convert slashes to dashes)
			// e.g. "../foo/bar/zot" becomes "foo-bar-zot"
			name = name.replace(/\.\.\/?/g, "").replace(/\$/g, "").replace(/[\/]/g, "-");
			if (name[name.length-1] == "-") {
				name = name.slice(0, -1);
			}
			//
			// 'source' folder is magic: we omit it from the name, so we can depend on <package>/source
			// but alias only <package>
			name = name.replace("-source", "").replace("source", "");
			var target = (folder.slice(-7) == "/source") ? folder.slice(0, -7) : 
				folder.slice(-6) == "source" ? folder.slice(0, -6) :
					folder;
			//
			if (name) {
				// debug only
				var old = enyo.path.paths[name];
				if (old && old != folder) {
					this.verbose && console.warn("mapping alias [" + name + "] to [" + folder + "] replacing [" + old + "]");
				}
				this.verbose && console.log("mapping alias [" + name + "] to [" + folder + "]");
				//
				// create a path alias for this package
				enyo.path.addPath(name, target);
				//
				// cache current name
				this.package = name;
				// cache package information
				this.packages.push({
					name: name,
					folder: folder
				});
			}
			// cache current folder
			this.packageFolder = folder;
		},
		requirePackage: function(inPath, inBlock) {
			// cache the interrupted packageFolder
			inBlock.folder = this.packageFolder;
			this.aliasPackage(inPath);
			// cache the name of the package 'inBlock' is loading now
			inBlock.package = this.package;
			// push inBlock on the continuation stack
			this.stack.push(inBlock);
			// console/user reporting
			this.report("loading package", this.package);
			this.verbose && console.group("* start package [" + this.package + "]");
			// load the actual package. the package MUST call a continuation function
			// or the process will halt.
			this.loadPackage(this.manifest);
		}
	};
})();