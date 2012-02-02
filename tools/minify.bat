@ECHO OFF
REM don't watch the sausage being made

REM the folder this script is in (*/enyo/tools)
SET TOOLS=%~DP0

REM enyo location
SET ENYO=%TOOLS%\..

REM minify script location
SET MINIFY=%TOOLS%\minifier\minify.js

REM node location
SET NODE=node.exe

REM use node to invoke minify with a known path to enyo and imported parameters
%NODE% %MINIFY% -enyo %ENYO% %1 %2 %3 %4 %5 %6

REM let the user see the console output
PAUSE
