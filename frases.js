//const videoUrl = 'видео.атм-мотивация.рф';
//const url = '\n<a href = "'+videoUrl+'">Ссылка на видео</a>';

module.exports = {
    start(name) {
        return ('Привет, '+name+'!\n' +
            'Тебе предстоит пройти удивительный и увлекательный путь знакомства с собой. И этот путь начинается прямо сейчас. \n' +
            'Следующим сообщением мы отправим тебе правила, которые необходимо соблюдать, чтобы успешно завершить марафон и' +
            ' получить результат. Ты всегда их сможешь посмотреть нажав кнопку "правила" в меню.\n')
    },
    rules: 'Правила марафона\n' +
    '1. Раз в неделю будут присылаться задания, которые необходимо выполнять. \n' +
    '2. Мы поделим на группы по 6 человек. Как наберется подходящая для вас группа, мы вас автоматически добавим. Там необходимо будет писать отчеты друг другу. Все будет происходить в этом боте. Вы также можете пройти марафон один, но, как показывает практика, вряд ли это получится) \n' +
    '3. Раз в день нужно писать отчеты до 23:00 по Москве. Для этого нажми кнопку "отчет". Не написал 1 раз - предупреждение, 2 раз вылет из марафона. Повторное прохождение возможно, но уже на других условиях.\n' +
    '4. Если так получилось, что в группе вы остались один, мы вас автоматически переведем в другую. Помогайте, поддерживайте друг друга. Помните правило - помогая другим помогаешь себе.\n' +
    '5. Если вы успешно завершите марафон и вас будет в группе 5 или 6 человек, мы сделаем вашей группе приятный подарок!\n',
    team_ask(name){
        return name+', мы подобрали для тебя группу, она тебя ждет.  Если ты готов включиться в нее, ответь на это сообщение своим намерением.'
    },
    week_map: ['start','week1','week2','week3','week4',''],
    team_success: 'Группа собрана, каждый из вас проявил намерение успешно завершить марафон и мотивировать, помогать друг другу в случае необходимости. Ваша группа - ваша команда. \n' +
    'Вся переписка и отчеты будут здесь.\n' +
    'Если кто-то не напишет отчет - предупреждение увидят все, мотивируйте друг друга и не подводите команду. \n' +
    'Если вы успешно завершите марафон и вас будет в группе 5 или 6 человек, мы сделаем вашей группе приятный подарок! Удачи вам!)\n' +
    'Напоминаем, отчет каждый день до 23:00 (мск)\n' +
    '\n' +
    'Друзья, познакомьтесь друг с другом. Каждый напишите:\n' +
    '1. Имя\n' +
    '2. Ваше дело жизни по Эволюции\n' +
    '3. Ваша мотивация\n' +
    '4. Ваш  способ призвания\n' +
    '5. То, что считаете нужным\n',
    start_marathon(name){
        return 'Поздравляем, '+name+'! Твой марафон включения в себя начался. Первый отчет важно предоставить уже сегодня до 23:00. Для этого нажми кнопку "Отчет"\n' +
            'Отчет на эту неделю будет выглядеть в следующей форме:\n' +
            '1. В какое время встали.\n' +
            '2. Делали ли практику утром. \n' +
            '3. Питались ли как нужно. \n' +
            '4. Действовали ли из нужной мотивации. \n' +
            '5. Проявлялись ли по призванию.\n' +
            '6. Уровень счастья по 100 баллам.\n'
    },
    report:'Напишите свой отчет',
    about_me:'Расскажите о себе',
    success_report:'Отчет записан ✅',
    success_about_me:'Данные о вас обновлены ✅',
    user_message(chatId,name,text){
        return `<a href="tg://user?id=${chatId}">${name}</a>:\n${text}`
    },
    user_link(chatId,name){
        return `<a href="tg://user?id=${chatId}">${name}</a>`
    },
    rebuke(name){
        return name+', ты не успел отправить отчет до 23:00. По правилам марафона, мы делаем тебе предупреждение. За второй пропуск нам придется исключить тебя из марафона и твоя команда не получит приятные бонусы в конце. Помни про это)\n'
    },
    excluded(name){
        return name+', ты второй раз не успел отправить отчет. Мы тебя исключаем из марафона.'
    },
    report_text_1: 'Отчет в форме:\n' +
    '1. В какое время встали.\n' +
    '2. Делали ли практику утром. \n' +
    '3. Питались ли как нужно. \n' +
    '4. Действовали ли из нужной мотивации. \n' +
    '5. Проявлялись ли по призванию.\n' +
    '6. Уровень счастья по 100 баллам.\n' +
    '\n' +
    'Отвечайте честно, это важно для вас.\n' +
    'Любое сообщение сразу после этого будет приниматься как отчет. Если захотите поменять, нажмите снова "отчет".\n',
    report_text_2:'Отчет в форме:\n' +
    '1. В какое время встали?\n' +
    '2. Делали ли практику утром?\n' +
    '3. Питались ли как нужно?\n' +
    '4. Действовали ли из нужной мотивации?\n' +
    '5. Проявлялись ли по предназначению?\n' +
    '6. Нашли кармического партнера?\n' +
    '7. Помогли партнеру?\n' +
    '8. Делали ли аффирмации?\n' +
    '9. Ваш уровень счастья по 100 баллам.\n' +
    '\n' +
    'Отвечайте честно, это важно для вас.\n' +
    'Любое сообщение сразу после этого будет приниматься как отчет. Если захотите поменять, нажмите снова "отчет". \n',
    report_text_3:' ',
    report_text_4:' '

}

