const modMgr = require('./modMgr');
const table = require('table');

module.exports.genTable = () => {
    let data = [['Name', 'Alias', 'Usage', 'Description', 'Admin Only', 'Owner Only', 'Module']];
    for (let i = 0; i < modMgr.cmdNameList.length; i++) {
        let cmd = modMgr.commands[modMgr.cmdNameList[i]];
        data.push([cmd.name, cmd.alias ? cmd.alias : 'none', cmd.usage, cmd.description, cmd.adminOnly ? 'Yes': 'No', cmd.ownerOnly ? 'Yes': 'No', cmd.module]);
    }
    return table.table(data);
}