@ECHO OFF

SET TOOLS=%~DP0
SET ENYO=%TOOLS%\..

SET NODE=%TOOLS%\node.exe
SET MINIFY=%TOOLS%\minifier\minify.js

%NODE% %MINIFY% -enyo %ENYO% %1 %2 %3 %4 %5 %6

PAUSE
