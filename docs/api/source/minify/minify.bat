@ECHO OFF

SET NODE=/www/node/node.exe
SET MINIFY=../../../../tools/minify.js
SET ENYO=../../../../enyo

%NODE% %MINIFY% depends.js -enyo %ENYO% -output api 

move /Y api.js ../../build
move /Y api.css ../../build

PAUSE