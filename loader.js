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
			return (inPath && inPath.slice(-1) !== "/") ? inPath + "/" : inPath;
		},
		// match $name
		rewritePattern: /\$([^\/\\]*)(\/)?/g,
		// replace macros of the form $pathname with the mapped value of paths.pathname
		rewrite: function (inPath) {
			var working, its = this.includeTrailingSlash, paths = this.paths;
			var fn = function(macro, name) {
				working = true;
				return its(paths[name]) || '';
			};
			var result = inPath;
			do {
				working = false;
				result = result.replace(this.rewritePattern, fn);
			} while (working);
			return result;
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
		packageName: "",
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
				// block.packageName is the name of the package that interrupted us
				//this.report("finished package", block.packageName);
				this.verbose && console.groupEnd("* finish package (" + (block.packageName || "anon") + ")");
				// cache the folder for the currently processing package
				this.packageFolder = block.folder;
				// no current package
				this.packageName = "";
				// process this new block
				this.more(block);
			} else {
				this.finish();
			}
		},
		finish: function() {
			this.packageFolder = "";
			this.verbose && console.log("-------------- fini");
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
				packageName: this.packageName,
				rawPath: inRawPath,
				path: inPath
			});
			this.loadScript(inPath);
		},
		decodePackagePath: function(inPath) {
			// A package path can be encoded in two ways:
			//
			//	1. [folder]
			//	2. [folder]/[*package.js]
			//
			// Note: manifest file name must end in "package.js"
			//
			var alias = '', target = '', folder = '', manifest = 'package.js';
			// convert back slashes to forward slashes, remove double slashes, split on slash
			var parts = inPath.replace(/\\/g, "/").replace(/\/\//g, "/").replace(/:\//, "://").split("/");
			if (parts.length) {
				// if inPath has a trailing slash, parts has an empty string which we pop off and ignore
				var name = parts.pop() || parts.pop() || "";
				// test if name includes the manifest tag
				if (name.slice(-manifest.length) !== manifest) {
					// if not a manifest name, it's part of the folder path
					parts.push(name);
				} else {
					// otherwise this is the manifest name
					manifest = name;
				}
				//
				folder = parts.join("/");
				folder = (folder ? folder + "/" : "");
				manifest = folder + manifest;
				//
				// build friendly aliasing:
				//
				for (var i=parts.length-1; i >= 0; i--) {
					if (parts[i] == "source") {
						parts.splice(i, 1);
						break;
					}
				}
				target = parts.join("/");
				//
				// portable aliasing:
				//
				// packages that are rooted at a folder named "enyo" or "lib" do not
				// include that root path in their alias
				//
				//	remove */lib or */enyo prefix
				//
				// e.g. foo/bar/baz/lib/zot -> zot package
				//
				for (var i=parts.length-1, p; p=parts[i]; i--) {
					if (p == "lib" || p == "enyo") {
						parts = parts.slice(i+1);
						break;
					}
				}
				// remove ".." and "."
				for (var i=parts.length-1, p; p=parts[i]; i--) {
					if (p == ".." || p == ".") {
						parts.splice(i, 1);
					}
				}
				//
				alias = parts.join("-");
			}
			return {
				alias: alias,
				target: target,
				folder: folder,
				manifest: manifest
			};
		},
		aliasPackage: function(inPath) {
			var parts = this.decodePackagePath(inPath);
			// cache manifest path
			this.manifest = parts.manifest;
			// cache package info for named packages
			if (parts.alias) {
				// debug only
				/*
				var old = enyo.path.paths[parts.name];
				if (old && old != parts.folder) {
					this.verbose && console.warn("mapping alias [" + parts.name + "] to [" + parts.folder + "] replacing [" + old + "]");
				}
				this.verbose && console.log("mapping alias [" + parts.name + "] to [" + parts.folder + "]");
				*/
				//
				// create a path alias for this package
				enyo.path.addPath(parts.alias, parts.target);
				//
				// cache current name
				this.packageName = parts.alias;
				// cache package information
				this.packages.push({
					name: parts.alias,
					folder: parts.folder
				});
			}
			// cache current folder
			this.packageFolder = parts.folder;
		},
		requirePackage: function(inPath, inBlock) {
			// cache the interrupted packageFolder
			inBlock.folder = this.packageFolder;
			this.aliasPackage(inPath);
			// cache the name of the package 'inBlock' is loading now
			inBlock.packageName = this.packageName;
			// push inBlock on the continuation stack
			this.stack.push(inBlock);
			// console/user reporting
			this.report("loading package", this.packageName);
			this.verbose && console.group("* start package [" + this.packageName + "]");
			// load the actual package. the package MUST call a continuation function
			// or the process will halt.
			this.loadPackage(this.manifest);
		}
	};
})();