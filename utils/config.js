const Sequelize = require('sequelize');
const fs = require('fs');

let localConfigCache = null;
let sequelize = null;
let database = null;
let jsonpath = '';

module.exports.init = async (localPath, dbPath) => {
    jsonpath = localPath;
    sequelize = new Sequelize('', '', '', {
        dialect: 'sqlite',
        storage: dbPath,
        logging: false
    });
    database = sequelize.define('config', {
        serverId: {
            type: Sequelize.STRING
        },
        config: {
            type: Sequelize.STRING
        }
    });
    await sequelize.sync();
}

// Configuration through the config.json file

module.exports.initLocal = (moduleName, base) => {
    module.exports.setLocal(moduleName, migrateConfig(module.exports.getLocal(moduleName), base));
}

module.exports.getLocal = (moduleName) => {
    if (localConfigCache == null) {
        localConfigCache = JSON.parse(fs.readFileSync(jsonpath));
    }
    return localConfigCache[moduleName];
}

module.exports.setLocal = (moduleName, newConfig) => {
    if (localConfigCache == null) {
        localConfigCache = JSON.parse(fs.readFileSync(jsonpath));
    }
    localConfigCache[moduleName] = newConfig;
    fs.writeFileSync(jsonpath, JSON.stringify(localConfigCache, undefined, 4));
}

// Server specific configuration via database

module.exports.initServer = async (serverId, moduleName, base) => {
    let current = await module.exports.getServer(serverId, moduleName);
    await module.exports.setServer(serverId, moduleName, migrateConfig(current, base));
}

module.exports.getServer = async (serverId, moduleName) => {
    let _config = await database.findOne({
        where: {
            serverId: serverId
        }
    });
    if (_config == null) {
        await database.create({
            serverId: serverId,
            config: JSON.stringify({})
        });
        return {};
    }
    return JSON.parse(_config.get('config'))[moduleName];
}

module.exports.getAllModules = async (serverId) => {
    let _config = await database.findOne({
        where: {
            serverId: serverId
        }
    });
    if (_config == null) {
        await database.create({
            serverId: serverId,
            config: JSON.stringify({})
        });
        return {};
    }
    return JSON.parse(_config.get('config'));
}

module.exports.setServer = async (serverId, moduleName, newConfig) => {
    let current = await module.exports.getAllModules(serverId);
    if (current == undefined) {
        current = {};
    }
    current[moduleName] = newConfig;
    module.exports.setAllModules(serverId, current);
}

module.exports.setAllModules = async (serverId, newConfig) => {
    await database.update({
        config: JSON.stringify(newConfig)
    },
    {
        where: {
            serverId: serverId
        }
    });
}

module.exports.cleanupModules = async (moduleNames) => {
    let all = await database.findAll({});
    for (let i = 0; i < all.length; i++) {
        let cnf = JSON.parse(all[i].dataValues.config);
        let keys = Object.keys(cnf);
        for (let j = 0; j < keys.length; j++) {
            if (!moduleNames.includes(keys[j])) {
                delete cnf[keys[j]]
            }
        }
        module.exports.setAllModules(all[i].dataValues.serverId, cnf);
    }
}

function migrateConfig(source, base) {
    let current = Object.assign({}, source); 
    let currentKeys = Object.keys(current);
    let baseKeys = Object.keys(base);
    for (let i = 0; i < currentKeys.length; i++) {
        if (base[currentKeys[i]] == undefined) {
            console.log(`deleting ${currentKeys[i]}`);
            delete current[currentKeys[i]];
        }
    }
    for (let i = 0; i < baseKeys.length; i++) {
        if (current[baseKeys[i]] == undefined) {
            console.log(`adding ${baseKeys[i]}`);
            current[baseKeys[i]] = base[baseKeys[i]];
        }
    } 
    return current;
}