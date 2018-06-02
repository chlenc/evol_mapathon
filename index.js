const TelegramBot = require('node-telegram-bot-api');
const token = /*'459914749:AAE38mka1v9hyxYk1l2aihXBN05lRlM0Oi8'*/'567329102:AAGnlg2pk3QrOyb9Gd5HLY2KDtO2h6V5wPU';
const bot = new TelegramBot(token, {polling: true});
const helpers = require('./helpers');
const keyboards = require('./keyboard');
const kb = require('./keyboard-buttons');
const frases = require('./frases');
const database = require('./database');
const schedule = require('node-schedule');
//const TelegramCacheChatMessages = require('node-telegram-cache-chat-messages');
const cache = require('memory-cache');
const adminTeam = -303753196;
const mainAdmins = [280914417];
// const casheMessages = new TelegramCacheChatMessages({
//     bot,
//     all: true,
//     edited: true
// });

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
    if (msg.chat.id === adminTeam || mainAdmins.indexOf(msg.chat.id) !== -1) {
        var text = 'Добрый вечер, друзья! Из-за сложной структуры бота возникали ошибки. Мы все отладили, только вам необходимо вернуться на шаг назад и пройти снова деление на группы. Благодарим вас за терпение, в конце марафона с нас бонус специально для вас, первопроходцев!)'

        database.getData('users/', function (users, error) {
            if (!error) {
                for (var temp in users) {
                    if (!users[temp].team) {
                        bot.sendMessage(temp, text, keyboards.team_ready);
                    }
                }
            }
        })
        bot.sendMessage(msg.chat.id, 'Готово ✅')
    }
})

bot.onText(/\/sendText (.+)/, (msg, array) => {
    if (msg.chat.id === adminTeam || mainAdmins.indexOf(msg.chat.id) !== -1) {
        var text = array[1];
        database.getData('users/', function (users, error) {
            if (!error) {
                for (var temp in users) {
                    bot.sendMessage(temp, text);
                }
            }
        })
        bot.sendMessage(msg.chat.id, 'Готово ✅')
    }
})

bot.onText(/\/sendMeGroup/, (msg) => {
    try {
        bot.sendMessage(msg.chat.id, frases.team_ask(msg.chat.first_name), keyboards.team_ready);
    } catch (e) {
        bot.sendMessage(msg.chat.id, e)
    }
})

bot.onText(/\/removeRebukes/, (msg) => {
    if (msg.chat.id === adminTeam || mainAdmins.indexOf(msg.chat.id) !== -1) {
        database.getData('users/', function (users, error) {
            if (!error) {
                for (var temp in users) {
                    if (users[temp].rebuke) {
                        database.removeData('users/' + temp + '/rebuke')
                    }
                }
            }
        });
        bot.sendMessage(msg.chat.id, 'Готово ✅')
    }
})

bot.onText(/\/enableAll/, (msg) => {
    if (msg.chat.id === adminTeam || mainAdmins.indexOf(msg.chat.id) !== -1) {
        database.getData('users/', function (users, error) {
            if (!error) {
                for (var temp in users) {
                    if (users[temp].state === "disabled") {
                        var state = helpers.getState(users[temp].start_date);
                        database.updateData('users/' + temp, {state: state})
                    }
                }
            }
        });
        bot.sendMessage(msg.chat.id, 'Готово ✅')
    }
})

bot.onText(/\/removeRebuke (.+)/, (msg, array) => { //error
    if (msg.chat.id === adminTeam || mainAdmins.indexOf(msg.chat.id) !== -1) {
        var id = array[1];
        database.getData('users/' + id, function (user, error) {
            if (!error) {
                if (user.rebuke) {
                    database.removeData('users/' + id + '/rebuke');
                    bot.sendMessage(msg.chat.id, 'Готово ✅');
                } else {
                    bot.sendMessage(msg.chat.id, 'У пользователя нет замечания');
                }
            } else {
                bot.sendMessage(msg.chat.id, 'Пользователь не найден');
            }
        });

    }
})

bot.onText(/\/enable (.+)/, (msg, array) => {
    if (msg.chat.id === adminTeam || mainAdmins.indexOf(msg.chat.id) !== -1) {

        var id = array[1];
        database.getData('users/' + id, function (user, error) {
            if (!error) {
                if (user.state === "disabled") {
                    var state = helpers.getState(user.start_date);
                    database.updateData('users/' + id, {state: state})
                    bot.sendMessage(msg.chat.id, 'Готово ✅');
                } else {
                    bot.sendMessage(msg.chat.id, 'У пользователя нет блокировки');
                }
            } else {
                bot.sendMessage(msg.chat.id, 'Пользователь не найден');
            }
        });
    }
})

bot.onText(/\/status/, (msg) => {
    if (msg.chat.id === adminTeam || mainAdmins.indexOf(msg.chat.id) !== -1) {
        database.getData('users/', function (users, error) {
            if (!error) {
                var rebuks = 0;
                var disableds = 0;
                var rebuksList = [];
                var disabledsList = [];
                for (var temp in users) {
                    if (users[temp].state === "disabled") {
                        disableds++;
                        disabledsList.push(frases.user_link(temp,users[temp].first_name) + ' (' + temp + ')')
                    }
                    if (users[temp].rebuke) {
                        rebuks++;
                        rebuksList.push(frases.user_link(temp,users[temp].first_name) + ' (' + temp + ')')
                    }
                }
                bot.sendMessage(msg.chat.id, `Замечаний: ${rebuks};\nБлокировок: ${disableds};\n\nЗамечания: ${rebuksList.join(', ')}` +
                    '\n\nБлокировки: ' + disabledsList.join(', '),{parse_mode:"HTML"})
            }
        });
    }
})

bot.onText(/\/commands/, (msg) => {
    if (msg.chat.id === adminTeam || mainAdmins.indexOf(msg.chat.id) !== -1) {
        bot.sendMessage(msg.chat.id, frases.commands)
    }
})

bot.onText(/\/getMyId/, (msg) => {
    bot.sendMessage(msg.chat.id, msg.chat.id)
})

bot.onText(/\/getGroupsList/, (msg) => {

    if (msg.chat.id === adminTeam || mainAdmins.indexOf(msg.chat.id) !== -1) {
        var feedback = 'Список групп:\n'
        database.getData('groups/', function (groups, error) {
            if (!error) {
                for (var temp in groups) {
                    feedback += temp + '\n';
                    for (var user in groups[temp]) {
                        if (user !== 'isNotFull') {
                            feedback += frases.user_link(user, groups[temp][user].first_name) +' ('+user+')' + '\n';
                        }
                    }
                    feedback += (groups[temp].isNotFull) ? 'Группа открыта для новых участников 🔐' : 'Группа закрыта для новых участников 🔒';
                    feedback += '\n\n'
                }
                bot.sendMessage(msg.chat.id, feedback, {
                    parse_mode: "HTML"
                })
            }
        });
    }
})

bot.onText(/\/openGroup (.+)/, (msg, array) => {

    if (msg.chat.id === adminTeam || mainAdmins.indexOf(msg.chat.id) !== -1) {
        var id = array[1];
        database.getData('groups/' + id, function (data, error) {
            if (!error) {
                if (!data.isNotFull) {
                    database.updateData('groups/' + id, {isNotFull: true});
                    bot.sendMessage(msg.chat.id, 'Готово ✅')
                } else {
                    bot.sendMessage(msg.chat.id, 'Группа уже открыта')
                }
            } else {
                bot.sendMessage(msg.chat.id, 'Группа не найдена')
            }
        })

    }
})

bot.onText(/\/closeGroup (.+)/, (msg, array) => {

    if (msg.chat.id === adminTeam || mainAdmins.indexOf(msg.chat.id) !== -1) {
        var id = array[1];
        database.getData('groups/' + id, function (data, error) {
            if (!error) {
                if (data.isNotFull) {
                    database.updateData('groups/' + id, {isNotFull: false});
                    bot.sendMessage(msg.chat.id, 'Готово ✅')
                } else {
                    bot.sendMessage(msg.chat.id, 'Группа уже закрыта')
                }
            } else {
                bot.sendMessage(msg.chat.id, 'Группа не найдена')
            }
        })

    }
})

bot.onText(/\/kickGroupUser (.+)/, (msg, array) => {

    if (msg.chat.id === adminTeam || mainAdmins.indexOf(msg.chat.id) !== -1) {
        var id = array[1];
        database.getData('users/' + id, function (user, error) {
            if (!error) {
                if (user.team) {
                    try {
                        database.removeData('groups/' + user.team + '/' + id);
                        database.removeData('users/' + id + '/team');
                        bot.sendMessage(msg.chat.id, 'Готово ✅')
                    } catch (e) {
                        bot.sendMessage(msg.chat.id, 'Произошла ошибка')
                    }

                } else {
                    bot.sendMessage(msg.chat.id, 'У пользователя нет группы')
                }
            } else {
                bot.sendMessage(msg.chat.id, 'Пользователь не найден')
            }
        })

    }
})


const rule = new schedule.RecurrenceRule();
rule.hour = 5;
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
        cache.put(chatId, 'report');
        database.getData('users/' + chatId, function (user, error) {
            if (!error) {
                var state = user.state;
                state = helpers.getState(user.start_date, state);
                console.log(state)
                if (state === 'week1' || state === 'week2' || state === 'week3') {
                    bot.sendMessage(chatId, frases['report_' + state], keyboards.cancel_report)
                } else {
                    bot.sendMessage(chatId, frases.report_week1, keyboards.cancel_report)
                }
            }
        })
    }
    else if (msg.text === kb.home.about_me) {
        cache.put(chatId, 'about_me');
        bot.sendMessage(chatId, frases.about_me, keyboards.cancel_report)
    }
    else if (msg.text === kb.home.rules) {
        bot.sendMessage(chatId, frases.rules, keyboards.home)
    }
    else if (msg.text === 'Отменить ❌') {
        bot.sendMessage(chatId, 'Отменено', keyboards.home)
    }
    else {
        var lastMessage = cache.get(chatId);
        var isReport = false;
        var isAboutMe = false;
        if (lastMessage !== undefined && lastMessage !== null && lastMessage === 'report' && msg.text !== 'Отменить ❌') {
            database.updateData('users/' + chatId, {report: msg.text});
            bot.sendMessage(chatId, frases.success_report, keyboards.home);
            isReport = true;
            cache.del(chatId)
        }
        if (lastMessage !== undefined && lastMessage !== null && lastMessage === 'about_me' && msg.text !== 'Отменить ❌') {
            database.updateData('archive/' + chatId, {team_salute: msg.text});
            bot.sendMessage(chatId, frases.success_about_me, keyboards.home);
            isAboutMe = true;
            cache.del(chatId);
        }
        if (msg.text.slice(0, 1) !== '/') {
            database.getData('users/' + chatId, function (user, error) {
                if (!error && user.team) {
                    database.getData('groups/' + user.team, team => {
                        if (isReport) {
                            msg.text = '<b>Отчет:</b>\n' + '<pre>' + msg.text + '</pre>';
                        } else if (isAboutMe) {
                            msg.text = '<b>Пользователь обновил данные о себе:</b>\n' + '<pre>' + msg.text + '</pre>';
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
