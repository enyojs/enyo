@ECHO OFF

SET NODE=/www/node/node.exe
SET MINIFY=../../../../tools/minify.js
SET ENYO=../../../../enyo

%NODE% %MINIFY% depends.js -enyo %ENYO% -output app -alias boot.js

PAUSE