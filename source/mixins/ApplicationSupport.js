//*@public
/**
*/
enyo.createMixin({
    
    // ...........................
    // PUBLIC PROPERTIES
    
    //*@public
    name: "enyo.ApplicationSupport",
    
    //*@public
    app: null,
    
    // ...........................
    // PROTECTED PROPERTIES
    
    //*@protected
    _supports_applications: true,
    
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
    }
    
    // ...........................
    // OBSERVERS

});
