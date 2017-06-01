const clean = require('./clean');

/**
 * 
 * 
 * @param {string} query The query.
 * @returns {HTMLElement|undefined} An HTML element or array of elements matching the query.
 */
function $(query) {
    let result = document.querySelectorAll(query);
    if (result.length <= 1) {
        return result[0];
    }
    return result;
}

class View {
    constructor(bot) {
        this.bot = bot;

        /**
         * The output for chat messages
         * 
         * @type {HTMLDivElement}
         */
        this.chatContainer = $('#chat');

        /**
         * The message input box
         * 
         * @type {HTMLInputElement}
         */
        this.messageInput = $('#message-input');

        this.messageInput.onkeyup = event => {
            if (event.keyCode === 13) {
                let message = this.messageInput.value;
                this.messageInput.value = '';

                if (message) {
                    this.bot.sendMessage(message);
                }
            }
        }

        /**
         * The guild list container
         * 
         * @type {HTMLDivElement}
         */
        this.guildContainer = $('#guilds');

        /**
         * The channel list container
         * 
         * @type {HTMLDivElement}
         */
        this.channelContainer = $('#channels');

        /**
         * The ID of the last user to send a message
         * 
         * @type {string}
         */
        this.lastUser = null;
    }

    get targetGuild() {
        return this.bot.targetGuild;
    }

    get targetChannel() {
        return this.bot.targetChannel;
    }

    updateGuilds() {
        let html = '';

        this.bot.client.guilds.array()
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(guild => {
                html += `<img class="guild-icon`;
                if (this.targetGuild === guild.id) {
                    html += ` guild-icon-selected`;
                }
                html += `" onclick="bot.setGuild('${guild.id}')" src="${guild.iconURL || '//placehold.it/250'}"></img>`;
            });

        this.guildContainer.innerHTML = html;
    }

    updateChannels() {
        console.log('Updating channels...');
        if (!this.targetChannel) {
            console.error('No target channel!');
            return;
        }

        let html = '';

        this.targetGuild.channels.filter(channel => channel.type === 'text').forEach(channel => {
            html += `<span class="channel" onclick="bot.setChannel('${channel.id}')">#${channel.name}</span>`;
        });

        this.channelContainer.innerHTML = html;
    }

    /**
     * Adds a user mention to the message input box.
     * 
     * @param {string} id The ID of the user to @mention.
     * 
     * @memberof View
     */
    mentionUser(id) {
        let message = this.messageInput.value;
        if (!message.endsWith(' ')) {
            message += ' ';
        }

        message += `<@${id}> `;

        this.messageInput.value = message;
        this.messageInput.focus();
    }

    /**
     * Prints a message onto the chat area.
     * 
     * @param {Message} message The message to log.
     * 
     * @memberof View
     */
    displayMessage(message) {
        let content = clean.discordToHtml(this.bot, message.content);

        console.log(`[${message.author.username}] ${content}`);

        let builder = `<div class="message">`

        if (this.lastUser !== message.author.id) {
            this.lastUser = message.author.id;

            let name = message.author.username;
            if (message.member && message.member.nickname) {
                name = message.member.nickname;
            }

            builder += `<span class="message-name" onclick="bot.view.mentionUser('${message.author.id}')">${name}</span><br/>`;
        }

        builder += `<span class="message-body">${content}</span><br/>`;

        builder += `</div>`;

        this.chatContainer.innerHTML += builder;

        while (this.chatContainer.children.length > 50) {
            this.chatContainer.removeChild(this.chatContainer.firstChild);
        }

        message.attachments.forEach(attachment => {
            if (/\.(png|jpg|jpeg|gif|webp)/gi.test(attachment.filename)) {
                this.chatContainer.innerHTML += `<img class="message-attachment" src="${attachment.proxyURL}" onclick="window.open('${attachment.url}').focus()"></img>`;
            }
        });

        this.scrollDown();
    }

    hideSplash() {
        $('#splash').hidden = true;
    }

    scrollDown() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight + 1e3;
    }
}

module.exports = View;