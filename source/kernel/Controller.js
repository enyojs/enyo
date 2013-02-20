//*@public
/**
    The base class for all controllers in enyo. The _enyo.Controller_
    is a delegate/component that is designed to be a proxy of information.
    Rarely will it be necessary or useful to use this base-kind of controller
    and far more likely to need _enyo.ArrayController_ or subclasses.
*/
enyo.kind({
    
    // ...........................
    // PUBLIC PROPERTIES
    
    //*@public
    name: "enyo.Controller",
    
    //*@public
    kind: "enyo.Component",
    
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
    mixins: ["enyo.MultipleDispatchSupport"],

    //*@protected
    /**
        Typically controllers don't wish to bubble (component-owned controllers)
        but controllers with multiple event targets might.
    */
    _controller_bubble_target: null,
    
    // ...........................
    // COMPUTED PROPERTIES
    
    //*@public
    /**
        The preferred retreival mechanism for the _bubbleTargeT_ for
        events.
    */
    bubbleTarget: enyo.Computed(function () {
        return this.get("_controller_bubble_target");
    }, "_controller_bubble_target", {cached: true}),
    
    // ...........................
    // PUBLIC METHODS
    
    // ...........................
    // PROTECTED METHODS
    
    //*@protected
    create: function () {
        this.inherited(arguments);
        // make sure we have some type of id
        this.id = this.makeId();
    },
    
    //*@protected
    ownerChanged: function () {
        this.refreshBindings();
    }
    
    // ...........................
    // OBSERVERS

});
