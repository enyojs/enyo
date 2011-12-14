document.write('<scri' + 'pt src="' + 
	(window.location.search.slice(1).split("&").pop() == "debug" ? "source/" : "build/") + "api.js"
+ '"' + '></scri' + 'pt>');
