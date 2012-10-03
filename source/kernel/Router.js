// THIS IS NOT A REAL IMPLEMENTATION IT IS HACKED TO
// WORK FOR EXAMPLE PURPOSES ONLY!
enyo.kind({
  name: "enyo.Router",
  kind: "enyo.Object",
  location: window.location,
  published: {
    routes: null
  },
  start: function () {
    window.onhashchange = enyo.bind(this, this.hashChanged);
    this.hashChanged();
  },
  route: function (inTarget) {
    this.location.hash = "#/" + inTarget;
  },
  hashChanged: function () {
    var routes = this.get("routes"), hash = this.get("hash");
    if (hash === "" || !!~routes.indexOf(hash))
      this.get("controller").handle(hash || "default");
  },
  hash: enyo.Computed(function () {
    return this.location.hash.replace(/\#\//, "");
  })
});