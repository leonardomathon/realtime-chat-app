const moment = require('moment');

const messageTypes = {
    JOINROOM: 1,
    LEAVEROOM: 2,
    MESSAGE: 3,
    BOTMESSAGE: 4,
    COMMAND: 5,
};

function formatMessage(user, text, type) {
    if (text.startsWith('\\')) {
        return formatCommand(user, text, type);
    }
    return {
        user,
        text,
        time: moment().format('h:mm a'),
        type,
    };
}

function formatCommand(user, text, type) {
    let html;
    switch (text) {
        case '\\jorg':
            html = '<img src="./images/75.png" alt="">';
            break;
        case '\\time':
            html = `<p>The current time is ${moment().format('h:mm a')}</p>`;
            break;
        default:
            html = '<p>This command is invalid</p>';
            break;
    }
    return {
        user,
        text,
        time: moment().format('h:mm a'),
        type: messageTypes.COMMAND,
        html,
    };
}

module.exports = {
    messageTypes,
    formatMessage,
};
