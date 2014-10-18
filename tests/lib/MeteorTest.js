// Generated by CoffeeScript 1.8.0
(function() {
  var ChildProcess, Meteor, chai, expect, lookUpMongodChilds, path, ps, sinon, sinonChai, _;

  chai = require("chai");

  expect = chai.expect;

  sinon = require("sinon");

  _ = require("underscore");

  sinonChai = require("sinon-chai");

  chai.use(sinonChai);

  Meteor = require("../../src/Meteor");

  ChildProcess = require("../../src/ChildProcess");

  ps = require('ps-node');

  path = require("path");

  describe("Meteor.coffee", function() {
    var childProcessMockObj, defaultTestPort, env, expectedSpawnArgs, expectedSpawnOptions, getExpectedSpawnOptions, meteor, packageToTest, spawnStub, testPackages;
    this.timeout(30000);
    meteor = null;
    spawnStub = null;
    defaultTestPort = 4096;
    env = process.env;
    packageToTest = 'success';
    expectedSpawnOptions = null;
    expectedSpawnArgs = null;
    childProcessMockObj = {
      on: function() {},
      stdout: {
        on: function() {}
      },
      stderr: {
        on: function() {}
      }
    };
    before(function() {
      return log.setLevel("info");
    });
    beforeEach(function() {
      process.chdir(__dirname + "/leaderboard");
      meteor = new Meteor();
      expectedSpawnArgs = ['test-packages', "--driver-package", meteor.driverPackage];
      spawnStub = sinon.stub(ChildProcess.prototype, "spawn");
      ChildProcess.prototype.child = childProcessMockObj;
      process.argv = ['coffee', path.normalize(__dirname + "/../bin/spacejam")];
      return process.argv.push("test-packages");
    });
    afterEach(function() {
      ChildProcess.prototype.child = null;
      if (spawnStub != null) {
        spawnStub.restore();
      }
      return spawnStub = null;
    });
    after(function() {});
    getExpectedSpawnOptions = function(port, rootUrl, mongoUrl) {
      expectedSpawnOptions = {
        cwd: ".",
        detached: false,
        env: env
      };
      if (rootUrl == null) {
        rootUrl = "http://localhost:" + port + "/";
      }
      expectedSpawnOptions.env.ROOT_URL = rootUrl;
      if (mongoUrl != null) {
        expectedSpawnOptions.env.MONGO_URL = mongoUrl;
      }
      return expectedSpawnOptions;
    };
    testPackages = function() {
      var arg, opts, _i, _len;
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        arg = arguments[_i];
        process.argv.push(arg);
      }
      opts = require("rc")("spacejam", {});
      return meteor.testPackages(opts);
    };
    it("testPackages() - should spawn meteor with no package arguments", function() {
      testPackages();
      expectedSpawnArgs.push("--port", defaultTestPort);
      return expect(spawnStub.args[0]).to.eql(["meteor", expectedSpawnArgs, getExpectedSpawnOptions(4096)]);
    });
    it("testPackages() - should spawn meteor with a package name argument", function() {
      testPackages(packageToTest);
      expectedSpawnArgs.push("--port", defaultTestPort, packageToTest);
      return expect(spawnStub.args[0]).to.eql(["meteor", expectedSpawnArgs, getExpectedSpawnOptions(4096)]);
    });
    it("testPackages() - should spawn meteor with a ROOT_URL set to http://localhost:--port/", function() {
      var rootUrl;
      rootUrl = "http://localhost:5000/";
      testPackages("--port", "5000");
      expectedSpawnArgs.push("--port", 5000);
      return expect(spawnStub.args[0]).to.eql(["meteor", expectedSpawnArgs, getExpectedSpawnOptions(5000, rootUrl)]);
    });
    it("testPackages() - should ignore env ROOT_URL", function() {
      process.env.ROOT_URL = "http://localhost:5000/";
      testPackages();
      expectedSpawnArgs.push("--port", defaultTestPort);
      return expect(spawnStub.args[0]).to.eql(["meteor", expectedSpawnArgs, getExpectedSpawnOptions(defaultTestPort)]);
    });
    it("testPackages() - should spawn meteor with a --settings argument", function() {
      testPackages("--settings", "settings.json", packageToTest);
      expectedSpawnArgs.push("--port", defaultTestPort, "--settings", "settings.json", packageToTest);
      return expect(spawnStub.args[0]).to.eql(["meteor", expectedSpawnArgs, getExpectedSpawnOptions(4096)]);
    });
    it("testPackages() - should spawn meteor with a --production argument", function() {
      testPackages(packageToTest, "--production");
      expectedSpawnArgs.push("--port", defaultTestPort, "--production", packageToTest);
      return expect(spawnStub.args[0]).to.eql(["meteor", expectedSpawnArgs, getExpectedSpawnOptions(4096)]);
    });
    it("testPackages() - should spawn meteor with a --release argument", function() {
      var releaseToTest;
      releaseToTest = '0.9.0';
      testPackages("--release", releaseToTest, packageToTest);
      expectedSpawnArgs.push("--release", releaseToTest, "--port", defaultTestPort, packageToTest);
      return expect(spawnStub.args[0]).to.eql(["meteor", expectedSpawnArgs, getExpectedSpawnOptions(4096)]);
    });
    it("testPackages() - should spawn meteor with ROOT_URL set to --root-url", function() {
      var rootUrl;
      rootUrl = "http://test.meteor.com/";
      testPackages("--root-url", rootUrl, packageToTest);
      expectedSpawnArgs.push("--port", defaultTestPort, packageToTest);
      expect(spawnStub.args[0]).to.eql(["meteor", expectedSpawnArgs, getExpectedSpawnOptions(4096, rootUrl)]);
      return expect(spawnStub.args[0][2].env.ROOT_URL).to.equal(rootUrl);
    });
    it("testPackages() - should ignore env MONGO_URL", function() {
      process.env.MONGO_URL = "mongodb://localhost/mydb";
      testPackages();
      delete process.env.MONGO_URL;
      expectedSpawnArgs.push("--port", defaultTestPort);
      return expect(spawnStub.args[0]).to.eql(["meteor", expectedSpawnArgs, getExpectedSpawnOptions(4096)]);
    });
    it("testPackages() - should spawn meteor with MONGO_URL set to --mongo-url", function() {
      var mongoUrl;
      mongoUrl = "mongodb://localhost/mydb";
      testPackages("--mongo-url", mongoUrl, packageToTest);
      expectedSpawnArgs.push("--port", defaultTestPort, packageToTest);
      expect(spawnStub.args[0]).to.eql(["meteor", expectedSpawnArgs, getExpectedSpawnOptions(4096, null, mongoUrl)]);
      return expect(spawnStub.args[0][2].env.MONGO_URL).to.equal(mongoUrl);
    });
    return it("kill() - should kill internal mongodb child processes", function(done) {
      this.timeout(60000);
      process.argv.push(packageToTest);
      spawnStub.restore();
      spawnStub = null;
      ChildProcess.prototype.child = null;
      testPackages();
      return meteor.on("ready", function() {
        var pid;
        pid = meteor.childProcess.child.pid;
        return lookUpMongodChilds(pid, function(err, resultList) {
          var timerId;
          expect(err, "could not find mongod children").not.to.be.ok;
          expect(resultList, "Found more than one mongod child").have.length.of(1);
          meteor.kill();
          return timerId = setInterval(function() {
            return lookUpMongodChilds(pid, function(err, resultList) {
              if (err) {
                expect(resultList, "the mongod children were not killed").not.to.be.ok;
                clearInterval(timerId);
                return done();
              }
            });
          }, 500);
        });
      });
    });
  });

  lookUpMongodChilds = function(pid, cb) {
    return ps.lookup({
      command: 'mongod',
      psargs: '--ppid ' + pid
    }, cb);
  };

}).call(this);
