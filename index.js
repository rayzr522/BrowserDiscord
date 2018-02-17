/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/**
 * @param {string} key The key of the property to get.
 * @param {any} value The (optional) value to set. Leave undefined to get a property.
 * 
 * @returns {any} The value stored under the given key, or undefined if setting a value.
 */
exports.ls = function ls(key, value) {
    if (!value) {
        return localStorage.getItem(key);
    }
    return localStorage.setItem(key, value);
};

exports.qs = function qs(key, value) {
    let location = window.location.search;
    if (location.indexOf('?') < 0) return;

    let raw = location.substr(location.indexOf('?') + 1);

    let mapped = {};
    raw.split('&')
        .map(item => item.split('='))
        .forEach(item => mapped[item[0]] = decodeURI(item[1]));

    if (!key) {
        return mapped;
    }

    if (value) {
        if (mapped[key] === value) {
            return;
        }

        mapped[key] = value;

        let newQueryString = '';
        for (let key in mapped) {
            newQueryString += `${newQueryString.length < 1 ? '?' : '&'}${key}=${encodeURI(mapped[key])}`
        }
        window.location.search = newQueryString;

        return;
    }

    return mapped[key];
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const clean = __webpack_require__(2);

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

        this.bot.client.guilds.forEach(guild => {
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

        this.targetGuild.channels.forEach(channel => {
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
                this.chatContainer.innerHTML += `<img class="attachment" src="${attachment.proxyURL}" onclick="window.open('${attachment.url}').focus()"></img>`;
            }
        });

        this.scrollDown();
    }

    scrollDown() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight + 1e3;
    }
}

module.exports = View;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

exports.discordToHtml = function (bot, input) {
    return input.replace(/<#(\d{18})>/g, (_, id) => {
        const channel = bot.client.channels.get(id) || { name: 'deleted-channel' };
        return `<a onclick="bot.setChannel('${id}')">#${channel.name}</a>`;
    }).replace(/<@\!?(\d{18})>/g, (_, id) => {
        const user = bot.client.users.get(id) || { username: id };
        return `<a onclick="bot.view.mentionUser('${id}')">@${user.username}</a>`
    }).replace(/<:.*?:(\d{18})>/g, (_, id) => {
        const emoji = bot.client.emojis.get(id);
        if (emoji && emoji.url) {
            return `<img class="emoji" src="${emoji.url}"></img>`;
        }
        return _;
    });
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

const storage = __webpack_require__(0);
const View = __webpack_require__(1);

class Bot {
    constructor(token) {
        if (!token) {
            return log('Please set a user token!');
        }

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
        if (this.targetGuild === guild) {
            return;
        }

        let newGuild = this.targetGuild = this.client.guilds.get(guild);

        storage.ls('discord.guild', guild);

        this.view.updateGuilds();
        this.view.updateChannels();
    }

    setChannel(channel) {
        if (this.targetChannel === channel) {
            return;
        }

        let newChannel = this.targetChannel = this.client.channels.get(channel);
        if (newChannel.type !== 'text') {
            return;
        }

        this.setGuild(newChannel.guild.id);

        storage.ls('discord.channel', channel);

        console.log('Fetching messages...');
        newChannel.fetchMessages({ limit: 10 }).then(messages => {
            messages.array().reverse().forEach(message => {
                this.view.displayMessage(message);
            });
        });
    }

    sendMessage(message) {
        if (!bot.client || !bot.targetChannel) {
            console.log('You must select a channel first!');
        } else {
            bot.targetChannel.sendMessage(message);
        }
    }
}

window.bot = window.bot || new Bot(storage.ls('discord.token') || storage.qs('token'));

/***/ })
/******/ ]);