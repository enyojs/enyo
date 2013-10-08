enyo.kind({
    name: "BaseKind",
    controlParents: {
        headerComponents: "header"
    },
    components: [
        {kind: "onyx.Toolbar", style:"background-color:lightblue;", components: [
            {content: "headerComponents: "},
            {name: "header"}
        ]},
        {kind: "onyx.Toolbar", components: [
            {content: "Components: "},
            {name: "client"}
        ]}
    ]
});

enyo.kind({
    name: "ExtendsBaseKind",
    kind:"BaseKind", 
    headerComponents: [
        {kind:"onyx.Button", content:"1"},
        {kind:"onyx.Button", content:"2"}
    ]
});

enyo.kind({
    name: "DoubleExtendsBaseKind",
    kind:"ExtendsBaseKind", 
    controlParents: {
        moreCopmonents: "more"
    },
    initComponents: function() {
		this.createChrome([{name:"more", style:"background:orange; padding:10px;"}]);
		this.inherited(arguments);
    }
});

enyo.kind({
    name: "UsesBaseKind",
    components: [
        {kind:"DoubleExtendsBaseKind", moreCopmonents: [
            {kind:"onyx.Button", content:"A"},
            {kind:"onyx.Button", content:"B"}
        ], components: [
            {kind:"onyx.Button", content:"foo"},
            {kind:"onyx.Button", content:"bar"}
        ], headerComponents: [
            {kind:"onyx.Button", content:"3"},
            {kind:"onyx.Button", content:"4"}
        ]}
    ]
});

enyo.kind({
	name: "enyo.sample.MultipleControlParentSample",
	components: [
		{kind:"UsesBaseKind"}
	]
    // components: [
    //     {kind:"ExtendsBaseKind", headerComponents: [
    //         {kind:"onyx.Button", content:"3"},
    //         {kind:"onyx.Button", content:"4"}
    //     ], components: [
    //         {kind:"onyx.Button", content:"foo"},
    //         {kind:"onyx.Button", content:"bar"}
    //     ]}
    // ]
});

// http://jsfiddle.net/enyojs/X9jq8/9/