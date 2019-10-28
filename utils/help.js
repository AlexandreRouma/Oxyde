const modMgr = require('./modMgr');
const config = require('./config');
const embedBuilder = require('./embedBuilder');

module.exports.sendHelp = async (command, channel) => {
    let cnf = await config.getServer(channel.guild.id, 'oxyde')
    let cmd = modMgr.commands[command];
    if (!cmd) {
        channel.createMessage(`:no_entry: \`Unknown command!\``);
        return;
    }
    let embed = new embedBuilder.Embed();
    embed.setTitle(cmd.name);
    embed.setDescription(cmd.description);
    embed.setColor(cnf.color);
    embed.addField('Usage', `\`${cmd.usage}\``, false);
    embed.addField('Owner Only', cmd.ownerOnly ? 'Yes' : 'No', true);
    embed.addField('Admin Only', cmd.adminOnly ? 'Yes' : 'No', true);
    embed.addField('Module', cmd.module, false);
    channel.createMessage({
        embed: embed.get()
    });
}