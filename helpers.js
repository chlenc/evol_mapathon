// const request = require('request');
// const kb = require('./keyboard-buttons')
// const frases = require('./frases');
const keyboards = require('./keyboard.js');
const database = require('./database')
const frases = require('./frases');

/*git rm -r --cached FolderName
git commit -m "Removed folder from repository"
git push origin master*/

module.exports = {
    convert_date(date, offset) {
        offset = (offset === undefined) ? 0 : offset;
        date.setDate(date.getDate()+offset);
        return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
    },
    getState(start_date,pre_state,isLast) {
        if(pre_state === 'disabled')
            return pre_state;
        var date = new Date();
        date = (isLast)?date.setDate(date.getDate()-1):date;
        var start_date = new Date(start_date);
        var diff = Math.floor((date - start_date) / 1000 / 60 / 60 / 24);
        var state = '';
        if (diff < 0)
            state = 'start';
        else if (diff >= 0 && diff < 7)
            state = 'week1';
        else if (diff >= 7 && diff < 14)
            state = 'week2';
        else if (diff >= 14 && diff < 21)
            state = 'week3';
        else if (diff === 21)
            state = 'week4';
        else if(diff > 21)
            state = '';
        return state
    }
}
