const help = require('../../utils/help');
const embedBuilder = require('../../utils/embedBuilder');
const config = require('../../utils/config');
const modMgr = require('../../utils/modMgr');
const ping = require('ping');
const mathEval = require('math-expression-evaluator');
const aesthetics = require('aesthetics');

module.exports._info_ = {
    description: 'Misc commands for Oxyde',
    version: '1.0.0',
    author: 'Ryzerth'
}

module.exports._init_ = (bot) => {
    return true;
}

module.exports.help = {
    description: 'Get help for a command',
    usage: 'help [command]',
    minArgs: 1,
    maxArgs: 1,
    base: async (Eris, bot, serverId, msg, text, args) => {
        help.sendHelp(args[0], msg.channel);
    }
}

module.exports.ping = {
    description: 'Get bot\'s ping',
    usage: 'ping',
    maxArgs: 0,
    base: async (Eris, bot, serverId, msg, text, args) => {
        let p = await ping.promise.probe('discordapp.com');
        msg.channel.createMessage(`:white_check_mark: \`Current ping: ${p.time}ms\``);
    }
}

module.exports.uptime = {
    description: 'Get bot\'s uptime',
    usage: 'uptime',
    maxArgs: 0,
    base: async (Eris, bot, serverId, msg, text, args) => {
        let p = await ping.promise.probe('discordapp.com');
        msg.channel.createMessage(`:white_check_mark: \`Uptime: ${bot.uptime / 1000}s\``);
    }
}

module.exports.specialthanks = {
    description: 'List of people who helped develop this bot',
    usage: 'specialthanks',
    maxArgs: 0,
    alias: 'spthx',
    base: async (Eris, bot, serverId, msg, text, args) => {
        let embed = new embedBuilder.Embed();
        let cnf = await config.getServer(serverId, 'oxyde');
        embed.setTitle('Special thanks');
        embed.setDescription('This bot wouldn\'t have been possible without these awesome people:\n```')
        embed.setColor(cnf.color);
        message.channel.createMessage({
            embed: embed.get()
        });
    }
}

module.exports.say = {
    description: 'Make the bot say something',
    usage: 'say [text]',
    minArgs: 1,
    base: async (Eris, bot, serverId, msg, text, args) => {
        msg.channel.createMessage(`\`${text}\``);
    }
}

module.exports.calculate = {
    description: 'Evaluate a math expression',
    usage: 'calculate [expression]',
    minArgs: 1,
    alias: 'calc',
    base: async (Eris, bot, serverId, msg, text, args) => {
        let val = 0;
        try {
            val = mathEval.eval(text);
        }
        catch (err) {
            msg.channel.createMessage(`:no_entry: \`Invalid expression!\``);
            return;
        }
        msg.channel.createMessage(`:white_check_mark: \`${text} = ${val}\``);
    }
}

module.exports.random = {
    description: 'Generate a random number',
    usage: 'random [min] [max]',
    minArgs: 2,
    maxArgs: 2,
    alias: 'rand',
    base: async (Eris, bot, serverId, msg, text, args) => {
       let min = parseInt(args[0]);
       let max = parseInt(args[1]);
       if (min == undefined || max == undefined) {
           help.sendHelp('random', msg.channel);
       }
       msg.channel.createMessage(`:white_check_mark: \`${Math.round((Math.random() * (max - min)) + min)}\``);
    }
}

module.exports.avatar = {
    description: 'Get a user\'s avatar',
    usage: 'avatar [user]',
    minArgs: 1,
    maxArgs: 1,
    minMentions: 1,
    maxMentions: 1,
    base: async (Eris, bot, serverId, msg, text, args) => {
        let url = `${msg.author.avatarURL.split('?')[0]}?size=4096`;
        let embed = new embedBuilder.Embed();
        let cnf = await config.getServer(serverId, 'oxyde');
        embed.setAuthor(`${msg.author.username}#${msg.author.discriminator}`, url, url);
        embed.setImage(url);
        embed.setColor(cnf.color);
        msg.channel.createMessage({
            embed: embed.get()
        });
    }
}

module.exports.serverinfo = {
    description: 'Get info about the server',
    usage: 'serverinfo',
    maxArgs: 0,
    base: async (Eris, bot, serverId, msg, text, args) => {
        let cnf = await config.getServer(serverId, 'oxyde');
        let guild = msg.channel.guild;
        let embed = new embedBuilder.Embed();
        embed.setColor(cnf.color);
        embed.setThumbnail(guild.iconURL);
        embed.setAuthor(guild.name, undefined, guild.iconURL);
        embed.addField('Member count', guild.memberCount, true);
        embed.addField('Region', guild.region, true);
        embed.addField('Created at', new Date(guild.createdAt).toUTCString(), true);
        embed.addField('Bot joined at', new Date(guild.joinedAt).toUTCString(), true);
        embed.setFooter(`Server ID: ${guild.id}`);
        msg.channel.createMessage({
            embed: embed.get()
        });
    }
}

module.exports.aesthetics = {
    description: 'Make the bot say something in an aesthetics font',
    usage: 'aesthetics [text]',
    minArgs: 1,
    alias: 'vapwav',
    base: async (Eris, bot, serverId, msg, text, args) => {
        msg.channel.createMessage(`\`${aesthetics(text)}\``);
    }
}

module.exports.mock = {
    description: 'Make the bot say something in an mocking font',
    usage: 'mock [text]',
    minArgs: 1,
    base: async (Eris, bot, serverId, msg, text, args) => {
        let str = '';
        for (var i = 0; i < text.length; i++) {
            str += Math.random() >= 0.5 ? text[i].toUpperCase() : text[i]; 
        }
        msg.channel.createMessage(`\`${str}\``);
    }
}

const leetspeak = {
    'a': '4',
    'e': '3',
    'i': '1',
    'l': '1',
    'o': '0',
    's': '5',
    't': '7',
    'z': '2',
};

module.exports.leetspeak = {
    description: 'Turn text into leet speak',
    usage: 'leetspeak [text]',
    minArgs: 1,
    alias: 'leet',
    base: async (Eris, bot, serverId, msg, text, args) => {
        let str = '';
        text = text.toLowerCase();
        for (let i = 0; i < text.length; i++) {
            str += leetspeak[text[i]] || text[i];
        }
        msg.channel.createMessage(`\`${str}\``);
    }
}

const dest = ['the CIA', 'the KGB', 'Moscow', 'Microsoft', 
            'Google Ads', 'a nigerian prince', 'a russian hacker',
            'your parents', 'your local scammers', 'indian tech support scammers', 
            'the IRS'];

module.exports.whatsmytoken = {
    description: 'Get your discord token (this is a joke ok...)',
    usage: 'whatsmytoken [text]',
    minArgs: 0,
    maxArgs: 0,
    base: async (Eris, bot, serverId, msg, text, args) => {
        msg.channel.createMessage(`:white_check_mark: \`Your token is ${Buffer.from(msg.member.user.id).toString('base64')}.******.***************************, this will be sent to ${dest[Math.round(Math.random() * (dest.length - 1))]}.\``);
    }
}

module.exports.lmgtfy = {
    description: 'Get a custom link to lmgtfy.com',
    usage: 'lmgtfy [search]',
    minArgs: 1,
    base: async (Eris, bot, serverId, msg, text, args) => {
        msg.channel.createMessage(`https://lmgtfy.com/?q=${encodeURIComponent(text)}`);
    }
}