const fs = require('fs');
const logger = require('./logger');

module.exports.modCache = {};
module.exports.commands = {};
module.exports.cmdNameList = [];
module.exports.baseCommands = {};

module.exports.loadModules = (path) => {
    if (path.endsWith('/') || path.endsWith('\\')) {
        path = path.substr(0, path.length - 1);
    }
    let modPaths = fs.readdirSync(path);
    for (let i = 0; i < modPaths.length; i++) {
        logger.log(`Loading ${modPaths[i]}`);
        let mod = require(`../${path}/${modPaths[i]}`);
        let cmdList = Object.keys(mod).filter(e => !e.startsWith('_'));
        if (!mod._info_) {
            logger.failed();
            logger.panic(`Module '${modPaths[i]}' does not contain a _info_ key!`, false);
            continue;
        }
        if (!mod._info_.description || !mod._info_.version || !mod._info_.author) {
            logger.failed();
            logger.panic(`Module '${modPaths[i]}' info is missing some keys. Modules must provide a description, a version and an author!`, false);
            continue;
        }
        if (!mod._init_) {
            logger.failed();
            logger.panic(`Module '${modPaths[i]}' does not contain a _init_ function!`, false);
            continue;
        }
        logger.ok();
        if (!mod._init_()) {
            logger.panic(`Module '${modPaths[i]}' failed to initialize!`, false);
            continue;
        }
        for (let j = 0; j < cmdList.length; j++) {
            logger.log(`[${modPaths[i]}] Adding command '${cmdList[j]}'`);
            let cmd = mod[cmdList[j]];
            cmd.name = cmdList[j];
            cmd.module = modPaths[i];
            if (module.exports.commands[cmd.name]) {
                logger.failed();
                logger.panic(`Command '${cmdList[j]}' already exists`, false);
                continue;
            }
            if (hasUpperCase(cmd.name)) {
                logger.failed();
                logger.panic(`Command '${cmdList[j]}' has upper case characters in its name`, false);
                continue;
            }
            if (cmd.alias) {
                if (hasUpperCase(cmd.alias)) {
                    logger.failed();
                    logger.panic(`Command '${cmdList[j]}' has upper case characters in its alias`, false);
                    continue;
                }
            }
            if (!cmd.description || !cmd.usage || !cmd.base) {
                logger.failed();
                logger.panic(`Command '${cmdList[j]}' is missing some keys. Modules must provide a description, a usage and a base function!`, false);
                continue;
            }
            
            if (cmd.subCmds) {
                let subCmds = Object.keys(cmd.subCmds);
                let upperCase = false;
                let missingKeys = false;
                let failedName = '';
                for (let k = 0; k < subCmds.length; k++) {
                    if (hasUpperCase(subCmds[k])) {
                        failedName = subCmds[k];
                        upperCase = true;
                        break;
                    }
                    if (!cmd.subCmds[subCmds[k]].base) {
                        failedName = subCmds[k];
                        missingKeys = true;
                        break;
                    }
                }
                if (upperCase) {
                    logger.failed();
                    logger.panic(`Command '${cmdList[j]}' has upper case characters in one of its subcommands`, false);
                    continue;
                }
                if (missingKeys) {
                    logger.failed();
                    logger.panic(`Subcommand '${failedName}' of command '${cmdList[j]}' is missing some keys. Subcommands must provide a base function!`, false);
                    continue;
                }
            }
            module.exports.baseCommands[cmd.name] = cmd;
            module.exports.cmdNameList.push(cmd.name);
            module.exports.commands[cmd.name] = cmd;
            if (cmd.alias) {
                module.exports.commands[cmd.alias] = cmd;
            }
            logger.ok();
        }
        module.exports.modCache[modPaths[i]] = mod;
    }
}

function hasUpperCase(str) {
    return (/[A-Z]/.test(str));
}