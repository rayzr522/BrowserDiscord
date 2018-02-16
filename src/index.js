const storage = require('./storage');
const View = require('./view');

class Bot {
    constructor(token) {
        if (!token) {
            return console.log('Please set a bot token!');
        }

        storage.ls('discord.token', token);
        this.token = token;

        this.view = new View(this);

        this.setupBot();
    }

    setupBot() {
        if (this.client) {
            return this.client.destroy().then(() => {
                this.client = null;
                this.setupBot();
            });
        }

        this.client = new Discord.Client();

        console.log('Client created');

        this.client.on('ready', () => {
            this.view.hideSplash();
            this.view.updateGuilds();
            this.view.updateChannels();

            console.log(`Connected as ${this.client.user.username}#${this.client.user.discriminator} (${this.client.user.id})`);

            let channel = storage.ls('discord.channel') || storage.qs('channel');
            if (channel) {
                this.setChannel(channel);
            } else {
                let guild = storage.ls('discord.guild') || storage.qs('guild');
                if (guild) {
                    this.setGuild(guild);
                }
            }
        });

        this.client.on('message', message => {
            if (!this.targetChannel) return;

            if (message.channel.id === this.targetChannel.id) {
                this.view.displayMessage(message);
            }
        });

        this.client.login(this.token);
    }

    setGuild(guild) {
        if (this.targetGuild && this.targetGuild.id === guild) {
            return;
        }

        this.targetGuild = this.client.guilds.get(guild);

        storage.ls('discord.guild', guild);

        this.view.updateGuilds();
        this.view.updateChannels();
    }

    setChannel(channel) {
        if (this.targetChannel && this.targetChannel.id === channel) {
            return;
        }

        let newChannel = this.targetChannel = this.client.channels.get(channel);
        if (newChannel.type !== 'text') {
            return;
        }

        this.setGuild(newChannel.guild.id);

        storage.ls('discord.channel', channel);

        console.log('Fetching messages...');
        newChannel.messages.fetch({ limit: 10 }).then(messages => {
            messages.array().reverse().forEach(message => {
                this.view.displayMessage(message);
            });
        });
    }

    sendMessage(message) {
        if (!this.client || !this.targetChannel) {
            console.log('You must select a channel first!');
        } else {
            this.targetChannel.send(message);
        }
    }
}

window.bot = window.bot || new Bot(storage.ls('discord.token') || storage.qs('token') || prompt('Please enter a token:'));