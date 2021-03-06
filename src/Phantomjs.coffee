_ = require "underscore"
expect = require('chai').expect
ChildProcess = require './ChildProcess'
EventEmitter = require('events').EventEmitter
path = require 'path'
phantomjs = require 'phantomjs-prebuilt'
isCoffee = __filename.indexOf('.coffee') > 0

DEFAULT_PATH = process.env.PATH


class Phantomjs extends EventEmitter

  childProcess: null

  run: (url, options = '--load-images=no --ssl-protocol=TLSv1', script = "phantomjs-test-in-console", pipeClass = undefined, pipeClassOptions = undefined, useSystemPhantomjs = false)=>
    log.debug "Phantomjs.run()", arguments
    expect(@childProcess,"ChildProcess is already running").to.be.null
    expect(url, "Invalid url").to.be.a 'string'
    expect(options, "Invalid options").to.be.a 'string'
    expect(script, "Invalid script").to.be.a 'string'
    expect(pipeClass, "Invalid pipeClass").to.be.a 'function' if pipeClass?
    expect(pipeClassOptions, "Invalid pipeClassOptions").to.be.an 'object' if pipeClassOptions?
    expect(useSystemPhantomjs, "Invalid useSystemPhantomjs").to.be.a 'boolean'

    env = _.extend process.env, {ROOT_URL: url}

    script += if isCoffee then '.coffee' else '.js'
    log.debug("script=#{__dirname}/#{script}")
    spawnArgs = options.split(' ')
    spawnArgs.push(script)
    log.debug 'spawnArgs:', spawnArgs
    spawnOptions =
      cwd: __dirname
      detached: false
      env: env
    log.debug 'spawnOptions:', spawnOptions

    # Add phantomjs NPM package bin to PATH unless --use-system-phantomjs is passed
    if useSystemPhantomjs
      process.env.PATH = DEFAULT_PATH
    else
      process.env.PATH = path.dirname(phantomjs.path) + ':' + DEFAULT_PATH

    @childProcess = new ChildProcess()
    @childProcess.spawn("phantomjs", spawnArgs, spawnOptions, pipeClass, pipeClassOptions)

    @childProcess.child.on "exit", (code, signal) =>
      @emit "exit", code, signal

  kill: (signal = "SIGTERM")->
    log.debug "Phantomjs.kill()"
    @childProcess?.kill(signal)


module.exports = Phantomjs

