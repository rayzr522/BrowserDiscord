function $(query) {
    let result = document.querySelectorAll(query);
    if (result.length <= 1) {
        return result[0];
    }
    return result;
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

var bot;

var chatContainer = $('#chat');
var messageInput = $('#message');

function log(message, level) {
    console.info(message);
    say('Console', `[${level || 'INFO'}] ${message}`);
}

let lastUser = null;
function say(username, message) {
    if (lastUser !== username) {
        lastUser = username;
        chatContainer.innerHTML += `<h4>${username}</h4>`;
    }
    chatContainer.innerHTML += message + '<br/>';
}

function sendMessage(message) {
    if (!bot.targetChannel) {
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

    qs('channel', channel);

    log(`Connected to ${newChannel.guild.name} in #${newChannel.name} (${newChannel.id})`);
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
        updateChannels();

        log(`Connected as ${bot.user.username}#${bot.user.discriminator}`);

        let channel = qs('channel');
        if (channel) {
            setChannel(channel);
        }
    });

    bot.on('message', message => {
        if (!bot.targetChannel) return;

        if (message.channel.id === bot.targetChannel.id) {
            say(message.author.username, message.cleanContent);
        }
    });

    bot.login(token);
}

(function () {
    let token = qs('token');
    if (!token) {
        return log('Please provide a bot token in the query string!');
    }

    setupBot(token);
})();

document.onkeyup = function (event) {
    if (event.keyCode === 13) {
        let message = messageInput.value;
        messageInput.value = '';

        if (message) {
            sendMessage(message);
        }
    }
}