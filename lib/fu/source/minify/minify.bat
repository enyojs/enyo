REM @ECHO OFF

SET ROOT=..\..\..\..
SET NODE=%ROOT%\tools\node.exe
SET MINIFY=%ROOT%\tools\minify.js
SET ENYO=%ROOT%\enyo

%NODE% %MINIFY% depends.js -enyo %ENYO% -output fu

del fu.js
move /Y fu.css ../../build
