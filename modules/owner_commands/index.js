const help = require('../../utils/help');
const embedBuilder = require('../../utils/embedBuilder');
const config = require('../../utils/config');
const modMgr = require('../../utils/modMgr');
const cmdListGen = require('../../utils/cmdListGen');

module.exports._info_ = {
    description: 'Owner commands for Oxyde',
    version: '1.0.0',
    author: 'Ryzerth'
}

module.exports._init_ = (bot) => {
    return true;
}

module.exports.setstatus = {
    description: 'Set the bot\'s prefix',
    usage: 'setprefix [prefix]',
    ownerOnly: true,
    minArgs: 1,
    base: async (Eris, bot, serverId, msg, text, args) => {
        bot.editStatus('online', {name: text});
        let cnf = await config.getLocal('oxyde');
        cnf.status = text;
        await config.setLocal('oxyde', cnf);
        msg.channel.createMessage(':white_check_mark: `Status set successfully!`');
    }
}

module.exports.module = {
    description: 'Get information about the loaded modules',
    usage: 'module [list/info] [name]',
    base: (Eris, bot, serverId, msg, text, args) => {
        help.sendHelp('module', msg.channel);
    },
    subCmds: {
        list: {
            minArgs: 0,
            maxArgs: 0,
            base: async (Eris, bot, serverId, msg, text, args)  => {
                let cnf = await config.getServer(serverId, 'oxyde')
                let embed = new embedBuilder.Embed();
                embed.setTitle('Module List');
                embed.setColor(cnf.color);
                let modules = Object.keys(modMgr.modCache);
                let modulesStr = '';
                for (let i = 0; i < modules.length; i++) {
                    modulesStr += `, ${modules[i]}`;
                }
                modulesStr = modulesStr.substr(2);
                embed.setDescription(`\`\`\`${modulesStr}\`\`\``);
                msg.channel.createMessage({
                    embed: embed.get()
                });
            }
        },
        info: {
            minArgs: 1,
            maxArgs: 1,
            base: async (Eris, bot, serverId, msg, text, args)  => {
                let cnf = await config.getServer(serverId, 'oxyde')
                let name = args[0].toLowerCase();
                let mod = modMgr.modCache[name];
                if (!mod) {
                    channel.createMessage(`:no_entry: \`Unknown module!\``);
                    return;
                }
                let embed = new embedBuilder.Embed();
                embed.setTitle(name);
                embed.setDescription(mod._info_.description);
                embed.setColor(cnf.color);
                embed.addField('Version', mod._info_.version, true);
                embed.addField('Author', mod._info_.author, true);
                let commands = Object.values(modMgr.baseCommands).filter(c => c.module == name);
                let commandsStr = '';
                for (let i = 0; i < commands.length; i++) {
                    commandsStr += `, ${commands[i].name}`;
                }
                commandsStr = commandsStr.substr(2);
                embed.addField('Added Commands', `\`\`\`${commandsStr}\`\`\``, false);
                msg.channel.createMessage({
                    embed: embed.get()
                });
            }
        }
    }
}

module.exports.version = {
    description: 'Get the bot\'s version',
    usage: 'version',
    maxArgs: 0,
    base: async (Eris, bot, serverId, msg, text, args) => {
        let cnf = await config.getServer(serverId, 'oxyde')
        let embed = new embedBuilder.Embed();
        embed.setColor(cnf.color);
        embed.setTitle('Version');
        embed.setDescription(`This bot is currently running Oxyde version \`${modMgr.info.version}\``);
        msg.channel.createMessage({
            embed: embed.get()
        });
    }
}

module.exports.commandlist = {
    description: 'Get the list of all the bot\'s commands',
    usage: 'commandlist',
    maxArgs: 0,
    alias: 'cmdlist',
    base: async (Eris, bot, serverId, msg, text, args) => {
        msg.channel.createMessage(cmdListGen.cmdListLink);
    }
}