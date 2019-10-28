const help = require('../../utils/help');
const embedBuilder = require('../../utils/embedBuilder');
const config = require('../../utils/config');
const modMgr = require('../../utils/modMgr');
const https = require('https');
const rextester = require('./rextester');

module.exports._info_ = {
    description: 'Code commands for Oxyde',
    version: '1.0.0',
    author: 'Ryzerth'
}

module.exports._init_ = (Eris, bot) => {
    return true;
}

module.exports.base64 = {
    description: 'Encode or decode base64',
    usage: 'base64 [enc/dec] [id]',
    minArgs: 0,
    maxArgs: 0,
    alias: 'b64',
    base: async (Eris, bot, serverId, msg, text, args) => {
        help.sendHelp('base64', msg.channel);
    },
    subCmds: {
        enc: {
            minArgs: 1,
            base: (Eris, bot, serverId, msg, text, args) => {
                msg.channel.createMessage(`\`${Buffer.from(text).toString('base64')}\``);
            }
        },
        dec: {
            minArgs: 1,
            maxArgs: 1,
            base: (Eris, bot, serverId, msg, text, args) => {
                let decoded = '';
                try {
                    decoded = Buffer.from(text, 'base64').toString('ascii');
                }
                catch (err) {
                    msg.channel.createMessage(`:no_entry: \`Invalid base64!\``);
                    return;
                }
                msg.channel.createMessage(`\`${decoded}\``);
            }
        }
    }
}

module.exports.run = {
    description: 'Run code using the rextester API',
    usage: 'run [lang/list] [code]',
    minArgs: 2,
    base: async (Eris, bot, serverId, msg, text, args) => {
        let langs = rextester.getLanguages();
        if (!langs[args[0]]) {
            msg.channel.createMessage(`:no_entry: \`Unknown language!\``);
            return;
        }
        let result = await rextester.runCode(args[0], text.substr(args[0].length + 1));
        if (!result) {
            msg.channel.createMessage(`:no_entry: \`Could not reach the rextester API!\``);
        }
        let cnf = await config.getServer(serverId, 'oxyde');
        let embed = new embedBuilder.Embed();
        embed.setAuthor(`${msg.author.username}#${msg.author.discriminator}'s code result`, undefined, msg.author.avatarURL);
        embed.setColor(cnf.color);
        if (result.Result != '') {
            embed.setDescription(`\`\`\`${result.Result}\`\`\``);
        }
        if (result.Warnings != null) {
            embed.addField('Warnings', `\`\`\`${result.Warnings}\`\`\``);
        }
        if (result.Errors != null) {
            embed.addField('Errors', `\`\`\`${result.Errors}\`\`\``);
        }
        embed.setFooter(result.Stats);
        msg.channel.createMessage({
            embed: embed.get()
        });
    },
    subCmds: {
        list: {
            minArgs: 0,
            maxArgs: 0,
            base: async (Eris, bot, serverId, msg, text, args) => {
                let cnf = await config.getServer(serverId, 'oxyde')
                let embed = new embedBuilder.Embed();
                embed.setTitle('Language List');
                embed.setColor(cnf.color);
                let languages = Object.keys(rextester.getLanguages());
                let languagesStr = '';
                for (let i = 0; i < languages.length; i++) {
                    languagesStr += `, ${languages[i]}`;
                }
                languagesStr = languagesStr.substr(2);
                embed.setDescription(`\`\`\`${languagesStr}\`\`\``);
                msg.channel.createMessage({
                    embed: embed.get()
                });
            }
        }
    }
}