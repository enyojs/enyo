//*@public
/**
    The _enyo.ArrayController_ kind is designed to mimic the behavior
    and API of an ECMAScript 5 Array object with additional functionality
    specific to _enyo.Object_s. By default the object will index its values
    so they are accessible via the bracket-accessor operators. On large datasets
    it is advised that the _store_ property is set to _true_ and only the
    _at_ accessor method is used instead. For small to medium datasets it is
    not necessary.
*/
enyo.kind({
    
    // ...........................
    // PUBLIC PROPERTIES
    
    //*@public
    name: "enyo.ArrayController",
    
    //*@public
    kind: "enyo.Controller",
    
    //*@public
    /**
        Represents the current length of the array. Setting the
        length directly will have undesirable effects.
    */
    length: 0,
   
    //*@public
    /**
        Computed property representing the array structure of the
        underlying data. This is an immutable array as changes __will
        not__ modify the array structure of this controller.
    */
    data: enyo.Computed(function (data) {
        var moded = this._modified;
        var cached = this._cached;
        var store = this._store;
        var idx = 0;
        var len = this.length;
        // if data is provided we need to update to this new
        // dataset
        if (data) {
            // use the overloadable reset data method
            this.reset(data);
        } else {
            // we can't use the cached version of our dataset so
            // we start over
            if (moded > cached || !store || len !== store.length) {
                store = this._store = [];
                for (; idx < len; ++idx) store[idx] = this[idx];
                // update our cached time
                this._cached = enyo.bench();
            }
            return store;
        }
    }, "length"),
    
    //*@public
    /**
        If the _store_ property is set to true the array controller
        will use an internal array object. For large datasets this is
        advised as it will enhance performance. It will, however, also
        require the use of the _at_ accessor method as opposed to the
        bracket index-accessor operators.
    */
    store: false,
   
    // ...........................
    // PROTECTED PROPERTIES
    
    //*@protected
    _modified: null,
    _cached: null,
    _store: null,
    _init_values: null,
    
    // ...........................
    // PUBLIC METHODS
    
    // ...........................
    // ECMAScript 5 API METHODS
    
    //*@public
    push: function (/* _values_ */) {
        var values = arguments;
        var pos = this.length;
        var num = values.length + pos;
        var idx = 0;
        var changeset = {};
        var prev = this.get("data");
        var len = this.length;
        if (num) {
            for (; pos < num; ++pos, ++idx) {
                changeset[pos] = this[pos] = values[idx];
            }
            this.length = num;
            this._modified = enyo.bench();
            this.notifyObservers("length", len, this.length);
            this.dispatchBubble("didadd", {values: changeset}, this);
            return this.length;
        }
        return 0;
    },
    
    //*@public
    pop: function () {
        if (this.length) {
            var pos = this.length - 1;
            var val = this[pos];
            var changeset = {};
            // remove the value at that position
            delete this[pos];
            // reset our length value
            this.length = pos;
            // set our changeset parameter
            changeset[pos] = val;
            // reset our modified time
            this._modified = enyo.bench();
            this.notifyObservers("length", pos + 1, pos);
            this.dispatchBubble("didremove", {values: changeset}, this);
            return val;
        }
    },
    
    //*@public
    shift: function () {
        if (this.length) {
            var val = this[0];
            var idx = 1;
            var len = this.length;
            var changeset = {};
            // unfortunately we have to reindex the entire dataset
            // but even for large ones this is a generic reassignment
            // with little overhead
            for (; idx < len; ++idx) this[idx-1] = this[idx];
            // delete the reference to the previous last element
            delete this[len-1];
            // update the length
            this.length = len - 1;
            // set the changeset
            changeset[0] = val;
            // update the modified time
            this._modified = enyo.bench();
            this.notifyObservers("length", len, this.length);
            this.dispatchBubble("didremove", {values: changeset}, this);
            return val;
        }
    },
    
    //*@public
    unshift: function (/* _values_ */) {
        if (arguments.length) {
            var len = this.length;
            // intially we assign this to the last element's index
            var idx = len - 1;
            var pos = arguments.length;
            var nix = idx + pos;
            var changeset = {};
            // unfortunately, like with unshift, we have some reindexing
            // to do, but regardless of the number of elements we're
            // unshifting we can do this in a single pass but we start
            // from the end so we don't have to copy twice for every
            // element in the dataset
            for (; nix >= pos; --nix, --idx) this[nix] = this[idx];
            // now we start from the beginning since we should have just
            // enough space to add these new elements
            for (idx = 0; idx < pos; ++idx) {
                changeset[idx] = this[idx] = arguments[idx];
            }
            // update our length
            this.length = len + arguments.length;
            // update our modified time
            this._modified = enyo.bench();
            this.notifyObservers("length", len, this.length);
            this.dispatchBubble("didadd", {values: changeset}, this);
            return this.length;
        }
    },
    
    //*@public
    indexOf: function (value, pos) {
        return enyo.indexOf(value, this.get("data"), pos);
    },
    
    //*@public
    lastIndexOf: function (value, pos) {
        return enyo.lastIndexOf(value, this.get("data"), pos);
    },
    
    //*@public
    splice: function (index, many /* _values_ */) {
        var elements = enyo.toArray(arguments).slice(2);
        var elen = elements.length;
        var len = this.length;
        var ret = [];
        var changeset = {added: {}, removed: {}, changed: {}};
        var pos = 0;
        var idx;
        var count;
        var val;
        var diff;
        var num;
        // make sure index is within our valid bounds
        index = index < 0? 0: index >= len? len: index;
        // make sure many is an actual number to use
        many = many && !isNaN(many) && many + index < len? many: 0;
        // if we have to remove any elements we need to keep the values
        // in the return array but also in the removed changeset
        if (many) {
            for (idx = index, count = index + many; idx < count; ++idx, ++pos) {
                // first we grab the value for convenience
                val = this[idx];
                // we need to make sure it is in the return array and the changeset
                changeset.changed[idx] = changeset.removed[idx] = ret[pos] = val;
                // remove the reference
                delete this[idx];
            }
        }
        // now we need to figure out if we need to add elements back in
        if (elen) {
            // if the count of new elements is greater than the number of removed
            // elements then we need to reindex the remaining elements to the end
            // of the new elements before adding them
            if (elen > many) {
                diff = elen - many;
                pos = len - 1;
                //for (; pos < len; ++pos) this[pos + diff] = this[pos];
                for (; pos >= index; --pos) this[pos + diff] = this[pos];
                // we added more than we removed so we will not be notifying
                // of a removal
                changeset.removed = null;
                // update our length
                this.length = len + diff;
            }
            // if there were the same we don't do anything
            // now we instert the new elements
            pos = index;
            num = pos + elen;
            idx = 0;
            if (pos >= num) changeset.changed = null;
            for (; pos < num; ++pos, ++idx) {
                changeset.changed[pos] = changeset.added[pos] = this[pos] = elements[idx];
            }
        } else if (!elen || elen < many) {
            // if the number of elements to add are less than the number removed
            // the we need to reindex everything after where the elements are added
            // by shifting them up the difference
            diff = many - (elen? elen: 0);
            pos = index + diff;
            for (; pos < len; ++pos) this[pos - diff] = this[pos];
            for (pos = len - diff; pos < len; ++pos) delete this[pos];
            changeset.added = null;
            // update our length
            this.length = len - diff;
        }
        // update our last modified time
        this._modified = enyo.bench();
        // this is an arbitrary ordering
        if (changeset.changed) {
            this.dispatchBubble("didchange", {values: changeset.changed}, this);
        }
        if (changeset.added) {
            this.dispatchBubble("didadd", {values: changeset.added}, this);
        }
        if (changeset.removed) {
            this.dispatchBubble("didremove", {values: changeset.removed}, this);
        }
        return ret;
    },
    
    join: function (by) {
        var data = this.get("data");
        return data.join(by || "");
    },
    
    map: function () {
        
    },
    
    filter: function (fn, data) {
        return enyo.filter(data || this.get("data"), fn);
    },
    
    // ...........................
    // CUSTOM MUTATORS
    
    //*@public
    add: function (value, at) {
        var value = value.length? value: [value];
        var len = this.length;
        var idx = at && !isNaN(at) && at >= 0 && at < len? at: len;
        var args = [idx, 0].concat(value);
        this.splice.apply(this, args);
    },
    
    //*@public
    remove: function (value, index) {
        if (value instanceof Array) {
            var removed = {};
            var index;
            this.silence();
            removed.multiple = true;
            removed.value = {};
            for (var idx = 0, len = value.length; idx < len; ++idx) {
                index = this.indexOf(value[idx]);
                removed.value[index] = value[idx];
                this.remove(value[idx]);
            }
            
            this.unsilence();
            this.dispatchBubble("didremove", removed, this);
            return;
        }
        
        var idx = index || this.indexOf(value);
        if (!!~idx) {
            this.splice(idx, 1);
        }
    },
    
    //*@public
    reset: function () {
        
    },
    
    swap: function (index, to) {
        var data = this.get("data");
        var val1 = data[index];
        var val2 = data[to];
        data[index] = val2;
        data[to] = val1;
        this.silence();
        this.set("data", data);
        this.unsilence();
        this.dispatchBubble("didswap", {from: index, to: to}, this);
    },
    
    move: function (index, to) {
        this.silence();
        var value;
        var max = this.get("length")-1;
        if (max < index) index = max;
        if (0 > index) index = 0;
        if (max < to) to = max;
        if (0 > to) to = 0;
        
        value = this.at(index);
        
        if (max === index) this.pop();
        else this.splice(index, 1);
        if (0 === to) this.unshift(value);
        else this.splice(to, 0, value);
        
        this.unsilence();
        this.dispatchBubble("didmove", {from: index, to: to}, this);
    },
    
    
    //*@public
    contains: function (value) {
        return !!~enyo.indexOf(this.get("data"), value)? true: false;
    },

    //*@public
    at: function (index) {
        return this.get("data")[index];
    },
    
    // ...........................
    // ECMAScript
    

    //*@public
    /**
        Detects the presence of value in the array. Accepts an iterator
        and an optional context for that iterator to be called under. Will
        break and return if the iterator returns a truthy value otherwise
        it will return false. On truthy value it returns the value.
    */
    find: function (fn, context) {
        var idx = 0;
        var len = this.length;
        var val;
        for (; idx < len; ++idx) {
            val = this.at(idx);
            if (fn.call(context || this, val)) return val;
        }
        return false;
    },
    
    // ...........................
    // PROTECTED METHODS
     
    //*@protected
    create: function () {
        // if the store property is true this controller will apply
        // a special mixin that replaces its default methods with those
        // designed to work with an underlying array structure
        if (true === this.store) ;
        else {
            // initialize the cached and modified times
            this._cached = this._modified = enyo.bench();
            // initialize the internal store array
            this._store = [];
        }
        this.inherited(arguments);
        // if there were values waiting to be initialized they couldn't
        // have been until now
        if (this._init_values) {
            this.push.apply(this, this._init_values);
            this._init_values = null;
        }
    },
    
    //*@protected
    constructor: function () {
        this.inherited(arguments);
        // if there were any properties passed to the constructor we
        // automatically add them to the array
        if (arguments.length) {
            var init = [];
            var idx = 0;
            var len = arguments.length;
            for (; idx < len; ++idx) {
                if (arguments[idx] instanceof Array) init = init.concat(arguments[idx]);
                else init.push(arguments[idx]);
            }
            this._init_values = init;
        }
    },
    
    //*@protected
    comparator: function (left, right) {

    },

    // ...........................
    // OBSERVERS METHODS
    
    //*@protected
    update: enyo.Observer(function () {
        this.set("length", this.get("data").length);
    }, "data")

});
