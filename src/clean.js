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