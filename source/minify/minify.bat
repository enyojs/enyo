REM @ECHO OFF

SET TOOLS=..\..\tools
SET NODE=%TOOLS%\node.exe
SET MINIFY=%TOOLS%\minifier\minify.js
SET ENYO=..\..
SET TARGET=.\build

%NODE% %MINIFY% package.js -enyo %ENYO% -output enyo -no-alias

mkdir %TARGET%
move /Y enyo.js %TARGET%
move /Y enyo.css %TARGET%

PAUSE
