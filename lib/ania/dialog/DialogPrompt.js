/**
A special <a href="#enyo.Dialog">Dialog</a> designed to prompt the user to answer a question 
affirmatively or negatively. It displays a title and message, along with accept and cancel buttons.

The title, message, acceptButtonContent, and cancelButtonContent can all be set as needed.

The onAccept and onCancel events are fired when the user clicks the accept 
and cancel buttons, respectively.
	
Here's an example:

	{
		kind: "DialogPrompt",
		content: "Mood Prompt",
		message: "Are you having a good day?",
		acceptButtonContent: "Yes",
		cancelButtonContent: "No",
		onAccept: "fetchMoreWork",
		onCancel: "fetchABreak"
	}
*/
enyo.kind({
	name: "enyo.DialogPrompt",
	kind: enyo.Dialog,
	scrim: true,
	published: {
		message: "",
		acceptButtonContent: enyo._$L("OK"),
		cancelButtonContent: enyo._$L("Cancel")
	},
	events: {
		onAccept: "",
		onCancel: ""
	},
	//* @protected
	promptChrome: [
		{name: "client", className: "enyo-dialog-inner", components: [
			{name: "content", className: "enyo-dialog-prompt-content"},
			{className: "enyo-dialog-prompt-content", components: [
				{name: "message", className: "enyo-dialog-prompt-message"},
				{name: "acceptButton", kind: "Button", onclick: "acceptClick"},
				{name: "cancelButton", kind: "Button", onclick: "cancelClick"}
			]}
		]}
	],
	componentsReady: function() {
		this.inherited(arguments);
		this.createChrome(this.promptChrome);
		this.contentChanged();
		this.messageChanged();
		this.acceptButtonContentChanged();
		this.cancelButtonContentChanged();
	},
	//* @public
	//* Open a DialogPrompt with the specified content, message, and button contents
	open: function(inContent, inMessage, inAcceptButtonContent, inCancelButtonContent) {
		this.openInfo = {
			content: inContent,
			message: inMessage,
			acceptButtonContent: inAcceptButtonContent,
			cancelButtonContent: inCancelButtonContent
		}
		this.inherited(arguments);
	},
	prepareOpen: function() {
		if (this.inherited(arguments)) {
			this.processOpenInfo(this.openInfo || {});
			this.openInfo = null;
			return true;
		}
	},
	processOpenInfo: function(inInfo) {
		if (inInfo.content) {
			this.setContent(inInfo.content);
		}
		if (inInfo.message) {
			this.setMessage(inInfo.message);
		}
		if (inInfo.acceptButtonContent) {
			this.setAcceptButtonContent(inInfo.acceptButtonContent);
		}
		if (inInfo.cancelButtonContent !== undefined) {
			this.setCanceltButtonContent(inInfo.cancelButtonContent);
		}
	},
	//* @protected
	contentChanged: function() {
		this.$.content.setContent(this.content);
		this.$.content.setShowing(this.content);
	},
	messageChanged: function() {
		this.$.message.setContent(this.message);
	},
	acceptButtonContentChanged: function() {
		this.$.acceptButton.setContent(this.acceptButtonContent);
	},
	cancelButtonContentChanged: function() {
		this.$.cancelButton.setContent(this.cancelButtonContent);
		this.$.cancelButton.setShowing(this.cancelButtonContent);
	},
	acceptClick: function() {
		this.doAccept();
		this.close();
	},
	cancelClick: function() {
		this.doCancel();
		this.close();
	}
});
