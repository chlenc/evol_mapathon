const TelegramBot = require('node-telegram-bot-api');
const token = /*'459914749:AAE38mka1v9hyxYk1l2aihXBN05lRlM0Oi8'*/'567329102:AAGnlg2pk3QrOyb9Gd5HLY2KDtO2h6V5wPU';
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
    database.getData('users/' + msg.chat.id, function (data, error) {
        if (error || data.state !== 'disabled') {
            delete msg.chat.type;
            msg.chat.state = 'week1';
            msg.chat.start_date = helpers.convert_date(new Date());
            database.updateData('users/' + msg.chat.id, msg.chat);
            database.setData('archive/' + msg.chat.id, {start_date: msg.chat.start_date})
            bot.sendMessage(msg.chat.id, frases.start(msg.chat.first_name), keyboards.home).then(() => {
                bot.sendMessage(msg.chat.id, frases.rules, keyboards.home);
                database.getData('tasks/start/task', function (task, error) {
                    if (!error) {
                        bot.sendMessage(msg.chat.id, task, keyboards.home)
                    }
                })

            });
        } else {
            bot.sendMessage(msg.chat.id, 'Вы исключены из марафона')
        }
    })
});

bot.onText(/\/help/, msg => {
    bot.sendMessage(msg.chat.id, frases.rules, keyboards.home)
})

bot.onText(/\/sendGroups/, msg => {
    database.getData('users/', function (users, error) {
        if (!error) {
            for (var temp in users) {
                if (!users[temp].team) {
                    bot.sendMessage(temp, frases.team_ask(users[temp].first_name), keyboards.team_ready);
                }
            }
        }
    })
})

bot.onText(/\/sendMeGroup/, (msg) => {
    //console.log(arr[1])
    try {
        bot.sendMessage(msg.chat.id, frases.team_ask(msg.chat.first_name), keyboards.team_ready);
    } catch (e) {
        bot.sendMessage(msg.chat.id, e)
    }
})

bot.onText(/\/test/, msg => {
    // console.log(helpers.convert_date(new Date()))
    //
    // console.log(helpers.getState('2018-05-15'))
    //
    // database.getData('users',users=>{
    //     for(var temp in users){
    //         database.setData('archive/'+temp,{
    //             'start':'',
    //             'week1':'',
    //             'week2':'',
    //             'week3':'',
    //             'week4':'',
    //             'team_salute':''
    //         });
    //     }
    // })


    // database.getData('archive/' + msg.chat.id + '/team_salute',data=>{
    //     bot.sendMessage(msg.chat.id,data)
    // });


    // bot.sendMessage(msg.chat.id, 'Напишите /start чтобы начать заново',{
    //     reply_markup:{
    //         remove_keyboard:true
    //     }
    // })

})

const rule = new schedule.RecurrenceRule();
rule.hour = 8;
rule.minute = 1;

schedule.scheduleJob(rule, function () {
// bot.onText(/\/next/, msg => {
    database.getData('/', function (data, error) {
        if (!error) {
            for (var temp in data.users) {
                var state = data.users[temp].state;
                state = helpers.getState(data.users[temp].start_date, state);
                var diff = Math.floor((new Date().getTime() - new Date(data.users[temp].start_date).getTime()) / 1000 / 60 / 60 / 24);
                data.users[temp].report = (data.users[temp].report === undefined) ? '' : data.users[temp].report;
                data.archive[temp][helpers.convert_date(new Date())] = {
                    type: helpers.getState(data.users[temp].start_date, state, true),
                    report: data.users[temp].report
                };

                if (state === 'week1' || state === 'week2' || state === 'week3' || state === 'week4') {
                    if (diff !== 0 && state !== 'week4' && (data.users[temp].report === '' || data.users[temp].report === undefined)) {
                        if (data.users[temp].rebuke) {
                            bot.sendMessage(temp, frases.excluded(data.users[temp].first_name));
                            try {
                                //delete data.users[temp].rebuke;
                                if (data.users[temp].team !== undefined && data.users[temp].team !== null) {
                                    delete data.groups[data.users[temp].team][temp];
                                    delete data.users[temp].team;
                                }
                            } catch (e) {
                                console.log(e.toString())
                            }
                            data.users[temp].state = 'disabled';
                            continue;
                        } else {
                            bot.sendMessage(temp, frases.rebuke(data.users[temp].first_name));
                            data.users[temp].rebuke = true;
                        }
                    }
                    if (data.users[temp].state !== 'disabled') {
                        if (state === 'week4')
                            delete data.users[temp].rebuke;
                        data.users[temp].state = state;
                        data.users[temp].report = '';
                        bot.sendMessage(temp, data.tasks[state].task);
                    }
                    if (data.users[temp].state !== 'disabled' && data.users[temp].state !== 'week4' && (data.users[temp].team) &&
                        Object.keys(data.groups[data.users[temp].team]).length <= 2) {
                        delete data.groups[data.users[temp].team];
                        delete data.users[temp].team;
                        bot.sendMessage(temp, frases.team_ask(data.users[temp].first_name), keyboards.team_ready)
                    }
                    if (diff === 0) {
                        bot.sendMessage(temp, frases.team_ask(data.users[temp].first_name), keyboards.team_ready);
                        bot.sendMessage(temp, frases.start_marathon(data.users[temp].first_name));
                    }
                }
                // else if (state === 'disabled') {
                //     // bot.sendMessage(temp, 'Напишите /start чтобы начать заново', {
                //     //     reply_markup: {
                //     //         remove_keyboard: true
                //     //     }
                //     // })
                // }
            }

            database.setData('/', data);
            //database.updateData('users/' + temp + '/', {start_date: helpers.convert_date(new Date(data.users[temp].start_date), -1)});
        }
    })
});

bot.on('message', function (msg) {
    var chatId = msg.chat.id;
    if (msg.text === kb.home.report) {
        bot.sendMessage(chatId, frases.report, keyboards.cancel_report)
    }
    else if (msg.text === kb.home.about_me) {
        bot.sendMessage(chatId, frases.about_me, keyboards.cancel_report)
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
        if (lastMessage !== undefined && lastMessage.text === kb.home.about_me && msg.text !== 'Отменить ❌') {
            database.updateData('archive/' + chatId, {team_salute: msg.text});
            bot.sendMessage(chatId, frases.success_about_me, keyboards.home);
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
    // console.log(query.data);
    if (query.data === 'team_ready_yes') {
        database.getData('users/' + chat.id, function (user, error) {
            if (!error && !user.team) {
                database.getData('groups/', function (groups) {
                    if (!error) {
                        var isJoin = false;
                        database.getData('archive/', archive => {
                            for (var temp in groups) {
                                if (groups[temp].isNotFull) {
                                    groups[temp][chat.id] = chat;
                                    // console.log(Object.keys(groups[temp]).length);
                                    database.updateData('users/' + chat.id, {team: temp});
                                    if (Object.keys(groups[temp]).length === 7)
                                        groups[temp].isNotFull = false;
                                    database.updateData('groups/' + temp, groups[temp]);
                                    isJoin = true;

                                    var grout_users = '<b>Список участников группы:</b>\n';
                                    var count_grout_users = 1;

                                    for (var grout_user in groups[temp]) {
                                        if (grout_user !== 'isNotFull') {
                                            var team_salute = (archive[grout_user].team_salute === '' || archive[grout_user].team_salute === undefined) ? 'Нет данных :c' : archive[grout_user].team_salute;
                                            grout_users += `\n${count_grout_users}. ` + frases.user_link(grout_user, groups[temp][grout_user].first_name) +
                                                ':\n' + team_salute + '\n';
                                            count_grout_users++
                                        }
                                    }
                                    for (var grout_user in groups[temp]) {
                                        if (grout_user !== 'isNotFull') {
                                            bot.sendMessage(grout_user, grout_users, keyboards.home_HTML)
                                        }
                                    }

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
                                bot.sendMessage(chat.id, '<b>Список участников группы:</b>\n' + frases.user_link(chat.id, chat.first_name), keyboards.home_HTML)
                            }
                            bot.editMessageText(frases.team_success, {
                                chat_id: chat.id,
                                message_id: message_id
                            })
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

});

console.log('bot has been started');
