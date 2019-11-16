const help = require('../../utils/help');
const config = require('../../utils/config');
const logger = require('../../utils/logger');
const ytsearch = require('youtube-search');
const embedBuilder = require('../../utils/embedBuilder');
const ytdl = require('ytdl-core');

const AUDIO_COMMANDS_LOCAL_DEFAULT = {
    youtubeApiKey: 'INSERT_HERE'
}

let playlists = {};

class Playlist {
    constructor(bot, serverId) {
        this.bot = bot;
        this.serverId = serverId;
        this.items = [];
        this.playing = true;
    }

    async add(url, info, channelID) {
        this.playing = true;
        this.items.push({
            url: url,
            info: info
        })
        let vc = this.bot.voiceConnections.filter(c => c.id == this.serverId)[0];
        if (!vc) {
            try {
                vc = await this.bot.joinVoiceChannel(channelID);
            }
            catch (err) {
                console.log(err);
                return false;
            }
        }
        if (!vc.playing) {
            vc.play(ytdl(this.items[0].url));
            vc.on('end', () => {
                if (!this.playing) {
                    return;
                }
                this.items.shift();
                if (this.items.length == 0) {
                    this.stop();
                    return;
                }
                vc.play(ytdl(this.items[0].url));
            });
        }
    }

    remove(index) {
        this.items = this.items.splice(index, 1);
    }

    skip() {
        let vc = this.bot.voiceConnections.filter(c => c.id == this.serverId)[0];
        if (!vc) {
            return;
        }
        if (vc.playing) {
            vc.stopPlaying();
        }
    }

    stop() {
        this.playing = false;
        this.items = [];
        let vc = this.bot.voiceConnections.filter(c => c.id == this.serverId)[0];
        if (!vc) {
            return;
        }
        if (vc.playing) {
            vc.stopPlaying();
        }
        this.bot.leaveVoiceChannel(vc.channelID);
    }
}

module.exports._info_ = {
    description: 'Audio commands for Oxyde',
    version: '1.0.0',
    author: 'Ryzerth'
}

module.exports._init_ = (Eris, bot) => {
    return true;
}

function truncText(str, len) {
    let ret = '';
    if (str.length <= len) {
        return str;
    }
    ret = `${str.substr(0, len - 3)}...`;
}

module.exports.play = {
    description: 'Add a video to the playlist. Makes the bot join your channel if it\'s not already playing',
    usage: 'play [search/url]',
    minArgs: 1,
    base: async (Eris, bot, serverId, msg, text, args) => {
        if(!msg.member.voiceState.channelID) { // Check if the user is in a voice channel
            msg.channel.createMessage(':no_entry: `You are not currently in a voice channel`');
            return;
        }
        let vc = bot.voiceConnections.filter(c => c.id == serverId)[0];
        if (vc) {
            if(vc.channelID != msg.member.voiceState.channelID) { // Check if the user is in a voice channel
                msg.channel.createMessage(':no_entry: `You are not in the same voice channel as the bot`');
                return;
            }
        }
        config.initLocal('audio_commands', AUDIO_COMMANDS_LOCAL_DEFAULT);
        ytsearch(text, {maxResults: 10, key: config.getLocal('audio_commands').youtubeApiKey}, async (err, res) => {
            if (err) {
                logger.logWarn(`Youtube API Error: ${err}`);
                msg.channel.createMessage(':no_entry: `Youtube API error, please try again later!`');
                return;
            }
            let vids = res.filter(v => v.kind == 'youtube#video');
            if (!playlists[serverId]) {
                playlists[serverId] = new Playlist(bot, serverId);
            }
            let info = {
                link: vids[0].link,
                title: vids[0].title,
                description: vids[0].description,
                channel: vids[0].channelTitle,
                channelLink: `https://www.youtube.com/${vids[0].channelId}`,
                thumbnail: vids[0].thumbnails.high.url
            };
            playlists[serverId].add(vids[0].link, info, msg.member.voiceState.channelID);
            let cnf = await config.getServer(serverId, 'oxyde')
            let embed = new embedBuilder.Embed();
            embed.setColor(cnf.color);
            embed.setTitle(info.title);
            embed.setUrl(info.link);
            embed.setDescription(truncText(info.description, 200));
            embed.setThumbnail(info.thumbnail);
            embed.setFooter(info.channel);
            msg.channel.createMessage({
                embed: embed.get()
            });
        })
    }
}

module.exports.skip = {
    description: 'Skip to the next video in the playlist',
    usage: 'skip',
    base: async (Eris, bot, serverId, msg, text, args) => {
        if(!msg.member.voiceState.channelID) { // Check if the user is in a voice channel
            msg.channel.createMessage(':no_entry: `You are not currently in a voice channel`');
            return;
        }
        let vc = bot.voiceConnections.filter(c => c.id == serverId)[0];
        if (vc) {
            if(vc.channelID != msg.member.voiceState.channelID) { // Check if the user is in a voice channel
                msg.channel.createMessage(':no_entry: `You are not in the same voice channel as the bot`');
                return;
            }
        }
        if (!playlists[serverId]) {
            msg.channel.createMessage(':no_entry: `The bot isn\'t currently playing anything!`');
            return;
        }
        playlists[serverId].skip();
    }
}

module.exports.stop = {
    description: 'Stop the bot from playing music',
    usage: 'stop',
    base: async (Eris, bot, serverId, msg, text, args) => {
        if(!msg.member.voiceState.channelID) { // Check if the user is in a voice channel
            msg.channel.createMessage(':no_entry: `You are not currently in a voice channel`');
            return;
        }
        let vc = bot.voiceConnections.filter(c => c.id == serverId)[0];
        if (vc) {
            if(vc.channelID != msg.member.voiceState.channelID) { // Check if the user is in a voice channel
                msg.channel.createMessage(':no_entry: `You are not in the same voice channel as the bot`');
                return;
            }
        }
        if (!playlists[serverId]) {
            msg.channel.createMessage(':no_entry: `The bot isn\'t currently playing anything!`');
            return;
        }
        playlists[serverId].stop();
    }
}