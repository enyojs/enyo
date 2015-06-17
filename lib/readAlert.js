require('enyo');
require('enyo-webos');

/**
* Accessibility function for reading alert message. 
*
* @module enyo/readAlert
* @public
*/

var
	options = require('./options');

module.exports = readAlert;

function readAlert (s) {
	if (!options.accessibility) return;

	var isWebos = window.webOS && window.webOS.voicereadout && window.webOS.platform &&
					window.webOS.platform.watch ||
					window.webOS.platform.tv ||
					null;
	if (isWebos) {
		window.webOS.voicereadout.readAlert(s);
	} else {
		removeAlertChild();
		appendAlertChild(s);
		setInterval(removeAlertChild, 300);
	}
};

function appendAlertChild (s) {
	var alert = document.createElement('div');
	alert.setAttribute('role', 'alert');
	alert.setAttribute('id', 'alert_role_id');
	alert.setAttribute('aria-label', s);
	alert.setAttribute('style', 'position:absolute;z-index:-100;');
	document.body.appendChild(alert);
};

function removeAlertChild () {
	var alert = document.getElementById('alert_role_id');
	if (alert) {
		document.body.removeChild(alert);
	}
};