(function () {
    
    //*@public
    /**
        The Array controller is a proxy for array-like content. It
        has a normalized API for array functionality with the exception
        of the `[` and `]` operators (limitation of the language). Use
        of this kind allows one to have an array of data but also bind
        and observe as a normal _enyo.kind_ is also able to be abstracted
        further.
        
        Events are emitted for any add/remove actions. The events are
        _didadd_ for the _push_ and _unshift_ operations and _didremove_
        for the _pop_ and _shift_ operations.
        
        TODO: There are currently many methods missing in this partial
        implementation.
    */
    enyo.kind({
       //*@public
       name: "enyo.ArrayController",
       kind: "enyo.Controller",
       published: {
           length: 0,
           data: null
       },
       //*@protected
       create: function () {
           this.inherited(arguments);
           this.data = [];
       },
       //*@public
       push: function (value) {
           var ret = this.data.push(value);
           this.update();
           this.bubble("didadd", {value: value});
           return ret;
       },
       pop: function () {
           var ret = this.data.pop();
           this.update();
           this.bubble("didremove", {value: ret});
           return ret;
       },
       shift: function () {
           var ret = this.data.shift();
           this.update();
           this.bubble("didremove", {value: ret});
           return ret;
       },
       unshift: function (value) {
           var ret = this.data.unshift(value);
           this.update();
           this.bubble("didadd", {value: value});
           return ret;
       },
       at: function (index) {
           var ret = this.data[index];
           return ret;
       },
       /**
           Attempt to find a particular entry based on the method
           passed in as _fn_. The callback will be executed under
           the context of the _enyo.ArrayController_ unless a context
           is specified as the optional second parameter. If it
           successfully matches a result of the callback to Boolean true
           it will return a hash with a _value_ and _index_ property
           where _value_ is the actual result and _index_ is the index
           of the value in the array. If no result is found it will
           return false.
       */
       find: function (fn, context) {
           var i = 0, len = this.length, val, ctx = context || this;
           for (; i < len; ++i) {
               val = this.at(i);
               if (fn.call(ctx, val) === true) return {value: val, index: i};
           }
           return false;
       },
       //*@protected
       update: function () {
           if (this.length !== this.data.length) this.set("length", this.data.length);
       }
    });
    
}());