const help = require('../../utils/help');
const config = require('../../utils/config');

module.exports._info_ = {
    description: 'Admin commands for Oxyde',
    version: '1.0.0',
    author: 'Ryzerth'
}

module.exports._init_ = (Eris, bot) => {
    return true;
}

module.exports.setprefix = {
    description: 'Set the bot\'s prefix',
    usage: 'setprefix [prefix]',
    adminOnly: true,
    minArgs: 1,
    maxArgs: 1,
    base: async (Eris, bot, serverId, msg, text, args) => {
        let cnf = await config.getServer(serverId, 'oxyde')
        cnf.prefix = args[0];
        await config.setServer(serverId, 'oxyde', cnf);
        msg.channel.createMessage(':white_check_mark: `Prefix set successfully!`');
    }
}

module.exports.setcolor = {
    description: 'Set the color of the bot\'s embeds',
    usage: 'setcolor [hex_color]',
    adminOnly: true,
    minArgs: 1,
    maxArgs: 1,
    base: async (Eris, bot, serverId, msg, text, args) => {
        if (!args[0].match(/^#(?:[0-9a-fA-F]{3}){1,2}$/g)) {
            msg.channel.createMessage(':no_entry: `Invalid color!`');
            return;
        }
        let cnf = await config.getServer(serverId, 'oxyde')
        cnf.color = args[0];
        await config.setServer(serverId, 'oxyde', cnf);
        msg.channel.createMessage(':white_check_mark: `Color set successfully!`');
    }
}

module.exports.setadmin = {
    description: 'Set the admin role',
    usage: 'setadmin [role]',
    adminOnly: true,
    minArgs: 1,
    maxArgs: 1,
    minRoleMentions: 1,
    maxRoleMentions: 1,
    base: async (Eris, bot, serverId, msg, text, args) => {
        let cnf = await config.getServer(serverId, 'oxyde')
        cnf.adminRole = msg.roleMentions[0];
        await config.setServer(serverId, 'oxyde', cnf);
        console.log(msg);
        msg.channel.createMessage(':white_check_mark: `Prefix set successfully!`');
    }
}

module.exports.setadminid = {
    description: 'Set the admin role by ID',
    usage: 'setadminid [role_id]',
    adminOnly: true,
    minArgs: 1,
    maxArgs: 1,
    base: async (Eris, bot, serverId, msg, text, args) => {
        let cnf = await config.getServer(serverId, 'oxyde')
        cnf.adminRole = args[0];
        await config.setServer(serverId, 'oxyde', cnf);
        msg.channel.createMessage(':white_check_mark: `Prefix set successfully!`');
    }
}