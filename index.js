const TelegramBot = require('node-telegram-bot-api');
const token = '567329102:AAGnlg2pk3QrOyb9Gd5HLY2KDtO2h6V5wPU';
const bot = new TelegramBot(token, {polling: true});
const helpers = require('./helpers');
const keyboards = require('./keyboard');
const kb = require('./keyboard-buttons');
const frases = require('./frases');
const database = require('./database');
var schedule = require('node-schedule');
const TelegramCacheChatMessages = require('node-telegram-cache-chat-messages');

const casheMessages = new TelegramCacheChatMessages({
    bot,
    all: true,
    edited: true
});

bot.onText(/\/start/, (msg) => {
    delete msg.chat.type;
    msg.chat.state = 'week1';
    database.updateData('users/' + msg.chat.id, msg.chat);
    bot.sendMessage(msg.chat.id, frases.start(msg.chat.first_name), keyboards.home).then(() => {
        database.getData('tasks/start/task', function (task, error) {
            if (!error) {
                bot.sendMessage(msg.chat.id, task, keyboards.home).then(dat => {
                    setTimeout(function () {
                        bot.sendMessage(msg.chat.id, frases.team_ask(msg.chat.first_name), keyboards.team_ready)
                        setTimeout(function () {
                            bot.sendMessage(msg.chat.id, frases.start_marathon(msg.chat.first_name))
                        }, 300000)
                    }, 10000)
                })
            }
        })

    });
});

bot.onText(/\/help/, msg => {
    bot.sendMessage(msg.chat.id, frases.rules, keyboards.home)
})
bot.onText(/\/next/, msg => {
    var s = new Date().getTime()
    database.getData('/', function (data, error) {
        if (!error) {
            for (var temp in data.users) {
                var state = data.users[temp].state;
                data.users[temp].archive = {};
                data.users[temp].archive[frases.week_map[frases.week_map.indexOf(state) - 1]] = data.users[temp].report;

                if (state === 'week1' || state === 'week2' || state === 'week3' || state === 'week4') {
                    if (state !== 'week4' && (data.users[temp].report === '' || data.users[temp].report === undefined)) {
                        if (data.users[temp].rebuke) {
                            bot.sendMessage(temp, frases.excluded(data.users[temp].first_name));
                            delete data.groups[data.users[temp].team][temp];
                            delete data.users[temp].team;
                            delete data.users[temp].rebuke;
                            data.users[temp].state = 'disabled';
                            continue
                        } else {
                            bot.sendMessage(temp, frases.rebuke(data.users[temp].first_name));
                            data.users[temp].rebuke = true;
                        }
                    }
                    if (data.users[temp].state !== 'disabled') {
                        var week = frases.week_map[frases.week_map.indexOf(state) + 1];
                        if (week === '')
                            delete data.users[temp].rebuke;
                        data.users[temp].state = week;
                        data.users[temp].report = '';
                        bot.sendMessage(temp, data.tasks[state].task);
                    }
                    if (data.users[temp].state !== 'disabled' && data.users[temp].state !== 'week4' && (data.users[temp].team) &&
                        Object.keys(data.groups[data.users[temp].team]).length <= 2) {
                        delete data.groups[data.users[temp].team];
                        delete data.users[temp].team;
                        bot.sendMessage(temp, frases.team_ask(data.users[temp].first_name), keyboards.team_ready)
                    }
                }
                else if (state === 'disabled') {
                    bot.sendMessage(temp, 'Напишите /start чтобы начать заново', keyboards.home)
                }
            }
            database.setData('/', data)
        }
    })
    console.log((new Date().getTime() - s) / 1000 + ' ns')
})

bot.on('message', function (msg) {
    var chatId = msg.chat.id;
    if (msg.text === kb.home.report) {
        bot.sendMessage(chatId, frases.report, keyboards.cancel_report)
    }
    else if (msg.text === kb.home.rules) {
        bot.sendMessage(chatId, frases.rules, keyboards.home)
    }
    else if (msg.text === 'Отменить ❌') {
        bot.sendMessage(chatId, 'Отменено', keyboards.home)
    }
    else {
        var messages = casheMessages.messages(chatId);
        var lastMessage = messages[messages.length - 2];
        var isReport = false;
        if (lastMessage !== undefined && lastMessage.text === kb.home.report && msg.text !== 'Отменить ❌') {
            database.updateData('users/' + chatId, {report: msg.text});
            bot.sendMessage(chatId, frases.success_report, keyboards.home);
            isReport = true;
        }
        if (msg.text.slice(0, 1) !== '/') {
            database.getData('users/' + chatId, function (user, error) {
                if (!error && user.team) {
                    database.getData('groups/' + user.team, team => {
                        if (isReport) {
                            msg.text = '<b>Отчет:</b>\n' + '<pre>' + msg.text + '</pre>';
                        }
                        for (var temp in team) {
                            if ((temp !== 'isNotFull') && (+temp !== +chatId)) {
                                bot.sendMessage(temp, frases.user_message(chatId, user.first_name, msg.text), {parse_mode: 'HTML'})
                            }
                        }
                    })
                }
            })

        }

    }
})


bot.on('callback_query', query => {
    const {chat, message_id, text} = query.message;
    console.log(query.data);
    if (query.data === 'team_ready_yes') {
        database.getData('users/' + chat.id, function (user, error) {
            if (!error && !user.team) {
                database.getData('groups/', function (groups) {
                    if (!error) {

                        var isJoin = false;
                        for (var temp in groups) {
                            if (groups[temp].isNotFull) {
                                groups[temp][chat.id] = chat;
                                // console.log(Object.keys(groups[temp]).length);
                                database.updateData('users/' + chat.id, {team: temp});
                                if (Object.keys(groups[temp]).length === 7)
                                    groups[temp].isNotFull = false;
                                database.updateData('groups/' + temp, groups[temp]);
                                isJoin = true;
                                break;
                            }
                        }
                        if (!isJoin) {
                            delete chat.type;
                            var uploadData = {
                                isNotFull: true,
                            }
                            uploadData[chat.id] = chat;
                            database.pushData('groups/', uploadData).then(groupId => {
                                database.updateData('users/' + chat.id, {team: groupId[1]})
                            })
                        }
                        bot.editMessageText(frases.team_success, {
                            chat_id: chat.id,
                            message_id: message_id
                        })
                    }
                })
            } else {
                bot.editMessageText('Вы уже состоите в группе', {
                    chat_id: chat.id,
                    message_id: message_id
                })
            }
        })
    }


    // try {
    //     // console.log(JSON.parse(query.data).timeout)
    //     switch (query.data) {//(JSON.parse(query.data).type) {
    //         case kb.more.plan.callback_data:
    //             bot.sendMessage(chat.id, frases.plan, keyboards.more)//, keyboards.getMoreKeyboard(JSON.parse(query.data).back));
    //             break;
    //
    //         case kb.more.aboutTime.callback_data:
    //             bot.sendMessage(chat.id, frases.aboutTime, keyboards.more)//, keyboards.getMoreKeyboard(JSON.parse(query.data).back));
    //             break;
    //
    //         case kb.more.aboutHelp.callback_data:
    //             bot.sendMessage(chat.id, frases.aboutHelp, keyboards.more)//, keyboards.getMoreKeyboard(JSON.parse(query.data).back));
    //             break;
    //
    //         case kb.more.difference.callback_data:
    //             bot.sendMessage(chat.id, frases.difference, keyboards.more)//, keyboards.getMoreKeyboard(JSON.parse(query.data).back));
    //             break;
    //
    //     }
    // } catch (e) {
    // }

    // bot.deleteMessage(chat.id, message_id).catch(function () {
    //     console.log('delete error')
    // });
});

console.log('bot has been started');
