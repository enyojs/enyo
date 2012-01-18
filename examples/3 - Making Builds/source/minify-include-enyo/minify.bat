REM @ECHO OFF

SET ENYO=..\..\..\..\

SET TOOLS=%ENYO%\tools
SET NODE=%TOOLS%\node.exe
SET MINIFY=%TOOLS%\minifier\minify.js

MKDIR build
%NODE% %MINIFY% package.js -enyo %ENYO% -output build/build

PAUSE