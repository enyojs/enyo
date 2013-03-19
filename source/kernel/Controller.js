//*@public
/**
    The base class for all controllers in enyo. The _enyo.Controller_
    is a delegate/component that is designed to be a proxy of information.
    This is an abstract class.
*/
enyo.kind({
    
    // ...........................
    // PUBLIC PROPERTIES
    
    //*@public
    name: "enyo.Controller",
    
    //*@public
    kind: "enyo.Component",
    
    
    //*@protected
    mixins: [
        "enyo.MultipleDispatchSupport"
    ],
    
    //*@public
    /**
        For all _enyo.Controller_s and subkinds the default source of information
        is the _data_ property. In some cases this is a computed property for
        easier overloading. Can be any type of data.
    */
    data: null,
    
    // ...........................
    // PROTECTED PROPERTIES
    
    //*@protected
    _is_controller: true
    
    // ...........................
    // COMPUTED PROPERTIES
    
    // ...........................
    // PUBLIC METHODS
    
    // ...........................
    // PROTECTED METHODS
    
    // ...........................
    // OBSERVERS

});
