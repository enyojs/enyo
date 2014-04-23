(function (enyo, scope) {
	
	var kind = enyo.kind;
		
	var Model = enyo.Model,
		Collection = enyo.Collection;
		
	/**
		Private class for a collection that defaults its model kind to enyo.RelationalModel
		as oppossed to enyo.Model.
		
		@private
		@class RelationalCollection
		@extends enyo.Collection
	*/
	var RelationalCollection = kind(
		/** @lends Collection.prototype */ {
			
		/**
			@private
		*/
		kind: Collection,
		
		/**
			@private
		*/
		model: 'enyo.RelationalModel'
	});

	/**
		@todo No idea how to document these as default options
	*/
	var relationDefaults = {
		/**
		*/
		type: 'toOne',
		
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
		model: 'enyo.RelationalModel',
		
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
		@protected
		@abstract Relation
	*/
	var Relation = kind(
		/** @lends Relation.prototype */ {
			
		/**
			@private
		*/
		kind: null,
		
		/**
			@private
		*/
		options: {},
		
		/**
			@private
		*/
		constructor: function (instance, props) {
			
			// apply any of the properties to ourself for reference
			enyo.mixin(this, [relationDefaults, this.options, props]);
			
			// store a reference to the model we're relating
			this.instance = instance;
			
			// ensure we have a constructor for our related model kind
			this.model = enyo.constructorForKind(this.model);
			
            this.includeInJSON = !props.includeInJSON && !this.isOwner? (this.model.prototype.primaryKey || 'id'): this.includeInJSON;
			
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
			var inst = this.instance,
				key = this.key,
				was = this.related,
				changed = inst.changed || (inst.changed = {}),
				prev = inst.previous || (inst.previous = {});
			
			changed[key] = this.related = related;
			prev[key] = was;
			if (was !== related) {
				inst.notify(key, was, related);
				inst.emit('change', changed);
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
	
	/**
		@private
		@static
	*/
	Relation.concat = function (ctor, props) {
		var proto = ctor.prototype;
		if (props.options) {
			proto.options = enyo.mixin({}, [proto.options, props.options]);
			delete props.options;
		}
	};
	
	/**
		@public
		@class enyo.toMany
		@extends Relation
	*/
	kind(
		/** @lends enyo.toMany.prototype */ {
		
		/**
			@private
		*/
		name: 'enyo.toMany',
		
		/**
			@private
		*/
		kind: Relation,
		
		/**
			@private
		*/
		noDefer: true,
		
		/**
			@public
		*/
		options: {
			
			/**
			*/
			isOwner: false,
			
			/**
			*/
			collection: RelationalCollection,
			
			/**
			*/
			collectionOptions: {}
		},
		
		/**
			@private
			@method
		*/
		init: function () {
			
			var collection = this.collection,
				model = this.model,
				collectionOpts = this.collectionOptions ? enyo.clone(this.collectionOptions) : {},
				inst = this.instance,
				key = this.key,
				related = this.related != null ? this.related : inst.attributes[key];
			
			if (typeof collection == 'string') collection = enyo.constructorForKind(collection);
			if (typeof model == 'string') model = enyo.constructorForKind(model);
			
			// since we allow the model property to be used for the collection constructor
			// we need to check for and use it if we find it
			if (model.prototype instanceof Collection) {
				collection = model;
				model = collection.prototype.model;
			}
			
			// in case we couldn't find one
			if (!model) model = collection.prototype.model;
			else collectionOpts.model = collectionOpts.model || model;
			
			// now ensure that what we found we store for reuse
			this.collection = collection instanceof Collection ? collection.ctor : collection;
			this.model = model;
			
			// ensure we've applied the requested properties to the collection
			if (collection instanceof Collection) enyo.mixin(collection, collectionOpts);
			else collection = new collection(collectionOpts);
			
			// ensure we have the correct parse value
			this.parse = this.parse || model.prototype.options.parse;
			
			// create means we assume all data fetching will be done arbitrarily and we will not
			// be fetching separately from the owner
			if (this.create) {
				if (related != null) {
					if (this.parse) related = collection.parse(related);
					// we can avoid subsequent exists call because it needs to be an object
					collection.add(related);
				}
			} else {
				
				// if the fetch flag is truthy we will execute the (assumably) asynchronous
				// request now ensuring we pass in any options that might have been available
				if (this.fetch) this.fetchRelated();
			}
			
			inst.attributes[key] = this;
			
			// ensure we store our related collection now
			this.related = collection;
			
			// we need to detect these changes to propagate them onward
			collection.on('*', this.onChange, this);
		
			// special overload of store allows us to more narrowly listen to particular events
			// for associated kinds
			
			// @note We only register for this if we have an inverseKey otherwise we have no
			// way of knowing the reverse relationship
			if (this.inverseKey) enyo.store.on(model, 'add', this.onChange, this);
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
			var ctor = this.model,
				related = this.related,
				inverseKey = this.inverseKey;
			
			if (inverseKey) {
				found = enyo.store.findLocal(ctor, this.checkRelation, {context: this});
				// we shouldn't need to update any records already present so we'll ignore
				// duplicates for efficiency
				if (found.length) related.add(found, {merge: false});
			}
		},
		
		/**
			@public
			@method
		*/
		checkRelation: function (model) {
			var ctor = this.model,
				inst = this.instance,
				key = this.key,
				inverseKey = this.inverseKey,
				related = inverseKey && model.get(inverseKey),
				rev = model.getRelation(inverseKey),
				id = inst.get(inst.primaryKey),
				isOwner = this.isOwner;
				
			if (related != null && (related === inst || related == id)) {
				
				// if the relation isn't found it probably wasn't defined and we need
				// to automatically generate it based on what we know
				if (!rev && inverseKey) {
					rev = new enyo.toOne(model, {
						key: inverseKey,
						inverseKey: key,
						parse: false,
						create: false,
						isOwner: !isOwner,
						model: ctor,
						related: inst
					});
					
					model.relations.push(rev);
				}
				
				if (rev.related !== inst) rev.setRelated(inst);
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
			else if (typeof iJson == 'string') raw = this.related.map(function (model) {
				return model.get(iJson);
			});
			else if (iJson instanceof Array) raw = this.related.map(function (model) {
				return enyo.only(iJson, model.raw());
			});
			else if (typeof iJson == 'function') raw = iJson.call(this.instance, this.key, this);
			return raw;
		},
		
		/**
			@private
			@method
		*/
		onChange: function (sender, e, props) {
			// console.log('enyo.toMany.onChange: ', arguments);
			
			var inst = this.instance
				, key = this.key
				, related = this.related
				, changed;
			
			if (sender === store) {
				if (e == 'add') {
					if (this.checkRelation(props.model)) this.related.add(props.model, {merge: false});
				}
			}
		},
		
		/**
			@private
			@method
		*/
		destroy: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				
				// @TODO: !!!
			};
		})
	});
	
	enyo.toMany.concat = function (ctor, props) {
		var proto = ctor.prototype;
		if (props.collectionOptions) {
			proto.collectionOptions = enyo.mixin({}, [proto.collectionOptions, props.collectionOptions]);
			delete props.collectionOptions;
		}
	}
	
	/**
		@public
		@class enyo.manyToMany
	*/
	kind(
		/** @lends enyo.manyToMany.prototype */ {
		name: 'enyo.manyToMany',
		kind: enyo.toMany,
		noDefer: true,
		
		options: {
			inverseType: 'enyo.manyToMany',
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
		
		onChange: enyo.inherit(function (sup) {
			return function (sender, e, props) {
				var related = this.related
					, inst = this.instance
					, inverseKey = this.inverseKey
					, key = this.key
					, changed, previous;
				
				if (sender === related && !this.isChanging) {
				
					this.isChanging = true;
				
					if (e == 'change') {
						if (this.checkRelation(props.model)) related.add(props.model);
						else related.remove(props.model);
					} else if (inverseKey && (e == 'add' || e == 'remove')) {
						
						props.models.forEach(function (model) {
							model.get(inverseKey)[e](inst);
						});
					}
					
					changed = inst.changed || (inst.changed = {});
					previous = inst.previuos || (inst.previous = {});
					changed[key] = previous[key] = related;
					inst.emit('change', changed);
				
					this.isChanging = false;
				}
				
				// console.log(inst.euid, key, 'onChange', sender === related? 'related': 'store', e, props);
				// console.log(related.euid, key, e, props.model.changed);

				else sup.apply(this, arguments);
			};
		})
	});
	
	/**
		@public
		@class enyo.toOne
		@extends Relation
	*/
	kind(
		/** @lends enyo.toOne.prototype */ {
			
		/**
			@private
		*/
		name: 'enyo.toOne',
		
		/**
			@private
		*/
		kind: Relation,
		
		/**
			@private
		*/
		noDefer: true,
		
		/**
			@public
		*/
		options: {
			inverseType: 'enyo.toOne'
		},
		
		/**
			@private
		*/
		init: function () {
			
			var model = this.model,
				inverseType = this.inverseType,
				inst = this.instance,
				key = this.key,
				isOwner = this.isOwner,
				related = this.related == null ? inst.attributes[key] : this.related,
				id,
				found;
			
			// ensure we have a valid model constructor
			if (typeof model == 'string') model = enyo.constructorForKind(model);
			
			// ensure our inverse type constructor is correct
			if (typeof inverseType == 'string') inverseType = enyo.constructorForKind(inverseType);
			
			// ensure we've got the correct related if any
			if (related) this.related = related;
			
			// the instance attribute for the designated key will actually point to this relation
			inst.attributes[key] = this;
			
			// if we have a related value now check to see if it is something we should attempt
			// to resolve
			if (related != null) {
				
				// just make sure that no one stuck an instance in here
				if (!(related instanceof Model)) {
				
					// try and figure out what the assumed id for the related model is if possible
					if (typeof related == 'object') id = related[model.prototype.primaryKey];
					else if (typeof related == 'string' || typeof related == 'number') id = related;
					
					found = enyo.store.resolve(id);
					if (found) related = this.related = found;
				}
			}
			
			if (isOwner) {
				
				// if this is the owner side of the relation we may need to create the instance
				// for our relation if it wasn't found already
				if (!related || !(related instanceof Model)) {
					if (this.create) {
						// we create the empty instance so we can separately deal with the
						// various ways the related data could be handed to us (could be id or data)
						model = new model(null, null, this.modelOptions);
						// might need to parse the related data
						if (this.parse && related != null) related = model.parse(related);
						// related should be a value now if we're going to set anything
						if (related) {
							if (typeof related == 'object') model.set(related);
							else model.set(model.primaryKey, related);
						}
					
						this.related = model;
						model = this.model;
					} else enyo.store.on(model, 'add', this.onChange, this);
				}
			}
			
			// last but not least we begin to listen for changes on our model instance
			inst.on('change', this.onChange, this);
		},
		
		/**
			@public
			@method
		*/
		setRelated: enyo.inherit(function (sup) {
			return function (related) {
				var val;
				
				if (related && related instanceof Model) {
					return sup.apply(this, arguments);
				} else if (related != null) {
					val = related;
					related = this.getRelated();
					
					// the only thing we can do is assume the value is intended to be the primary
					// key of the model just like we would had it been passed into the constructor
					if (this.create && related) related.set(related.primaryKey, val);
					// otherwise we allow it to be set and try and find the model from this new
					// criterion but we don't do all the notifications for it as code expecting
					// an instance may be disappointed (e.g. break, die, suicide, self-destruct...)
					else {
						this.related = related;
						related = this.findRelated();
						// if it was found by this new value somehow we allow the original
						// set to take place so it will notify everyone
						if (related && related instanceof Model) return sup.call(this, related);
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
		findRelated: function () {
			
			var related = this.related,
				inst = this.instance,
				isOwner = this.isOwner,
				found,
				rev;
				
			if (related && related instanceof this.model) found = related;
			else {
				
				// we need to search for the related instance if we can
				found = enyo.store.findLocal(
					this.model,
					this.checkRelation,
					{all: false, context: this}
				);
			}
			
			if (found) {
				
				// if we are the owner end we may have a listener on the store and can
				// safely remove it
				if (isOwner) enyo.store.off(this.model, 'add', this.onChange, this);
				
				// update our related value
				this.related = found;
				
				// if we can/need to we will establish the other end of this relationship
				if (this.inverseKey) {
					rev = found.getRelation(this.inverseKey);
					
					// if there isn't one then we go ahead and create it implicitly
					if (!rev) {
						rev = new this.inverseType(found, {
							isOwner: !isOwner,
							key: this.inverseKey,
							parse: false,
							create: false,
							model: this.instance.ctor,
							related: this.instance
						});
						
						found.relations.push(rev);
					}
					
					// now we ensure that the instances are pointing at eachother
					switch (rev.kindName) {
					case 'enyo.toOne':
						if (rev.related !== this.instance) rev.setRelated(this.instance);
						break;
					case 'enyo.toMany':
						rev.related.add(this.instance, {merge: false});
						break;
					}
				}
				
				if (isOwner) found.on('change', this.onChange, this);
			}
			
			return found;
		},
		
		/**
			@private
			@method
		*/
		checkRelation: function (model) {
			var related = this.related,
				inst = this.instance,
				id = inst.get(inst.primaryKey),
				inverseKey = this.inverseKey,
				pkey = model.get(model.primaryKey);
			
			return (related && (
					model.euid == related ||
					pkey == related ||
					pkey == related[inst.primaryKey]
				) || (id !== null && model.get(inverseKey) == id)
			);
		},
		
		/**
			@private
			@method
		*/
		raw: function () {
			var iJson = this.includeInJSON,
				raw = '';
			if (this.related) {
				if (iJson === true) raw = this.related.raw();
				else if (typeof iJson == 'string') raw = this.related.get(iJson);
				else if (iJson instanceof Array) raw = enyo.only(iJson, this.related.raw());
				else if (typeof iJson == 'function') raw = iJson.call(this.instance, this.key, this);
			}
			return raw;
		},
		
		/**
			@private
			@method
		*/
		onChange: function (sender, e, props) {
			var key = this.key,
				inst = this.instance,
				isOwner = this.isOwner,
				changed;
			
			if (sender === this.instance) {
				if (e == 'change') {
					if (key in props) this.findRelated();
				}
			} else if (sender === this.related) {
				if (e == 'change' && isOwner) {
					// @todo This must be updated to be more thorough...
					inst.isDirty = true;
					changed = inst.changed || (inst.changed = {});
					inst.previous || (inst.previous = {});
					changed[key] = props;
					inst.emit('change', changed, inst);
				}
			}
		}
	});

	/**
		@public
		@class enyo.RelationalModel
	*/
	kind({
		name: 'enyo.RelationalModel',
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
		get: enyo.inherit(function (sup) {
			return function (path) {
				path || (path = '');
				
				var prop = path
					, rel, parts;
				
				if (path.indexOf('.') >= 0) {
					parts = path.split('.');
					prop = parts.shift();
				}
				
				rel = this.isRelation(prop);
				
				return !rel? sup.apply(this, arguments):
					parts? rel.getRelated().get(parts.join('.')):
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
				
				if (typeof path == 'object') {
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
					
					if (key.indexOf('.') > 0) {
						parts = key.split('.');
						key = parts.shift();
					}
					
					curr = attrs[key];
					if (curr && curr instanceof Relation) {
						if(parts) curr.getRelated().set(parts.join('.'), value, opts);
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
				
					if (!silent && !this.isSilenced()) this.emit('change', changed, this);
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
				, cpy = inc? enyo.only(inc, attrs): enyo.clone(attrs);
				
			keys.forEach(function (key) {
				var rel = this.isRelation(key)
					, ent = rel? rel.getRelated(): this.get(key);
				if (!rel) {
					if (typeof ent == 'function') ent.call(this);
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
		constructor: enyo.inherit(function (sup) {
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
		destroy: enyo.inherit(function (sup) {
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
				relation.type = typeof type == 'string'? enyo.constructorForKind(enyo[type] || type): enyo.toOne;
			}
		});
		
		// remove this property so it will not be slammed on top of the root property
		delete props.relations
		// apply our modified relations array to the prototype
		proto.relations = rels;
	};

})(enyo, this);