/**
A text input control for typing in passwords and other confidential information.
Inputted characters are masked. The value of the input can still be retrieved via getValue, e.g.:

	buttonClick: function() {
		var password = this.$.passwordInput.getValue();
	}
*/
enyo.kind({
	name: "enyo.PasswordInput", 
	kind: enyo.Input,
	inputType: "password"
});
