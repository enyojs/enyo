REM don't watch the sausage being made
@ECHO OFF

REM the folder this script is in (*/enyo/tools)
SET TOOLS=%~DP0

REM enyo location
SET ENYO=%TOOLS%\..

REM default node location
SET NODE=%TOOLS%\node.exe

REM minify script location
SET MINIFY=%TOOLS%\minifier\minify.js

REM use node to invoke minify with a known path to enyo and imported parameters
%NODE% %MINIFY% -enyo %ENYO% %1 %2 %3 %4 %5 %6

REM let the user see the console output
PAUSE
