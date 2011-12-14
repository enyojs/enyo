REM @ECHO OFF

SET TOOLS=..\..\..\tools
SET NODE=%TOOLS%\node.exe
SET MINIFY=%TOOLS%\minify.js
SET ENYO=../..

%NODE% %MINIFY% depends.js -enyo %ENYO% -output enyo -no-alias

move /Y enyo.js %ENYO%
move /Y enyo.css %ENYO%

PAUSE