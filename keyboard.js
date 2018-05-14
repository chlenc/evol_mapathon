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
        reply_markup: {
            keyboard: [
                [kb.home.report],
                [kb.home.about_me],
                [kb.home.rules]
            ]
        }
    },home_HTML: {
        parse_mode: 'HTML',
        reply_markup: {
            keyboard: [
                [kb.home.report],
                [kb.home.about_me],
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