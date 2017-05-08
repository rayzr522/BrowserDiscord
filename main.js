function $(query) {
    let result = document.querySelectorAll(query);
    if (result.length <= 1) {
        return result[0];
    }
    return result;
}

function mentionUser(id) {
    let message = messageInput.value;
    if (!message.endsWith(' ')) {
        message += ' ';
    }

    message += `<@${id}> `;

    messageInput.value = message;
    messageInput.focus();
}

function qs(key, value) {
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
}

function ls(key, value) {
    if (!value) {
        return localStorage.getItem(key);
    }
    return localStorage.setItem(key, value);
}

var bot;

var chatContainer = $('#chat');
var messageInput = $('#message');

function log(message, level) {
    console.info(message);
    say('Console', `[${level || 'INFO'}] ${message}`);
}

let lastUser = null;
function say(username, message, id) {
    if (lastUser !== username) {
        lastUser = username;
        let html = `<h4`;
        if (id) {
            html += ` onclick="mentionUser('${id}')"`;
        }
        html += `>${username}</h4>`;

        chatContainer.innerHTML += html;
    }

    chatContainer.innerHTML += message + '<br/>';
    chatContainer.scrollTop = chatContainer.scrollHeight + 1e3;
}

function logMessage(message) {
    let content = message.cleanContent.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    console.log(`[${message.author.username}] ${content}`);
    say(message.member.nickname || message.author.username, content, message.author.id);

    message.attachments.forEach(attachment => {
        if (/\.(png|jpg|jpeg|gif|webp)/gi.test(attachment.filename)) {
            chatContainer.innerHTML += `<img class="attachment" src="${attachment.proxyURL}" onclick="window.open('${attachment.url}').focus()"></img>`;
        }
    });
}

function sendMessage(message) {
    if (!bot || !bot.targetChannel) {
        log('You must select a channel first!');
    } else {
        bot.targetChannel.sendMessage(message);
    }
}

let channelContainer = $('#channels');
function updateChannels() {
    let html = '<ul>';

    bot.guilds.forEach(guild => {
        html += `<li class="guild" onclick="this.nextSibling.classList.toggle('hidden')">${guild.name}</li><ul class="hidden">`;
        guild.channels.filter(channel => channel.type === 'text').forEach(channel => {
            html += `<li onclick="setChannel('${channel.id}')">${channel.name}</li>`;
        });
        html += '</ul>'
    });

    html += '</ul>';

    channelContainer.innerHTML = html;
}

function setChannel(channel) {
    let newChannel = bot.targetChannel = bot.channels.get(channel);

    ls('discord.channel', channel);

    log(`Connected to ${newChannel.guild.name} in #${newChannel.name} (${newChannel.id})`);
    log('Loading history...');

    newChannel.fetchMessages({ limit: 10 }).then(messages => {
        log(`Loaded ${messages.size} messages`);
        messages.array().reverse().forEach(logMessage);
    });
}

function setupBot(token) {
    if (bot) {
        log('Killing old instance...');
        return bot.destroy().then(() => {
            bot = null;
            setupBot();
        });
    }

    log('Setting up bot...');

    bot = new Discord.Client();

    log('Client created');

    bot.on('ready', () => {
        ls('token');

        updateChannels();

        log(`Connected as ${bot.user.username}#${bot.user.discriminator}`);

        let channel = ls('discord.channel') || qs('channel');
        if (channel) {
            setChannel(channel);
        }
    });

    bot.on('message', message => {
        if (!bot.targetChannel) return;

        if (message.channel.id === bot.targetChannel.id) {
            logMessage(message);
        }
    });

    bot.login(token);
}

messageInput.onkeyup = function (event) {
    if (event.keyCode === 13) {
        let message = messageInput.value;
        messageInput.value = '';

        if (message) {
            sendMessage(message);
        }
    }
}

function main() {
    let token = ls('discord.token') || qs('token');
    if (!token) {
        return log('Please set a bot token!');
    }

    setupBot(token);
}

main();