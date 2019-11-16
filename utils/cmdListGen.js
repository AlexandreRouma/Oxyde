const modMgr = require('./modMgr');
const table = require('table');
const hastebin = require('./hastebin');
const logger = require('./logger');

module.exports.cmdListLink = null;

module.exports.genTable = () => {
    let data = [['Name', 'Alias', 'Usage', 'Description', 'Admin Only', 'Owner Only', 'Module']];
    for (let i = 0; i < modMgr.cmdNameList.length; i++) {
        let cmd = modMgr.commands[modMgr.cmdNameList[i]];
        data.push([cmd.name, cmd.alias ? cmd.alias : 'none', cmd.usage, cmd.description, cmd.adminOnly ? 'Yes': 'No', cmd.ownerOnly ? 'Yes': 'No', cmd.module]);
    }
    return table.table(data);
}

module.exports.renewLink = async () => {
    logger.log('Generating command list link');
    let table = module.exports.genTable();
    let key = await hastebin.save(table);
    if (key == null) {
        logger.failed();
        logger.logWarn('The command list link couldn\'t be updated. This isn\'t vital to the bot');
    }
    module.exports.cmdListLink = `https://hasteb.in/${key}.txt`;
    logger.ok();
}