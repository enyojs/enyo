(function (enyo) {
	
	/**
		
	*/
	function ModelList () {
		Array.call(this);
		
		this.table = {};
	}
	
	ModelList.prototype = new Array();
	
	enyo.ModelList = ModelList;
		
	enyo.ModelList.prototype.add = function (models, idx) {
		if (models && !(models instanceof Array)) models = [models];
		
		var table = this.table
			, added = []
			, model, i, id, euid;
		
		for (i=0; (model = models[i]); ++i) {
			euid = model.euid;
			
			// we only want to actually add models we haven't already seen...
			if (!table[euid]) {
				id = model.get(model.primaryKey);
			
				if (id !== null && id !== undefined) {
				
					// @TODO: For now if we already have an entry for a model by its supposed unique
					// identifier but it isn't the instance we just found we can't just overwrite the
					// previous instance so we mark the new one as headless
					if (table[id] && table[id] !== model) model.headless = true;
					// otherwise we do the normal thing and add the entry for it
					else table[id] = model; 
				}
			
				// nomatter what though the euid should be unique
				table[euid] = model;
				added.push(model);
			}
		}
		
		idx = !isNaN(idx)? Math.min(Math.max(0, idx), this.length): 0;
		added.unshift(0);
		added.unshift(idx);
		this.splice.apply(this, added);
		
		// @NOTE: Must note that this potentially returns the mutable array passed into the function
		// and must clearly be documented -- this is an internal function primarily and will make no
		// guarantees to the safety of modifying the returned content consider it read-only
		return (added.length - 2 > models.length? added.slice(2): models);
	};
		
	enyo.ModelList.prototype.remove = function (models) {
		if (models && !(models instanceof Array)) models = [models];
		
		var table = this.table
			, model, i, id, idx, removed;
		
		for (i=0; (model = models[i]); ++i) {
			table[model.euid] = null;
			id = model.get(model.primaryKey);
			
			if (id !== null && id !== undefined) table[id] = null;
			
			idx = this.indexOf(model);
			if (idx > -1) {
				this.splice(idx, 1);
				(removed || (removed = [])).push(model);
			}
		}
		
		return removed;
	};
		
	enyo.ModelList.prototype.has = function (model) {
		if (model === undefined || model === null) return false;
		
		if (typeof model == 'string' || typeof model == 'number') {
			return !! this.table[model];
		} else return this.indexOf(model) > -1;
	};
	
	enyo.ModelList.prototype.resolve = function (model) {
		if (typeof model == 'string' || typeof model == 'number') {
			return this.table[model];
		} else return model;
	};
		
	// var kind = enyo.kind
	// 	, clone = enyo.clone
	// 	, mixin = enyo.mixin;
	// 	
	// var Model = enyo.Model
	// 	, ObserverSupport = enyo.ObserverSupport;
	// 	
	// /**
	// 	@public
	// 	@class enyo.ModelList
	// */
	// kind(
	// 	/** @lends enyo.ModelList.prototype */ {
	// 	name: "enyo.ModelList",
	// 	kind: null,
	// 	noDefer: true,
	// 	
	// 	/**
	// 		@private
	// 	*/
	// 	mixins: [ObserverSupport],
	// 	
	// 	/**
	// 		@private
	// 	*/
	// 	observers: [
	// 		{path: "models", method: "onModelsChange"}
	// 	],
	// 	
	// 	/**
	// 		@public
	// 	*/
	// 	length: 0,
	// 	
	// 	/**
	// 		@private
	// 	*/
	// 	get: function (prop) {
	// 		return this[prop];
	// 	},
	// 	
	// 	/**
	// 		@private
	// 	*/
	// 	set: function (prop, is, opts) {
	// 		var was = this[prop]
	// 			, silent = false;
	// 			
	// 		this[prop] = is;
	// 		if (opts) silent = opts.silent;
	// 		
	// 		if (was !== is && !silent) this.notify(prop, was, is);
	// 	},
	// 	
	// 	/**
	// 		@private
	// 		@method
	// 	*/
	// 	add: function (model, idx, opts) {
	// 		var loc = this.idTable
	// 			, models = this.models
	// 			, len = this.length
	// 			, euid, id;
	// 		
	// 		// loop through and do the work and ensure we still return the reference
	// 		if (model instanceof Array) return model.forEach(function (ln) {
	// 			this.add(ln, idx, opts) && ++idx;
	// 		}, this) || this;
	// 		
	// 		euid = model.euid;
	// 		id = model.attributes[model.primaryKey];
	// 		
	// 		// @TODO: Absolutely must come back to this as this does not seem to be the
	// 		// best solution to this issue...
	// 		if (id !== null && id !== undefined) {
	// 			if (loc[id]) model.headless = true;
	// 			else loc[id] = model;
	// 		}
	// 		
	// 		loc[euid] = model;
	// 		if (!model.headless) {
	// 			if (!isNaN(idx) && idx < len) models.splice(idx, 0, model);
	// 			else models.push(model);
	// 			// this.length = models.length;
	// 			this.set("length", models.length, opts);
	// 		}
	// 		return this;
	// 	},
	// 	
	// 	/**
	// 		@private
	// 		@method
	// 	*/
	// 	remove: function (model, opts) {
	// 		// loop through and do the work and ensure we still return the reference
	// 		if (model instanceof Array) return model.forEach(function (ln) {
	// 			this.remove(ln, opts);
	// 		}, this) || this;
	// 		
	// 		var loc = this.idTable
	// 			, models = this.models
	// 			, euid = model.euid
	// 			, id = model.attributes[model.primaryKey]
	// 			, idx = models.indexOf(model);
	// 		
	// 		loc[euid] = null;
	// 		if (!model.headless) {
	// 			if (id !== null && id !== undefined) loc[id] = null;
	// 			idx > -1 && models.splice(idx, 1);
	// 			// this.length = models.length;
	// 			this.set("length", models.length, opts);
	// 		}
	// 		return this;
	// 	},
	// 	
	// 	/**
	// 		@public
	// 		@method
	// 	*/
	// 	slice: function (from, to) {
	// 		return this.models.slice(from, to);
	// 	},
	// 	
	// 	/**
	// 		@public
	// 		@method
	// 	*/
	// 	has: function (model) {
	// 		if (model === undefined || model === null) return;
	// 		
	// 		var loc = this.idTable
	// 			, id, euid;
	// 			
	// 		if (typeof model == "object") {
	// 			id = model.attributes[model.primaryKey];
	// 			euid = model.euid;
	// 		} else {
	// 			id = euid = model;
	// 		}
	// 		
	// 		model = loc[euid] || loc[id];
	// 		
	// 		return model;
	// 	},
	// 	
	// 	/**
	// 		@public
	// 		@method
	// 	*/
	// 	contains: function (model) {
	// 		return this.has(model);
	// 	},
	// 	
	// 	/**
	// 		@public
	// 		@method
	// 	*/
	// 	indexOf: function (model, offset) {
	// 		return this.models.indexOf(model, offset);
	// 	},
	// 	
	// 	/**
	// 		@public
	// 		@method
	// 	*/
	// 	at: function (idx) {
	// 		return this.models[idx];
	// 	},
	// 	
	// 	/**
	// 		@public
	// 		@method
	// 	*/
	// 	forEach: function (fn, ctx) {
	// 		return this.models.slice().forEach(fn, ctx || this);
	// 	},
	// 	
	// 	/**
	// 		@public
	// 		@method
	// 	*/
	// 	map: function (fn, ctx) {
	// 		return this.models.slice().map(fn, ctx || this);
	// 	},
	// 	
	// 	/**
	// 		@public
	// 		@method
	// 	*/
	// 	filter: function (fn, ctx) {
	// 		return this.models.slice().filter(fn, ctx || this);
	// 	},
	// 	
	// 	/**
	// 		@public
	// 		@method
	// 	*/
	// 	find: function (fn, ctx) {
	// 		return this.models.slice().find(fn, ctx || this);
	// 	},
	// 	
	// 	/**
	// 		@public
	// 		@method
	// 	*/
	// 	findIndex: function (fn, ctx) {
	// 		return this.models.slice().findIndex(fn, ctx || this);
	// 	},
	// 	
	// 	/**
	// 		@public
	// 		@method
	// 	*/
	// 	where: function (fn, ctx) {
	// 		return this.models.slice().find(fn, ctx || this);
	// 	},
	// 	
	// 	/**
	// 		@public
	// 		@method
	// 	*/
	// 	sort: function (fn) {
	// 		this.models.sort(fn);
	// 		return this.slice();
	// 	},
	// 	
	// 	/**
	// 		@public
	// 		@method
	// 	*/
	// 	clone: function () {
	// 		var cpy = new this.ctor();
	// 		cpy.idTable = clone(this.idTable);
	// 		cpy.models = this.models.slice();
	// 		cpy.length = this.length;
	// 		return cpy;
	// 	},
	// 	
	// 	/**
	// 		@private
	// 		@method
	// 	*/
	// 	constructor: function (props) {
	// 		props && mixin(this, props);
	// 		this.idTable = this.idTable || {};
	// 		this.models = this.models || [];
	// 		this.length = this.models.length;
	// 		
	// 		// if we were constructed from existing data we need to ensure we
	// 		// have an udpated table
	// 		if (this.length && !props.idTable) this.index();
	// 	},
	// 	
	// 	/**
	// 		@private
	// 	*/
	// 	index: function () {
	// 		var models = this.models
	// 			, loc = this.idTable
	// 			, model, euid, id;
	// 		
	// 		for (var i=0, len=models.length; i<len; ++i) {
	// 			model = models[i];
	// 			euid = model.euid;
	// 			id = model.attributes[model.primaryKey];
	// 			
	// 			loc[euid] = model;
	// 			id !== null && id !== undefined && (loc[id] = model);
	// 		}
	// 	},
	// 	
	// 	/**
	// 		@private
	// 		@method
	// 	*/
	// 	destroy: function () {
	// 		this.idTable = null;
	// 		this.models = null;
	// 	},
	// 	
	// 	/**
	// 		@private
	// 	*/
	// 	onModelsChange: function () {
	// 		var models = this.models;
	// 		
	// 		this.index();
	// 		this.set("length", models.length);
	// 	}
	// 		
	// });
	
})(enyo);