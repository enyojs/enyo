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
		setTimeout(removeAlertChild, 300);
	}
}

/**
* @private
*/
function appendAlertChild (s) {
	var alert = document.createElement('div');
	alert.setAttribute('role', 'alert');
	alert.setAttribute('id', 'enyo_accessibility_alert');
	alert.setAttribute('aria-label', s);
	alert.setAttribute('style', 'position:absolute;z-index:-100;');
	document.body.appendChild(alert);
}

/**
* @private
*/
function removeAlertChild () {
	var alert = document.getElementById('enyo_accessibility_alert');
	if (alert) {
		document.body.removeChild(alert);
	}
}