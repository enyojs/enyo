(function (enyo) {
	var kind = enyo.kind
		, clone = enyo.clone
		// , isObject = enyo.isObject
		// , isString = enyo.isString
		// , isFunction = enyo.isFunction
		// , isArray = enyo.isArray
		// , forEach = enyo.forEach
		// , where = enyo.where
		, mixin = enyo.mixin
		, inherit = enyo.inherit
		, constructorForKind = enyo.constructorForKind
		// , find = enyo.find
		// , map = enyo.map
		, exists = enyo.exists
		// , oKeys = enyo.keys
		, only = enyo.only
		, store = enyo.store
		, getPath = enyo.getPath;
		
	var Model = enyo.Model
		, Collection;
		
	/**
		Private class for a collection that defaults its model kind to enyo.RelationalModel
		as oppossed to enyo.Model.
		
		@private
		@class
	*/
	Collection = kind({kind: enyo.Collection, model: "enyo.RelationalModel"});

	/**
	*/
	var relationDefaults = {
		/**
		*/
		type: "toOne",
		
		/**
		*/
		key: null,
		
		/**
		*/
		create: true,
		
		/**
		*/
		parse: false,
		
		/**
		*/
		model: "enyo.RelationalModel",
		
		/**
		*/
		fetch: false,
		
		/**
		*/
		inverseKey: null,
		
		/**
		*/
		inverseType: null,
		
		/**
		*/
		isOwner: true,
		
		/**
		*/
		includeInJSON: true
	};

	/**
		@private
		@abstract Relation
	*/
	var Relation = kind({
		kind: null,
		
		/**
			@private
		*/
		options: {},
		
		/**
			@private
			@method
		*/
		constructor: function (instance, props) {
			// apply any of the properties to ourself for reference
			mixin(this, [relationDefaults, this.options, props]);
			
			// store a reference to the model we're relating
			this.instance = instance;
			// ensure we have a constructor for our related model kind
			this.model = constructorForKind(this.model);
			
			// unless explicitly set by the user-definition we alter the default value
			// here to "id" in non-owner relations
			this.includeInJSON = !props.includeInJSON && !this.isOwner? (this.model.prototype.primaryKey || "id"): this.includeInJSON;
			
			// let the subkinds do their thing
			this.init();
		},
		
		/**
			@public
			@method
		*/
		getRelated: function () {
			return this.related;
		},
		
		/**
			@public
			@method
		*/
		setRelated: function (related) {
			var inst = this.instance
				, key = this.key
				, was = this.related
				, changed = inst.changed || (inst.changed = {})
				, prev = inst.previous || (inst.previous = {});
			changed[key] = this.related = related;
			prev[key] = was;
			if (was !== related) {
				inst.notify(key, was, related);
				!inst.isSilenced() && inst.emit("change", changed);
			}
			return this;
		},
		
		/**
			@private
			@method
		*/
		destroy: function () {
			this.destroyed = true;
			this.instance = null;
		}
	});
	
	Relation.concat = function (ctor, props) {
		var proto = ctor.prototype;
		if (props.options) {
			proto.options = mixin({}, [proto.options, props.options]);
			delete props.options;
		}
	};
	
	/**
		@public
		@class enyo.toMany
	*/
	kind(
		/** @lends enyo.toMany.prototype */ {
		name: "enyo.toMany",
		kind: Relation,
		noDefer: true,
		
		/**
			@public
		*/
		options: {
			/**
			*/
			collection: Collection,
			
			/**
			*/
			collectionOptions: {}
		},
		
		/**
			@private
			@method
		*/
		init: function () {
			var inst = this.instance
				, key = this.key
				, isOwner = this.isOwner
				, fetch = this.fetch
				, parse = this.parse
				, inverseKey = this.inverseKey
				, collection = this.collection
				, collectionOpts = this.collectionOptions? clone(this.collectionOptions): {}
				, create = this.create
				, model = this.model
				, related = exists(this.related)? this.related: inst.attributes[key];
			
			typeof collection == "string" && (collection = getPath(collection));
			typeof model == "string" && (model = constructorForKind(model));
			
			// if the model property is used for the collection constructor then we
			// use the model of this collection
			if (model.prototype instanceof enyo.Collection) {
				collection = model;
				model = collection.prototype.model;
			}
			if (!model) model = collection.prototype.model;
			else collectionOpts.model = collectionOpts.model || model;
			
			if (!model || !collection) {
				return enyo.error("Cannot resolve defined relation for " + inst.kindName + " with key " + key +
					" without a valid model and/or collection property");
			} else {
				this.collection = collection instanceof Collection? collection.ctor: collection;
				this.model = model;
				collection = collection instanceof Collection? mixin(collection, collectionOpts): new collection(collectionOpts);
			}
			
			// ensure we have the correct parse value
			this.parse = this.parse || model.prototype.options.parse;
			
			// create means we assume all data fetching will be done arbitrarily and we will not
			// be fetching separately from the owner
			if (create) {
				if (exists(related)) {
					parse && (related = collection.parse(related));
					// we can avoid subsequent exists call because it needs to be an object
					typeof related == "object" && collection.add(related);
				}
			} else {
				
				// if the fetch flag is truthy we will execute the (assumably) asynchronous
				// request now ensuring we pass in any options that might have been available
				if (fetch) this.fetchRelated();
			}
			
			inst.attributes[key] = this;
			
			// we need to detect these changes to propagate them onward
			collection.on("*", this.onChange, this);
			// collection.on("remove", this.onChange, this);
			// collection.on("change", this.onChange, this);
			
			// ensure we store our related collection now
			this.related = collection;
			// we need to look for related models
			// this.findRelated();
		
			// special overload of store allows us to more narrowly listen to particular events
			// for associated kinds
			// @NOTE: We only register for this if we have an inverseKey otherwise we have no
			// way of knowing the reverse relationship
			if (inverseKey) store.on(model, "add", this.onChange, this);
		},
		
		/**
			@public
			@method
		*/
		fetchRelated: function () {
			
		},
		
		/**
			@private
			@method
		*/
		setRelated: function (data) {
			var related = this.related;
			
			related.add(data, {purge: true, parse: true});
		},
		
		/**
			@public
			@method
		*/
		findRelated: function () {
			var ctor = this.model
				, related = this.related
				, inverseKey = this.inverseKey
				, isOwner = this.isOwner
				, inst = this.instance
				, id = inst.get(inst.primaryKey);
			
			if (inverseKey) {
				// found = store.findLocal(ctor, this.checkRelation, this, {all: true});
				store.findLocal(ctor, this.checkRelation, this, {all: true}, function (found) {
				
					// we shouldn't need to update any records already present so we'll ignore
					// duplicates for efficiency
					if (found.length) related.add(found, {merge: false});
				});
			}
		},
		
		/**
			@public
			@method
		*/
		checkRelation: function (model) {
			var ctor = this.model
				, inst = this.instance
				, key = this.key
				, inverseKey = this.inverseKey
				, related = inverseKey && model.get(inverseKey)
				, rel = model.getRelation(inverseKey)
				, id = inst.get(inst.primaryKey)
				, isOwner = this.isOwner;
				
			if (exists(related) && (related === inst || related == id)) {
				
				// if the relation isn't found it probably wasn't defined and we need
				// to automatically generate it based on what we know
				if (!rel && inverseKey) model.relations.push((rel = new enyo.toOne(model, {
					key: inverseKey,
					inverseKey: key,
					parse: false,
					create: false,
					isOwner: !isOwner,
					model: ctor,
					related: inst
				})));
				
				if (rel.related !== inst) rel.setRelated(inst);
				return true;
			}
			
			return false;
		},
		
		/**
			@private
			@method
		*/
		raw: function () {
			var iJson = this.includeInJSON
				, raw;
			if (iJson === true) raw = this.related.raw();
			else if (typeof iJson == "string") raw = this.related.map(function (model) {
				return model.get(iJson);
			});
			else if (iJson instanceof Array) raw = this.related.map(function (model) {
				return only(iJson, model.raw());
			});
			else if (typeof iJson == "function") raw = iJson.call(this.instance, this.key, this);
			return raw;
		},
		
		/**
			@private
			@method
		*/
		onChange: function (sender, e, props) {
			// console.log("enyo.toMany.onChange: ", arguments);
			
			var inst = this.instance
				, key = this.key
				, related = this.related
				, changed;
			
			if (sender === store) {
				if (e == "add") {
					if (this.checkRelation(props.model)) this.related.add(props.model, {merge: false});
				}
			}
		},
		
		/**
			@private
			@method
		*/
		destroy: inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				
				// @TODO: !!!
			};
		})
	});
	
	enyo.toMany.concat = function (ctor, props) {
		var proto = ctor.prototype;
		if (props.collectionOptions) {
			proto.collectionOptions = mixin({}, [proto.collectionOptions, props.collectionOptions]);
			delete props.collectionOptions;
		}
	}
	
	/**
		@public
		@class enyo.manyToMany
	*/
	kind(
		/** @lends enyo.manyToMany.prototype */ {
		name: "enyo.manyToMany",
		kind: enyo.toMany,
		noDefer: true,
		
		options: {
			inverseType: "enyo.manyToMany",
			isOwner: false
		},
		
		/**
			@private
			@method
		*/
		checkRelation: function (model) {
			var ctor = this.model
				, inst = this.instance
				, key = this.key
				, inverseKey = this.inverseKey
				, related = inverseKey && model.get(inverseKey)
				, rel = model.getRelation(inverseKey)
				, id = inst.get(inst.primaryKey)
				, isOwner = this.isOwner;
			
			if (related && (related.has(inst) || related.find(function (model) { return model.attributes[model.primaryKey] == id; }))) {
				
				// if the relation isn't found it probably wasn't defined and we need
				// to automatically generate it based on what we know
				if (!rel) model.relations.push((rel = new enyo.manyToMany(model, {
					key: inverseKey,
					inverseKey: key,
					parse: false,
					create: false,
					isOwner: !isOwner,
					model: ctor,
					related: inst
				})));
				
				// if (rel.related !== inst) rel.setRelated(inst);
				// if (!rel.related.has(inst)) rel.related.add(inst);
				return true;
			}
			
			return false;
		},
		
		onChange: inherit(function (sup) {
			return function (sender, e, props) {
				var related = this.related
					, inst = this.instance
					, inverseKey = this.inverseKey
					, key = this.key
					, changed, previous;
				
				if (sender === related && !this.isChanging) {
				
					this.isChanging = true;
				
					if (e == "change") {
						if (this.checkRelation(props.model)) related.add(props.model);
						else related.remove(props.model);
					} else if (inverseKey && (e == "add" || e == "remove")) {
						
						props.models.forEach(function (model) {
							model.get(inverseKey)[e](inst);
						});
					}
					
					changed = inst.changed || (inst.changed = {});
					previous = inst.previuos || (inst.previous = {});
					changed[key] = previous[key] = related;
					inst.emit("change", changed);
				
					this.isChanging = false;
				}
				
				// console.log(inst.euid, key, "onChange", sender === related? "related": "store", e, props);
				// console.log(related.euid, key, e, props.model.changed);

				else sup.apply(this, arguments);
			};
		})
	});
	
	/**
		@public
		@class enyo.toOne
	*/
	kind(
		/** @lends enyo.toOne.prototype */ {
		name: "enyo.toOne",
		kind: Relation,
		noDefer: true,
		
		options: {
			inverseType: "enyo.toOne"
		},
		
		/**
			@private
			@method
		*/
		init: function () {
			var inst = this.instance
				, dit = this
				, key = this.key
				, isOwner = this.isOwner
				, fetch = this.fetch
				, parse = this.parse
				, inverseKey = this.inverseKey
				, inverseType = this.inverseType
				, create = this.create
				, model = this.model
				, modelOpts = this.modelOptions
				, related = exists(this.related)? this.related: inst.attributes[key];
				
			typeof model == "string" && (model = constructorForKind(model));
			typeof inverseType == "string" && (inverseType = constructorForKind(inverseType));
			
			// ensure we have the correct model constructor
			this.model = model;
			this.related = related;
			this.inverseType = inverseType;
			
			if (isOwner) {
				if (related && (typeof related == "string" || typeof related == "number")) {
					// found = store.findLocal(model, function (model) { return model.get("id") == related; }, {all: false});
					store.findLocal(model, function (model) { return model.get("id") == related; }, {all: false}, function (found) {
						if (found) this.related = found;
				
						if (create && !found) {
							model = new model(null, null, modelOpts);
							exists(related) && parse && (related = model.parse(related));
							related && typeof related == "object"? model.set(related): model.set(model.primaryKey, related);
							dit.related = model;
							model = dit.model;
						} else {
					
							// in cases where we are the owner but aren't supposed to create the
							// other end of the relation we wait for it to appear
							store.on(model, dit.onChange, dit);
						}
					});
				}
			}
			// ensure that the property points to us as the value
			inst.attributes[key] = this;
			// we need to know about all future changes
			inst.on("change", this.onChange, this);
			// attempt to find and or setup any related value that we can at this time
			// this.findRelated();
		},
		
		/**
			@public
			@method
		*/
		setRelated: inherit(function (sup) {
			return function (related) {
				if (related && related instanceof Model) {
					return sup.apply(this, arguments);
				} else if (exists(related)) {
					var val = related;
					related = this.getRelated();
					
					// the only thing we can do is assume the value is intended to be the primary
					// key of the model just like we would had it been passed into the constructor
					if (this.create && related) related.set(related.primaryKey, val);
					// otherwise we allow it to be set and try and find the model from this new
					// criterion but we don't do all the notifications for it as code expecting
					// an instance may be disappointed (e.g. break, die, suicide, self-destruct...)
					else {
						this.related = related;
						// related = this.findRelated();
						this.findRelated(function (related) {
							// if it was found by this new value somehow we allow the original
							// set to take place so it will notify everyone
							related && related instanceof Model && sup.call(this, related);
						});
					}
				}
				
				// @TODO: This ignores cases that it might be set as null or undefined which
				// would clear the related but most of the code assumes there will always be
				// a value for related but it seems _possible_ that this behavior may be
				// necessary so would need to find a way to handle that
			};
		}),
		
		/**
			@public
			@method
		*/
		fetchRelated: function () {
		},
		
		/**
			@public
			@method
		*/
		findRelated: function (cb) {
			var related = this.related
				, dit = this
				, inst = this.instance
				, ctor = this.model
				, key = this.key
				, inverseKey = this.inverseKey
				, inverseType = this.inverseType
				, isOwner = this.isOwner
				, found, rel;
				
			var fn = function (found) {
				if (found) {
					// remove our listener on the store if it's there because
					// we don't need it anymore
					isOwner && store.off(ctor, this.onChange, this);
					// we also establish this found entity as our related model
					dit.related = found;
					// we try and establish the relation when possible
					if (inverseKey) {
						rel = found.getRelation(inverseKey);
				
						if (!rel) found.relations.push((rel = new inverseType(found, {
							isOwner: !isOwner,
							key: inverseKey,
							inverseKey: key,
							parse: false,
							create: false,
							model: inst.ctor,
							related: inst
						})));
				
						switch (rel.kindName) {
						case "enyo.toOne":
							if (rel.related !== inst) rel.setRelated(inst);
							break;
						case "enyo.toMany":
							// its unfortunate but we will allow this to attempt the add to avoid the
							// double lookup hit - if it is already present on the next pass (via the
							// store's add event) it will do hardly anything
							rel.related.add(inst, {merge: false});
							break;
						}
					}
				
					if (isOwner) found.on("change", this.onChange, this);
					
					if (cb) cb(found);
				}
			};
						
			if (related && related instanceof ctor) {
				fn(related);
			} else if (exists(related) || inverseKey) {
				
				// in cases where some value of some sort was supplied to try loose comparison
				// for euid and primaryKey to find it in the store
				store.findLocal(ctor, this.checkRelation, this, {all: false}, fn);
			}
		},
		
		/**
			@private
			@method
		*/
		checkRelation: function (model) {
			var related = this.related
				, inst = this.instance
				, id = inst.get(inst.primaryKey)
				, inverseKey = this.inverseKey;
			return (related && (model.euid == related || model.get(model.primaryKey) == related || model.get(model.primaryKey) == related[inst.primaryKey])) || (exists(id) && model.get(inverseKey) == id);
		},
		
		/**
			@private
			@method
		*/
		raw: function () {
			var iJson = this.includeInJSON
				, raw;
			if (iJson === true) raw = this.related.raw();
			else if (typeof iJson == "string") raw = this.related.get(iJson);
			else if (iJson instanceof Array) raw = only(iJson, this.related.raw());
			else if (typeof iJson == "function") raw = iJson.call(this.instance, this.key, this);
			return raw;
		},
		
		/**
			@private
			@method
		*/
		onChange: function (sender, e, props) {
			var key = this.key
				, inst = this.instance
				, isOwner = this.isOwner
				, changed;
			
			// console.log("enyo.toOne.onChange", arguments);
			
			if (sender === this.instance) {
				if (e == "change") {
					if (key in props) {
						this.findRelated();
					}
				}
			} else if (sender === this.related) {
				if (e == "change" && isOwner) {
					// @TODO: This is a questionable way to handle this particular type of event chaining
					// it is possible it would be better to re-create the string/paths to be relative to
					// the instance not another nested object this way
					inst.isDirty = true;
					changed = inst.changed || (inst.changed = {});
					// @TODO: Need to come back to this whole scenario but for now it just ensures there
					// won't be a failure in the update call but no real previous can exist for the properties
					// that are changing on the relation
					inst.previous || (inst.previous = {});
					changed[key] = props;
					if (!inst.isSilenced()) inst.emit("change", changed, inst);
				}
			}
		}
	});

	/**
		@public
		@class enyo.RelationalModel
	*/
	kind({
		name: "enyo.RelationalModel",
		kind: Model,
		noDefer: true,
		
		/**
			@public
			@method
		*/
		getRelation: function (name) {
			return this.relations.find(function (ln) {
				return ln instanceof Relation && ln.key == name;
			});
		},
		
		/**
			@public
			@method
		*/
		isRelation: function (name) {
			return this.getRelation(name);
		},
		
		/**
			@public
			@method
		*/
		fetchRelated: function () {
			
		},
		
		/**
			@private
			@method
		*/
		get: inherit(function (sup) {
			return function (path) {
				path || (path = "");
				
				var prop = path
					, rel, parts;
				
				if (path.indexOf(".") >= 0) {
					parts = path.split(".");
					prop = parts.shift();
				}
				
				rel = this.isRelation(prop);
				
				return !rel? sup.apply(this, arguments):
					parts? rel.getRelated().get(parts.join(".")):
					rel.getRelated();
			};
		}),
		
		/**
			@public
			@method
		*/
		set: function (path, is, opts) {
			if (!this.destroyed) {
				var attrs = this.attributes
					, prev = this.previous
					, changed
					, incoming
					, force
					, silent
					, key
					, value
					, curr
					, parts;
				
				if (typeof path == "object") {
					incoming = path;
					opts || (opts = is);
				} else {
					incoming = {};
					incoming[path] = is;
				}
			
				if (opts === true) {
					force = true;
					opts = {};
				}
			
				opts || (opts = {});
				silent = opts.silent;
				force = force || opts.force;
			
				for (key in incoming) {
					value = incoming[key];
					
					if (key.indexOf(".") > 0) {
						parts = key.split(".");
						key = parts.shift();
					}
					
					curr = attrs[key];
					if (curr && curr instanceof Relation) {
						if(parts) curr.getRelated().set(parts.join("."), value, opts);
						else curr.setRelated(value, opts);
						if (curr.isOwner) {
							changed || (changed = this.changed = {});
							changed[key] = curr.getRelated();
						}
						continue;
					}
					
					if (value !== curr || force) {
						prev || (prev = this.previous = {});
						changed || (changed = this.changed = {});
						// assign previous value for reference
						prev[key] = curr;
						changed[key] = attrs[key] = value;
					}
				}
			
				if (changed) {
					// must flag this model as having been updated
					this.isDirty = true;
				
					if (!silent && !this.isSilenced()) this.emit("change", changed, this);
				}
			}
		},
		
		/**
			@private
			@method
		*/
		raw: function () {
			var inc = this.includeKeys
				, attrs = this.attributes
				, keys = inc || Object.keys(attrs)
				, cpy = inc? only(inc, attrs): clone(attrs);
				
			keys.forEach(function (key) {
				var rel = this.isRelation(key)
					, ent = rel? rel.getRelated(): this.get(key);
				if (!rel) {
					if (typeof ent == "function") ent.call(this);
					else if (ent && ent.raw) cpy[key] = ent.raw();
					else cpy[key] = ent;
				} else {
					var iJson = rel.includeInJSON;
					// special handling for relations as we need to ensure that
					// they are indeed supposed to be included

					// if it is a falsy value then we do nothing
					if (!iJson) delete cpy[key];
					// otherwise we leave it up to the relation to return the correct
					// value for its settings
					else cpy[key] = rel.raw();
				}
			}, this);
			
			return cpy;
		},
		
		/**
			@private
			@method
		*/
		constructor: inherit(function (sup) {
			return function (attrs, props, opts) {
				opts = opts || {};
				// we need to postpone the addition of the record to the store
				opts.noAdd = true;
				sup.call(this, attrs, props, opts);
				this.initRelations();
				this.store.add(this, opts, opts.syncStore);
			};
		}),
		
		/**
			@private
			@method
		*/
		destroy: inherit(function (sup) {
			return function () {
				this.relations.forEach(function (rel) { rel.destroy(); });
				sup.apply(this, arguments);
				this.relations = null;
			};
		}),
		
		/**
			@private
			@method
		*/
		initRelations: function () {
			var rels = this.relations || (this.relations = []);
			if (rels.length) {
				this.relations = rels.map(function (ln) {
					return new ln.type(this, ln);
				}, this);
				this.relations.forEach(function (ln) { ln.findRelated(); });
			}
		}

	});
	
	/**
		Ensure that we concatenate (sanely) the relations for any subkinds.
	
		@private
	*/
	enyo.RelationalModel.concat = function (ctor, props) {
		var proto = ctor.prototype || ctor
			, rels = proto.relations && proto.relations.slice()
			, type;

		if (props.relations) {
			rels = (rels && rels.concat(props.relations)) || props.relations;
		}

		// quickly fetch the constructor for the relation once so all instances won't
		// have to look it up later, only need to do this for the incoming props as
		// it will have already been done for any existing relations from a base kind
		props.relations && props.relations.forEach(function (relation) {
			var type = relation.type;
			
			if (!(type === enyo.toMany) && !(type === enyo.toOne) && !(type === enyo.manyToMany)) {
				relation.type = typeof type == "string"? constructorForKind(enyo[type] || type): enyo.toOne;
			}
		});
		
		// remove this property so it will not be slammed on top of the root property
		delete props.relations
		// apply our modified relations array to the prototype
		proto.relations = rels;
	};

})(enyo);