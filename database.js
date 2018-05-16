const firebase = require("firebase");
firebase.initializeApp({
    serviceAccount: "./test-ea05e207390d.json",
    databaseURL: "https://test-dae5b.firebaseio.com/"
    // serviceAccount: "./astrobot-ec2b77a96a64.json",
    // databaseURL: "https://astrobot-26975.firebaseio.com/"
})

module.exports = {
    getData(path,callback){
        return firebase.database().ref(path).once('value',function (snapshot) {
           var data = snapshot.val();
           if(data == null){
               callback({},true)
           }else {
               callback(data,null)
           }
           return data
        })
    },
    pushData (path, data){
        return firebase.database().ref(path).push(data).then(data => {
            return (data.path.pieces_)
        });
    },
    setData(path, data){
        firebase.database().ref(path).set(data)
    },
    updateData(path, data){
        firebase.database().ref(path).update(data)
    },
    removeData(path){
        firebase.database().ref(path).remove(data)
    }
    // getAllData(){
    //
    // },
}