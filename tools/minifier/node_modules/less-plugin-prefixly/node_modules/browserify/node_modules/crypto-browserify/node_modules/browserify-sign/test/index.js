var asn1 = require('parse-asn1/asn1')
var crt = require('browserify-rsa')
var crypto = require('crypto')
var fixtures = require('./fixtures')
var myCrypto = require('../browser')
var nodeCrypto = require('crypto')
var parseKeys = require('parse-asn1')
var test = require('tape')

function isNode10 () {
  return process.version && process.version.split('.').length === 3 && parseInt(process.version.split('.')[0].slice(1), 10) < 1 && parseInt(process.version.split('.')[1], 10) <= 10
}

fixtures.valid.rsa.forEach(function (f) {
  var message = new Buffer(f.message)
  var pub = new Buffer(f.public, 'base64')
  var priv

  if (f.passphrase) {
    priv = {
      key: new Buffer(f.private, 'base64'),
      passphrase: f.passphrase
    }
  } else {
    priv = new Buffer(f.private, 'base64')
  }

  // skip passphrase tests in node 10
  if (f.passphrase && isNode10()) return

  test(f.message, function (t) {
    t.plan(7)

    var mySign = myCrypto.createSign(f.scheme)
    var nodeSign = nodeCrypto.createSign(f.scheme)
    var mySig = mySign.update(message).sign(priv)
    var nodeSig = nodeSign.update(message).sign(priv)

    t.equals(mySig.length, nodeSig.length, 'correct length')
    t.equals(mySig.toString('hex'), nodeSig.toString('hex'), 'equal sigs')
    t.equals(mySig.toString('hex'), f.signature, 'compare to known')

    var myVer = myCrypto.createVerify(f.scheme)
    var nodeVer = nodeCrypto.createVerify(f.scheme)
    t.ok(nodeVer.update(message).verify(pub, mySig), 'node validate my sig')
    t.ok(myVer.update(message).verify(pub, nodeSig), 'me validate node sig')
    myVer = myCrypto.createVerify(f.scheme)
    nodeVer = nodeCrypto.createVerify(f.scheme)
    t.ok(nodeVer.update(message).verify(pub, nodeSig), 'node validate node sig')
    t.ok(myVer.update(message).verify(pub, mySig), 'me validate my sig')
  })
})

fixtures.valid.ec.forEach(function (f) {
  var message = new Buffer(f.message)
  var pub = new Buffer(f.public, 'base64')
  var priv

  if (f.passphrase) {
    priv = {
      key: new Buffer(f.private, 'base64'),
      passphrase: f.passphrase
    }
  } else {
    priv = new Buffer(f.private, 'base64')
  }

  // skip passphrase tests in node 10
  if (f.passphrase && isNode10()) return

  test(f.message, function (t) {
    t.plan(4)

    var nodeSign = nodeCrypto.createSign(f.scheme)
    var mySign = myCrypto.createSign(f.scheme)

    var mySig = mySign.update(message).sign(priv)
    var nodeSig = nodeSign.update(message).sign(priv)
    t.notEqual(mySig.toString('hex'), nodeSig.toString('hex'), 'not equal sigs')
    t.equals(mySig.toString('hex'), f.signature)

    var myVer = myCrypto.createVerify(f.scheme)
    var nodeVer = nodeCrypto.createVerify(f.scheme)
    t.ok(nodeVer.update(message).verify(pub, mySig), 'node validate my sig')
    t.ok(myVer.update(message).verify(pub, nodeSig), 'me validate node sig')
  })
})

fixtures.valid.kvectors.forEach(function (f) {
  test('kvector algo: ' + f.algo + ' key len: ' + f.key.length + ' msg: ' + f.msg, function (t) {
    var key = new Buffer(f.key, 'base64')

    t.plan(2)
    var sig = myCrypto.createSign(f.algo).update(f.msg).sign(key)
    var rs = asn1.signature.decode(sig, 'der')
    t.equals(rs.r.toString(16), f.r.toLowerCase(), 'r')
    t.equals(rs.s.toString(16), f.s.toLowerCase(), 's')
  })
})

fixtures.invalid.verify.forEach(function (f) {
  test(f.description, function (t) {
    t.plan(2)

    var sign = new Buffer(f.signature, 'hex')
    var pub = new Buffer(f.public, 'base64')
    var message = new Buffer(f.message)

    t.notOk(nodeCrypto.createVerify(f.scheme)
      .update(message)
      .verify(pub, sign), 'node rejects it')

    t.notOk(myCrypto.createVerify(f.scheme)
      .update(message)
      .verify(pub, sign), 'We reject it')
  })
})
