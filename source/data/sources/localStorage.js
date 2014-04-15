(function (enyo, localStorage) {
	
	if (localStorage) {
		var kind = enyo.kind
			, json = enyo.json
			, inherit = enyo.inherit
			, constructorForKind = enyo.constructorForKind
			, uuid = enyo.uuid;
	
		var Source = enyo.Source
			, Collection = enyo.Collection
			, Model = enyo.Model;
			
		var CODES = {
			UNIQUE_URL: "A Collection must have a unique url property when using localStorage",
			UNIQUE_PRIMARY_KEY: "A Model must have a unqiue primaryKey to be able to fetch it from localStorage"
		};
	
		/**
			@public
			@class enyo.LocalStorageSource
		*/
		var LocalStorageSource = kind(
			/** @lends enyo.LocalStorageSource.prototype */ {
			name: "enyo.LocalStorageSource",
			kind: Source,
			noDefer: true,
			
			/**
				@public
			*/
			prefix: "enyo-app",
			
			/**
				@private
			*/
			storage: function () {
				return this._storage || (this._storage = (function (source) {
					// try and acquire any previously stored uuids
					var storage = localStorage.getItem(source.prefix);
					
					// if there was anything in the store we turn it into an array temporarily
					if (typeof storage == "string") storage = storage.split(",");
					if (storage) storage = source.unpack(storage);
				
					return storage || {uuids: [], collections: {}, models: {}};
				})(this));
			},
		
			/**
				@public
				@method
			*/
			fetch: function (model, opts) {
				var storage = this.storage(), id, res;
				
				if (model instanceof Collection) {
					if (!(id = model.url)) throw new Error(CODES.UNIQUE_URL);
					res = storage.collections[id];
					
					// now we need to dereference these id's but note that even if these belonged to multiple
					// collections or have already been loaded into the store they should be found and merged
					// unless otherwise directed so this is safe
					if (res) res = res.map(function (id) {
						return storage.models[id];
					});
				}
				
				else if (model instanceof Model) {
					if (!(id = model.attributes[models.primaryKey])) throw new Error(CODES.UNIQUE_PRIMARY_KEY);
						
					res = storage.models[id];
				}
				
				// @TODO: For now it is assumed that there will never be a valid
				// "error" to call when using local storage?
				opts.success(res);
			},
		
			/**
				@public
				@method
			*/
			commit: function (model, opts) {
				var storage = this.storage(), id;
				
				if (model instanceof Collection) {
					if (!(id = model.url)) throw new Error(CODES.UNIQUE_URL);
					storage.collections[id] = model.map(function (model) {
						// @TODO: Currently it seems that in this arbitrary assignment case there is no need
						// to require a change notification from the model...that may not be true however...
						// var pkey = model.primaryKey
						// 	, ln = {};
						// ln[pkey] = model.attributes[pkey] || (model.attributes[pkey] = uuid());
						// return ln;
						return model.attributes[model.primaryKey] || (model.attributes[model.primaryKey] = uuid());
					});
				}
				
				else if (model instanceof Model) {
					// we automatically assign a uuid here to ensure that it will be commited in a trackable way
					if (!(id = model.attributes[model.primaryKey])) id = (model.attributes[model.primaryKey] = uuid());
					
					storage.models[id] = model.raw();
				}
				
				if (storage.uuids.indexOf(id) === -1) storage.uuids.push(id);
				
				this.save(id);
				opts.success();
			},
		
			/**
				@public
				@method
			*/
			destroy: function (model, opts) {
				var storage = this.storage(), id, idx;
				
				if (model instanceof Collection) {
					if (!(id = model.url)) throw new Error(CODES.UNIQUE_URL);
					delete storage.collections[id];
				}
				
				else if (model instanceof Model) {
					if (!(id = model.attributes[model.primaryKey])) throw new Error(CODES.UNIQUE_PRIMARY_KEY);
					delete storage.models[id];
				}
				
				idx = storage.uuids.indexOf(id);
				idx > -1 && storage.uuids.splice(idx, 1);
				
				this.save(id);
				opts.success();
			},
		
			/**
				@public
				@method
			*/
			find: function (ctor, opts) {
			
			},
			
			/**
				@public
			*/
			save: function (uuid) {
				var storage = this.storage()
					, prefix = this.prefix;
					
				var fn = function (uuid) {
					var key = (prefix + "-" + uuid)
						, model = storage.models[uuid]
						, collection = storage.collections[uuid];
					if (model || collection) localStorage.setItem(key, json.stringify({model: !! model, collection: !! collection, data: model || collection}));
					else localStorage.removeItem(key);
				};
				
				// if a uuid is provided we only have to save a subset of the whole
				if (uuid) fn(uuid);
				
				
				else {
					["collections", "models"].forEach(function (key) {
						Object.keys(storage[key]).forEach(fn);
					});
				}
				
				// we always update the overall array to ensure it is up-to-date
				localStorage.setItem(prefix, storage.uuids.join(","));
			},
			
			/**
				@public
			*/
			unpack: function (uuids) {
				var prefix = this.prefix
					, collections = {}
					, models = {}
					, storage = {uuids: uuids, models: models, collections: collections};
					
				uuids.forEach(function (uuid) {
					var key = (prefix + "-" + uuid)
						, ln = localStorage.getItem(key);
					
					if (ln && typeof ln == "string") {
						ln = json.parse(ln);
						
						if (ln.collection) collections[uuid] = ln.data;
						else if (ln.model) models[uuid] = ln.data;
					}
				});
				
				return storage;
			}
		});
	
		// new LocalStorageSource();
	}
	
})(enyo, localStorage);