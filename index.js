const fs = require('fs');
const config = require('./utils/config');
const logger = require('./utils/logger');
const Eris = require("eris");
const modMgr = require('./utils/modMgr');
const help = require('./utils/help');
const cmdListGen = require('./utils/cmdListGen');

const OXYDE_LOCAL_DEFAULT = {
    token: 'INSERT_HERE',
    ownerId: 'INSERT_HERE',
    modules: './modules/',
    showInvalidCommand: true,
    status: 'Oxyde Bot',
    cmdListRenewDelay: '86400'
}
const OXYDE_SERVER_DEFAULT = {
    adminRole: '',
    color: '#FF0000',
    prefix: '$'
}

let initialized = false;
let bot = undefined;

main();

async function main() {
    logger.setColor('red');
    console.log(fs.readFileSync('splash.txt').toString());
    logger.setColor('yellow');
    console.log(`\nVersion ${modMgr.info.version}`)
    logger.setColor('reset');

    await config.init('config/config.json', 'config/config.sqlite');
    await config.initLocal('oxyde', OXYDE_LOCAL_DEFAULT);
    
    let cnf = await config.getLocal('oxyde');

    bot = new Eris(cnf.token);

    bot.on("ready", async () => { // When the bot is ready
        if (initialized) {
            return;
        }
        logger.ok();
        modMgr.loadModules(cnf.modules, bot);
        await cmdListGen.renewLink();
        setInterval(cmdListGen.renewLink, cnf.cmdListRenewDelay * 1000);
        logger.log('Setting status');
        bot.editStatus('online', {name: cnf.status});
        logger.ok();
        initialized = true;
        logger.logInfo(`Ready! Logged in as '${bot.user.username}#${bot.user.discriminator}'`);
    });
    
    bot.on("messageCreate", commandHandler);

    logger.log('Connecting to the Discord API');
    bot.connect();
}

async function commandHandler(msg) {
    if (msg.author.id == bot.user.id) {
        return;
    }
    if (msg.channel.type != 0) {
        return;
    }
    await config.initServer(msg.channel.guild.id, 'oxyde', OXYDE_SERVER_DEFAULT);
    let cnf = await config.getServer(msg.channel.guild.id, 'oxyde');
    let localCnf = await config.getLocal('oxyde');
    if (!initialized) {
        return;
    }
    if (!msg.content.startsWith(cnf.prefix)) {
        return;
    }
    let cmdText = msg.content.substr(cnf.prefix.length);
    let parts = cmdText.split(' ');
    let cmdName = parts[0].toLowerCase();
    let text = cmdText.substr(cmdName.length + 1);
    let args = parts.slice(1);
    let cmd = modMgr.commands[cmdName];
    if (!cmd) {
        if (localCnf.showInvalidCommand) {
            msg.channel.createMessage(`:no_entry: \`Unknown command!\``);
        }
        return;
    }
    if (cmd.subCmds) {
        if (cmd.subCmds[args[0]]) {
            let subCmd = args[0].toLowerCase();
            args = args.slice(1);
            text = text.substr(subCmd.length + 1);
            cmd = cmd.subCmds[subCmd];
        }
    }
    // Permissions
    if (cmd.ownerOnly && msg.author.id != localCnf.ownerId) {
        msg.channel.createMessage(`:no_entry: \`You do not have permission to run this command!\``);
        return;
    }
    if (cmd.adminOnly && !msg.member.roles.includes(cnf.adminRole) && !msg.member.permission.has('administrator')) {
        msg.channel.createMessage(`:no_entry: \`You do not have permission to run this command!\``);
        return;
    }
    // Structure
    if (cmd.minArgs && args.length < cmd.minArgs) {
        help.sendHelp(modMgr.commands[cmdName].name, msg.channel);
        return;
    }
    if (cmd.maxArgs && args.length > cmd.maxArgs) {
        help.sendHelp(modMgr.commands[cmdName].name, msg.channel);
        return;
    }
    if (cmd.minMentions && msg.mentions.length < cmd.minMentions) {
        help.sendHelp(modMgr.commands[cmdName].name, msg.channel);
        return;
    }
    if (cmd.maxMentions && msg.mentions.length > cmd.maxMentions) {
        help.sendHelp(modMgr.commands[cmdName].name, msg.channel);
        return;
    }
    if (cmd.minRoleMentions && msg.roleMentions.length < cmd.minRoleMentions) {
        help.sendHelp(modMgr.commands[cmdName].name, msg.channel);
        return;
    }
    if (cmd.maxRoleMentions && msg.roleMentions.length > cmd.maxRoleMentions) {
        help.sendHelp(modMgr.commands[cmdName].name, msg.channel);
        return;
    }
    if (cmd.minChannelMentions && msg.channelMentions.length < cmd.minChannelMentions) {
        help.sendHelp(modMgr.commands[cmdName].name, msg.channel);
        return;
    }
    if (cmd.maxChannelMentions && msg.channelMentions.length > cmd.maxChannelMentions) {
        help.sendHelp(modMgr.commands[cmdName].name, msg.channel);
        return;
    }
    // Run
    cmd.base(Eris, bot, msg.channel.guild.id, msg, text, args);
}