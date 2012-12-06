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
           this.update();
           return ret;
       },
       //*@protected
       update: function () {
           if (this.length !== this.data.length) this.set("length", this.data.length);
       }
    });
    
}());