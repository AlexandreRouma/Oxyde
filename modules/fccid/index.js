const help = require('../../utils/help');
const embedBuilder = require('../../utils/embedBuilder');
const config = require('../../utils/config');
const modMgr = require('../../utils/modMgr');
const https = require('https');

module.exports._info_ = {
    description: 'fccid.io commands',
    version: '1.0.0',
    author: 'Ryzerth'
}

module.exports._init_ = (Eris, bot) => {
    return true;
}

async function fccGet(id) {
    let opt = {
        hostname: 'fccid.io',
        port: 443,
        path: `/${id}`,
        method: 'GET'
    };
    return new Promise((resolve, rej) => {
        let req = https.request(opt, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(data);
            });
        });
        req.on('error', (e) => {
            rej(e);
        });
        req.end();
    });
    
}

async function queryId(id) {
    let src = await fccGet(id);
    let back = src;
    back = back.substr(back.indexOf('<h4><i>') + 7)
    back = back.substr(0, back.indexOf(' <b>'));
    let brand = back.substr(0, back.indexOf('</i>'))
    let desc = back.substr(back.indexOf('</i>') + 5)
    src = src.substr(src.indexOf('<div class="panel-body">'));
    src = src.substr(src.indexOf('<table class="table">'));
    src = src.substr(0, src.indexOf('</table>'));
    let table = src.split('\n').filter((line) => line.startsWith('<tr><td>'));
    let ranges = [];
    for (let i = 0; i < table.length; i++) {
        let range = {};

        let rangeStart = table[i].indexOf('">') + 2;
        let rangeLength = table[i].indexOf('</a>') - rangeStart;

        let powerStart = table[i].indexOf('</td><td>') + 9;
        let powerTmp = table[i].substr(powerStart);
        let powerLength = powerTmp.indexOf('</td><td>');

        let part = powerTmp.substr(powerTmp.indexOf('">') + 2);
        part = part.substr(0, part.indexOf('</a>'));

        range.range = table[i].substr(table[i].indexOf('">') + 2).substr(0, rangeLength);
        range.power = powerTmp.substr(0, powerLength);
        range.part = part;
        ranges.push(range);
    }
    return {
        brand: brand,
        description: desc,
        freqs: ranges,
    };
}

module.exports.fccid = {
    description: 'Get info about a FCC ID',
    usage: 'fccid [id]',
    minArgs: 1,
    maxArgs: 1,
    base: async (Eris, bot, serverId, msg, text, args) => {
        let info = await queryId(args[0].toUpperCase());
        if (info.brand == '') {
            msg.channel.createMessage(`:no_entry: \`Unknown ID\``);
            return;
        }
        let cnf = await config.getServer(serverId, 'oxyde');
        let embed = new embedBuilder.Embed();
        embed.setTitle(`${info.description} (${info.brand})`);
        embed.setColor(cnf.color);
        for (let i = 0; i < info.freqs.length; i++) {
            embed.addField(info.freqs[i].range, `${info.freqs[i].power}, ${info.freqs[i].part}`, true);
        }
        embed.setUrl(`https://fccid.io/${args[0].toUpperCase()}`);
        msg.channel.createMessage({
            embed: embed.get()
        });
    }
}