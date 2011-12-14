@ECHO OFF

SET NODE=/www/node/node.exe
SET MINIFY=../../support/tools/node/minify.js

%NODE% %MINIFY% depends.js

