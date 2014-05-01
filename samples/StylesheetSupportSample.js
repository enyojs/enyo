enyo.kind({
	kind: "FittableRows",
	name: "enyo.sample.StylesheetSupportSample",
	classes: "stylesheet-support-sample",
	components: [
		{content: "Styled Container", classes: "section"},
		{
			name: "myContainer",
			classes: "hipster-ipsum",
			mixins: ["enyo.StylesheetSupport"],
			stylesheetContent: ".hipster-ipsum { background-color: #8563AC; }",
			content: "Sustainable four loko whatever McSweeney's 3 wolf moon butcher. Gluten-free messenger bag fashion axe fixie. Selfies asymmetrical occupy, cardigan tousled flexitarian Portland bitters. Whatever before they sold out paleo locavore, Pitchfork beard YOLO deep v viral. Master cleanse synth flannel, post-ironic pour-over salvia occupy raw denim Williamsburg brunch yr vinyl. Tote bag YOLO fingerstache ethnic shabby chic yr, Portland church-key. Mixtape Odd Future 90's drinking vinegar, tote bag sartorial gentrify Schlitz post-ironic +1 sustainable cray tousled.\n\nFap aesthetic ethical authentic bicycle rights Pitchfork selvage jean shorts plaid deep v ugh cardigan. Portland Neutra cred, gluten-free meggings leggings Odd Future kitsch church-key. Art party scenester hoodie tote bag, Neutra vinyl vegan Tonx put a bird on it. Vegan Godard Vice mlkshk Schlitz Etsy Tonx, artisan Pitchfork drinking vinegar McSweeney's asymmetrical narwhal synth kale chips. Pop-up flexitarian jean shorts PBR&B, cardigan brunch lo-fi gentrify. Thundercats typewriter semiotics, viral gluten-free mlkshk hashtag lomo disrupt polaroid freegan locavore four loko. Fixie paleo tattooed swag tousled Helvetica Schlitz, roof party mixtape hashtag slow-carb bespoke."
		},
		{content: "Customize Style", classes: "section"},
		{kind: "enyo.TextArea", name: "inputTextArea", type: "text", placeholder: "stylesheetContent Here - Write CSS as if you were working with a stylesheet file."},
		{kind: "enyo.Button", content: "Erase Stylesheet Contents", ontap: "clearStylesheet"}
	],
	bindings: [
		{from: ".$.inputTextArea.value", to: ".$.myContainer.stylesheetContent", oneWay: false}
	],
	create: function() {
		this.inherited(arguments);

		this.$.myContainer.addStylesheetContent(".hipster-ipsum { border-radius: 50%; overflow: hidden; }");

		this.$.inputTextArea.set("value", this.$.myContainer.get("stylesheetContent"));
	},
	clearStylesheet: function() {
		this.$.myContainer.set("stylesheetContent", "");
	}
});
