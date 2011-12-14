/**
	Invokes function _inJob_ after _inWait_ milliseconds have elapsed since the
	last time _inJobName_ was referenced.

	Jobs can be used to throttle behaviors. If some event can occur once or multiple
	times, but we want a response to occur only once every so many seconds, we can use a job.

		onscroll: function() {
			// updateThumb will be called but only when 1s has elapsed since the 
			// last onscroll
			enyo.job("updateThumb", enyo.bind(this, "updateThumb"), 1000);
		}
*/
enyo.job = function(inJobName, inJob, inWait) {
	enyo.job.stop(inJobName);
	enyo.job._jobs[inJobName] = setTimeout(function() {
		enyo.job.stop(inJobName);
		inJob();
	}, inWait);
};

/**
	Cancels the named job, if it has not already fired.
*/
enyo.job.stop = function(inJobName) {
	if (enyo.job._jobs[inJobName]) {
		clearTimeout(enyo.job._jobs[inJobName]);
		delete enyo.job._jobs[inJobName];
	}
};

//* @public
/**
	Start a timer with the given name
*/
enyo.time = function(inName) {
	enyo.time.timers[inName] = new Date().getTime();
	enyo.time.lastTimer = inName;
};

/**
	Ends a timer with the given name and returns the number of milliseconds elapsed.
*/
enyo.timeEnd = function(inName) {
	var n = inName || enyo.time.lastTimer;
	var dt = enyo.time.timers[n] ? new Date().getTime() - enyo.time.timers[n] : 0;
	return (enyo.time.timed[n] = dt);
};

//* @protected
enyo.time.timers = {};
enyo.time.timed = {};

//* @protected
enyo.job._jobs = {};

//* @public
// string utils (needed so far)
enyo.string = {
	/** return string with white space at start and end removed */
	trim: function(inString) {
		return inString.replace(/^\s+|\s+$/g,"");
	},
	/** return string with leading and trailing quote characters removed, e.g. <code>"foo"</code> becomes <code>foo</code> */
	stripQuotes: function(inString) {
		var c0 = inString.charAt(0);
		if (c0 == '"' || c0 == "'") {
			inString = inString.substring(1);
		}
		var l = inString.length - 1, cl = inString.charAt(l);
		if (cl == '"' || cl == "'") {
			inString = inString.substr(0, l);
		}
		return inString;
	},
	/**
		return string where _inSearchText_ is case-insensitively matched and wrapped in a &lt;span&gt; tag with
		CSS class _inClassName_ 
	*/
	applyFilterHighlight: function(inText, inSearchText, inClassName) {	
		return inText.replace(new RegExp(inSearchText, "i"), '<span class="' + inClassName + '">$&</span>');
	},
	/**
		return string with ampersand, less-than, and greater-than characters replaced with HTML entities, 
		e.g. '&lt;code&gt;"This &amp; That"&lt;/code&gt;' becomes '&amp;lt;code&amp;gt;"This &amp;amp; That"&amp;lt;/code&amp;gt;' 
	*/
	escapeHtml: function(inText) {
		return inText != null ? String(inText).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
	},
	/**
		return string with ampersand and double quote characters replaced with HTML entities, 
		e.g. 'hello from "Me & She"' becomes 'hello from &amp;quot;Me &amp;amp; She&amp;quot;' 
	*/
	escapeHtmlAttribute: function(inText) {
		return inText != null ? String(inText).replace(/&/g,'&amp;').replace(/"/g,'&quot;') : '';
	},
	/** return a text-only version of a string that may contain html */
	// credit to PrototypeJs for these regular expressions
	// Note, it's possible to use dom to strip tags using innerHtml/innerText tricks
	// but dom executes html so this is unsecure. In addition entities are converted to tags
	_scriptsRe: new RegExp("<script[^>]*>([\\S\\s]*?)<\/script>", "gim"),
	_tagsRe: new RegExp(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi),
	removeHtml: function(inHtml) {
		var t = inHtml.replace(enyo.string._scriptsRe, "").replace(enyo.string._tagsRe, "");
		// just to be sure, escape any html we may have missed.
		return enyo.string.escapeHtml(t);
	},
	/**
		Searches _inText_ for URLs (web and mailto) and emoticons (if supported), and returns a new string with those entities replaced by HTML links and images (respectively).
	
		Passing false for an  _inOptions_ field will prevent LunaSysMgr from HTML-izing that text type.

		Defaults:
		
			{
				phoneNumber: true,
				emailAddress: true,
				webLink: true,
				schemalessWebLink: true,
				emoticon: true
			}
	*/
	runTextIndexer: function(inText, inOptions) {
		if (inText === "") {
			return inText;
		}
		if (typeof PalmSystem !== "undefined" && PalmSystem.runTextIndexer) {
			return PalmSystem.runTextIndexer(inText, inOptions);
		}
		console.warn("enyo.string.runTextIndexer is not available on your system");
		return inText;
	},
	//* Encode a string to Base64
	toBase64: function(inText) { return window.btoa(inText); },
	//* Decode string from Base64. Throws exception on bad input.
	fromBase64: function(inText) { return window.atob(inText); }
};