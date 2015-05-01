var path = require('path')

function Logger (defaults, parentModule) {
    if (typeof defaults === "undefined") {
        defaults = Logger.root
    }

    if (typeof defaults === "string") {
        defaults = {
            name: defaults
        }
    }
    this.defaults = defaults || {
        name: ""
    }
    this.parentModule = parentModule;
    if (this.parentModule) {
        this.defaults.filename = path.relative(path.dirname(require.main.filename), this.parentModule.filename)
    }
}

Logger.root = "root"

Logger.prototype.output = function (logObj) {
    //esIndex(logObj);
    console.log(JSON.stringify(logObj));
}

Logger.prototype.logArgs = function () {
    var args = [].slice.call(arguments);
    args.unshift(this.defaults)
    var logObj = args.reduce(function (obj, cur){
        if (typeof cur == "string") {
            obj.msg = cur;
        } else {
            Object.keys(cur).forEach(function (key) {
                obj[key] = cur[key];
            })
        }
        return obj
    }, {})
    logObj['@timestamp'] = new Date().toISOString()
    this.output(logObj);
}

Logger.prototype.child = function (name) {
    var defaults = clone(this.defaults)

    if (!name) {
        name = "[INVALID LOGGER NAME]"
    }

    if (defaults.name && defaults.name != Logger.root) {
        defaults.name = defaults.name + "." + name
    } else {
        defaults.name = name
    }

    return new Logger(defaults, this.parentModule)
}

addLevels(['fatal', 'error', 'warn', 'info', 'debug'])


function addLevels(levels) {
    levels.forEach(function (level, i) {
        Logger.prototype[level] = function () {
            var args = [].slice.call(arguments);
            args.unshift({
                level: level
            });
            this.logArgs.apply(this, args);
        }
    })
}

function clone(o) {
    return JSON.parse(JSON.stringify(o))
}

if (!module.parent) {
    var logger = new Logger()
    logger.info("test")
    var logChild = logger.child("child-component")
    logChild.warn("some warning")
}

module.exports = Logger;