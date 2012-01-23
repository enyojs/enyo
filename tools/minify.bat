// don't watch the sausage being made
@ECHO OFF

// the folder this script is in (*/enyo/tools)
SET TOOLS=%~DP0
// enyo location
SET ENYO=%TOOLS%\..
// default node location
SET NODE=%TOOLS%\node.exe
// minify script location
SET MINIFY=%TOOLS%\minifier\minify.js

// use node to invoke minify with a known path to enyo and imported parameters
%NODE% %MINIFY% -enyo %ENYO% %1 %2 %3 %4 %5 %6

// let the user see the console output
PAUSE
