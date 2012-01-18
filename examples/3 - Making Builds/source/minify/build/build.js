
// minifier: path aliases

enyo.path.addPaths({..: "../"});

// HelloWorld.js

enyo.kind({
name: "HelloWorld",
kind: enyo.Control,
content: "Hello World from Enyo"
});
