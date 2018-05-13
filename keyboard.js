const kb = require('./keyboard-buttons');
const frases = require('./frases');
module.exports = {
    team_ready: {
        // parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [kb.team_ready_yes],
            ]
        }
    },
    home: {
        // parse_mode: 'HTML',
        reply_markup: {
            keyboard: [
                [kb.home.report],
                [kb.home.rules]
            ]
        }
    },
    cancel_report: {
        // parse_mode: 'HTML',
        reply_markup: {
            keyboard: [
                [kb.cancel_report]
            ]
        }
    }
}