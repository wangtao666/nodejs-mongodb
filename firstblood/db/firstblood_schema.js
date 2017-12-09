// 链接 firstblood 集合
var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost:27017/firstblood');
// 链接错误
db.on('error', function(error) {
    console.log(error);
});
// Schema 结构
var Schema = mongoose.Schema;
//表一
var userlistScheMa = new Schema({
    user     : String,
    password : String,
    //content  : {type : String},
    //time     : {type : Date, default: Date.now},
    age      : Number,
    name	 : String,
    phone	 : String,
    address	 : String,
    numbers	 : String,
});
//表二
var newslistScheMa = new Schema({
	name     : String,
    time	 : String,
    content	 : String,
    urls	 : String,
    numbers	 : Number,
})
//表三
var todolistScheMa = new Schema({
    label    : String,
    content	 : String,
})
// 关联 userlist -> admins 表   表数据有问题，一切都白搭!
//表一
exports.userlist = db.model('admins', userlistScheMa,'admins');
//表二
exports.newslist = db.model('admin',newslistScheMa,'admin');
//表三
exports.todolist = db.model('todo',todolistScheMa,'todo');
exports.db = db;
console.log('数据库启动成功！！！！');
