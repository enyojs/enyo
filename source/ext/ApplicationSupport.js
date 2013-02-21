//*@public
/**
*/
enyo.kind({
    
    // ...........................
    // PUBLIC PROPERTIES
    
    //*@public
    name: "enyo.ApplicationSupport",
    
    //*@public
    kind: "enyo.Mixin",
    
    //*@public
    app: null,
    
    // ...........................
    // PROTECTED PROPERTIES
    
    // ...........................
    // COMPUTED PROPERTIES
    
    // ...........................
    // PUBLIC METHODS
    
    // ...........................
    // PROTECTED METHODS
    
    //*@protected
    adjustComponentProps: function (props) {
        props.app = this.app;
        this.inherited(arguments, props);
    },
    
    //*@protected
    destroy: function () {
        delete this.app;
        this.inherited(arguments);
    }
    
    // ...........................
    // OBSERVERS

});
