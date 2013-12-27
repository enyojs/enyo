enyo.kind({
	name: "enyo.sample.DragAvatarSample",
	classes: "drag-avatar-sample",
	components: [
		{content: "Start dragging anywhere on the screen (open sample in new tab)."},
		{kind: "enyo.DragAvatar", offsetX: 0, offsetY: 64, components: [
			{kind: "enyo.Image", name: "imageAvatar", src: "http://enyojs.com/img/enyo-logo.png"}
		]}
	],
	handlers: {
        ondrag: "drag",
        ondragfinish: "dragFinish"
    },
    drag: function(inSender, inEvent) {
        this.$.dragAvatar.drag(inEvent);
    },
    dragFinish: function(inSender, inEvent) {
        this.$.dragAvatar.hide();
    }
});
