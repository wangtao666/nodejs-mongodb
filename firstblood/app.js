/**
 * Module dependencies. 依赖的模块（处理路由，业务逻辑）
 */
require('./db/firstblood_schema')
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , ejs = require('ejs')//手动添加 ejs 以便支持 .html
, mongoose = require("mongoose")
, userlist = require("./db/firstblood_schema.js").userlist
, newslist = require("./db/firstblood_schema.js").newslist
, todolist = require("./db/firstblood_schema.js").todolist
,router = require('./routes')

var app = express();
var http = require("http");
var request = require('request');
//var agent = new http.Agent();
var agent = new http.Agent({
  keepAlive: true,
  maxSockets: 1,
  keepAliveMsecs: 3000
})
//缓存
var redis = require('redis'),
	client = redis.createClient(),
	session = require('express-session'),
	RedisStore = require('connect-redis')(session);
	

client.on("error", function (err) {
  console.log("Error " + err);
});
  
//client.on("connect", runSample);

// all environments 依赖的环境（配置参数）
app.set('port', process.env.PORT || 8888);
app.set('views', __dirname + '/views');

//让Ejs支持 html
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
//app.set('view engine', 'ejs');

app.use(express.favicon());
app.use(express.logger('dev'));
//app.use(express.static("./"));


//bodyParser 改成 urlencoded 可以忽略一些 Node窗口里的警告
  app.use(express.urlencoded());
//app.use(express.bodyParser());

app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only 开发模式（检查错误）
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// 路由解析
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/lu-you-qing-qiu', routes.luyou);
// firstblood 项目路由   如果要增加路由，可以在这里加
app.get('/login',routes.login);//增加
app.post('/home',routes.home);//提交
app.get('/login2',routes.login2);
app.post('/home2',routes.home2);

//增加
app.get("/create", function(req, res) {
    console.log("create 函数")
    var userlist2 = new userlist({
        user: req.query.add,
        password: req.query.password,
        age: req.query.age,
        name: req.query.name,
        phone: req.query.phone,
        address: req.query.address,
        numbers: req.query.numbers,
    });
    console.log('增加的用户:',req.query.add)
    //判断是否有重复名字
    userlist.find({user:req.query.add}, function(err, docs) {
		//如果数据库为空，那么返回1
    	if(docs == ''){
    		userlist2.save(function(err) {
    			/**设置响应头允许ajax跨域访问**/
				res.setHeader("Access-Control-Allow-Origin","*");
				/*星号表示所有的异域请求都可以接受，*/
				res.setHeader("Access-Control-Allow-Methods","GET,POST");
		        if (err) {
		            console.log(err);
		        } else {
		            console.log('存入成功');
		            res.send('1');
		        }
		    });
    	}else{
    		res.send(docs);
    	}
    });
});
//读取
app.get("/read", function(req, res) {
    console.log("读取函数1");
    userlist.find({}, function(err, docs) {
    	/**设置响应头允许ajax跨域访问**/
		res.setHeader("Access-Control-Allow-Origin","*");
		/*星号表示所有的异域请求都可以接受，*/
		res.setHeader("Access-Control-Allow-Methods","GET,POST");
    	console.log(docs == '')
    	if(docs == ''){
    		res.send('1');
    	}else{
    		res.send(docs);
    	}
        /*对docs进行操作*/
    });
});
//读取
app.get("/read4", function(req, res) {
    console.log("读取函数4");
    var curPage = req.query.curPage;
    userlist.find({}, function(err, docs) {
//  	console.log('读取初始页面的docs：',docs)
    	/**设置响应头允许ajax跨域访问**/
		res.setHeader("Access-Control-Allow-Origin","*");
		/*星号表示所有的异域请求都可以接受，*/
		res.setHeader("Access-Control-Allow-Methods","GET,POST");
    	if(docs == ''){
    		res.send('1');
    	}else{
    		res.send(docs);
    	}
    }).limit(5).skip(5*curPage-5);
});
//读取
app.get("/read5", function(req, res) {
    console.log("读取函数5");
    userlist.find({}, function(err, docs) {
    	/**设置响应头允许ajax跨域访问**/
		res.setHeader("Access-Control-Allow-Origin","*");
		/*星号表示所有的异域请求都可以接受，*/
		res.setHeader("Access-Control-Allow-Methods","GET,POST");
    	var totalPages = docs.length.toString()
    	res.send(totalPages);
    });
//  res.send(totalPages);
});
//读取
app.get("/read2", function(req, res) {
    console.log("读取函数2");
    userlist.find({_id:req.query.id}, function(err, docs) {
    	console.log(docs == '')
    	/**设置响应头允许ajax跨域访问**/
		res.setHeader("Access-Control-Allow-Origin","*");
		/*星号表示所有的异域请求都可以接受，*/
		res.setHeader("Access-Control-Allow-Methods","GET,POST");
    	if(docs == ''){
    		res.send('1');
    	}else{
    		res.send(docs);
    	}
    });
});
//读取
app.get("/read3", function(req, res) {
    console.log("读取函数3");
    console.log("读取函数3",req.query.user);
    client.HGETALL(req.query.user,function(err,reply){
    	console.log('查看是否有缓存:',reply !== null)
		if(reply !== null){
			/**设置响应头允许ajax跨域访问**/
			res.setHeader("Access-Control-Allow-Origin","*");
			/*星号表示所有的异域请求都可以接受，*/
			res.setHeader("Access-Control-Allow-Methods","GET,POST");
			console.log('读取的缓存数据！！')
			res.send(reply);
		}else{
			console.log('22读取的数据库里面的数据！！')
			userlist.find({user:req.query.user}, function(err, docs) {
		    	/**设置响应头允许ajax跨域访问**/
				res.setHeader("Access-Control-Allow-Origin","*");
				/*星号表示所有的异域请求都可以接受，*/
				res.setHeader("Access-Control-Allow-Methods","GET,POST");
//				console.log('返回的数据：',docs)
		    	if(docs == ''){
		    		res.send('1');
		    	}else{
		    		//存缓存(登录时存缓存还没做好！！)
				  	client.HMSET(req.query.user, {
				  		user: req.query.user,
				        password: docs[0].password
				  	}, function (err,reply) {
					  	console.log('登录信息录入缓存状态:',reply);
					});
		    		res.send(docs);
		    	}
		        /*对docs进行操作*/
		       
		    });
		}
	})
});

// app.get('/test',function(req,res){
// 	console.log('test函数测试！')
//
// })

//模糊查询
app.get("/read6", function(req, res) {
    console.log("读取函数6");
    userlist.find({user:{$regex:req.query.user}}, function(err, docs) {
    	/**设置响应头允许ajax跨域访问**/
		res.setHeader("Access-Control-Allow-Origin","*");
		/*星号表示所有的异域请求都可以接受，*/
		res.setHeader("Access-Control-Allow-Methods","GET,POST");
    	if(docs == ''){
    		res.send('1');
    	}else{
    		res.send(docs);
    	}
        /*对docs进行操作*/
       
    });
});

//修改
app.get("/update", function(req, res) {
    console.log("更新函数");
    client.HMSET(req.query.user,{
    	user:req.query.user,
        password: req.query.password,
        age: req.query.age,
        numbers: req.query.numbers,
        name: req.query.name,
        phone: req.query.phone,
        address: req.query.address
      },function(err,doces){
      	console.log('更新函数:',doces);
      }
    );
    userlist.update({
        _id : req.query.id
    }, {
    	user:req.query.user,
        password: req.query.password,
        age: req.query.age,
        numbers: req.query.numbers,
        name: req.query.name,
        phone: req.query.phone,
        address: req.query.address
    }, function(error) {});
    /**设置响应头允许ajax跨域访问**/
	res.setHeader("Access-Control-Allow-Origin","*");
	/*星号表示所有的异域请求都可以接受，*/
	res.setHeader("Access-Control-Allow-Methods","GET,POST");
    res.send("更新成功！！");

});
//删除
app.get("/delete", function(req, res) {
    console.log("删除函数");
    client.del(req.query.user,function(err,doces){
    	console.log('删除的数据为：',doces);
    })
    userlist.remove({
        _id: req.query.id
    }, function(err,docs) {
        if (err) return handleError(err);
        // removed!
    });
    /**设置响应头允许ajax跨域访问**/
	res.setHeader("Access-Control-Allow-Origin","*");
	/*星号表示所有的异域请求都可以接受，*/
	res.setHeader("Access-Control-Allow-Methods","GET,POST");
    res.send("删除成功！！");

});
var datas = [];
//查询所有缓存key的接口
app.get('/huancun',function(req,res){
	console.log('读取缓存中。。。')
	client.keys(req.query.all,function(err,repl){
		for(var i= 0;i<repl.length;i++){
			client.HGETALL(repl[i],function(err2,repl2){
				datas.push(repl2);
			})
		}
	})
	setTimeout(function(){
		res.send(datas)
		datas = [];
	},300)
})
//另外admin一个表的查询
app.get('/findnew',function(req,res){
	console.log('正在查询表2的信息，admin!!!')
	//ajax返回的jsonp发送过来的参数aaa，可以自定义参数名
	console.log('ajax返回的jsonp发送过来的参数:',req.query.aaa)
	//如果查询到缓存中么有name的数据，那么发起请求查询数据库，返回数据
	  	newslist.find({},function(err,docs){
	  		console.log('我在数据库查询数据！！')
			console.log('长度:',docs.length)
			/**设置响应头允许ajax跨域访问**/
			res.setHeader("Access-Control-Allow-Origin","*");
			/*星号表示所有的异域请求都可以接受，*/
			res.setHeader("Access-Control-Allow-Methods","GET,POST");
			if(docs == ''){
	    		res.send('1');
	    	}else{
	    		res.send(docs)
	    		//跨域！！！！！！！！！！！！！！！！！！！！！！！！！！！！
//	    		res.send(req.query.aaa+"(["+JSON.stringify(docs)+"])");
//	    		res.send(req.query.aaa+"([{ss:'sdf',ysdfd:'rwere'},{ss:'3543hdd',wee:'59bcaad81a44426bd48578a1'}])");
	    	}
		})
	})
//另外admin的表增加
app.get('/creatnew',function(req,res){
	console.log('正在进行增加admin信息操作！！')
	var newlist2 = new newslist({
        name: req.query.name,
        time: req.query.time,
        content: req.query.content,
        urls: req.query.urls,
        numbers:req.query.numbers,
    });
    
    newlist2.save(function(err,docs){
    	/**设置响应头允许ajax跨域访问**/
		res.setHeader("Access-Control-Allow-Origin","*");
		/*星号表示所有的异域请求都可以接受，*/
		res.setHeader("Access-Control-Allow-Methods","GET,POST");
    	if(err){
    		res.send('1')
    	}else{
    		res.send('保存成功！')
    	}
    })
})

//admin表的删除
app.get('/deleteNew',function(req,res){
	console.log('admin正在进行删除操作！！！',req.query._id);
	newslist.remove({_id:req.query._id},function(err,docs){
		/**设置响应头允许ajax跨域访问**/
		res.setHeader("Access-Control-Allow-Origin","*");
		/*星号表示所有的异域请求都可以接受，*/
		res.setHeader("Access-Control-Allow-Methods","GET,POST");
		if(err){
			res.send('1')
		}else{
			res.send('删除成功！')
		}
	})
})

//安装师傅需要接口
app.get("/read10", function(req, res) {
    console.log("读取函数10,我限制了跨域的地址，只有http://192.168.79.12:8080可以访问！");
	userlist.find({user:req.query.user}, function(err, docs) {
    	/**设置响应头允许ajax跨域访问   这里可是限制允许跨域的地址，一定是协议+ip+端口  其余地址就无法跨域请求**/
		// res.setHeader("Access-Control-Allow-Origin","http://127.0.0.1:8080");
        res.setHeader("Access-Control-Allow-Origin","*");
		/*星号表示所有的异域请求都可以接受，*/
		res.setHeader("Access-Control-Allow-Methods","GET,POST");
//				console.log('返回的数据：',docs)
    	if(docs == ''){
    		res.send('1');
    	}else{
    		res.send(docs);
    	}
        /*对docs进行操作*/
       
    });
});

//todo接口部分  新增
app.get('/todo_add',function (req,res) {
	console.log('我的logo接口')
    var todolist2 = new todolist({
        label: req.query.label,
        content: req.query.content
    });

    todolist2.save(function(err,docs){
    	console.log(docs)
        /**设置响应头允许ajax跨域访问**/
        res.setHeader("Access-Control-Allow-Origin","*");
        /*星号表示所有的异域请求都可以接受，*/
        res.setHeader("Access-Control-Allow-Methods","GET,POST");
        if(err){
            res.send('1')
        }else{
            res.send('保存成功！')
        }
    })
});

//todo接口部分  查询
app.get('/todo_search',function (req,res) {
	console.log('我是todo查询')
	todolist.find({_id:req.query.id},function (err,docs) {
        /**设置响应头允许ajax跨域访问**/
        res.setHeader("Access-Control-Allow-Origin","*");
        /*星号表示所有的异域请求都可以接受，*/
        res.setHeader("Access-Control-Allow-Methods","GET,POST");
        if(docs == ''){
            res.send('1');
        }else{
            res.send(docs);
        }
    })
})

//todo接口部分  查询所有
app.get('/todo_search_all',function (req,res) {
	// res.send('可以返回东西了')
	console.log('我在查询todo所有的信息！')
	todolist.find({},function (err,docs) {
        /**设置响应头允许ajax跨域访问**/
        res.setHeader("Access-Control-Allow-Origin","*");
        /*星号表示所有的异域请求都可以接受，*/
        res.setHeader("Access-Control-Allow-Methods","GET,POST");
        if(docs == ''){
            res.send('1');
        }else{
            res.send(docs);
        }
    })
})

//todo接口部分  修改
app.get('/todo_change',function (req,res) {
    console.log('我正在保存修改');
    console.log(req.query.label,req.query.content);
    todolist.update({
        _id : req.query.id
    }, {
        label:req.query.label,
        content: req.query.content
    }, function(error) {});
    /**设置响应头允许ajax跨域访问**/
    res.setHeader("Access-Control-Allow-Origin","*");
    /*星号表示所有的异域请求都可以接受，*/
    res.setHeader("Access-Control-Allow-Methods","GET,POST");
    res.send("更新成功！！");
});

//node代理java接口，转发数据!!!麻蛋，之前弄那么久！！代理放在后面对前面代码不会有影响！
app.get('/apis',function(req,res){
    /**设置响应头允许ajax跨域访问**/
    res.setHeader("Access-Control-Allow-Origin","*");
    /*星号表示所有的异域请求都可以接受，*/
    res.setHeader("Access-Control-Allow-Methods","GET,POST");
    request('http://172.30.3.76:8880/b2cordercenter/retailOuter/orderCount?phones='+req.query.phone, function (error, response, body) {
        console.log('error:', error); // 返回错误信息
        console.log('statusCode:', response && response.statusCode); // 返回请求的状态码
        console.log('body:', body); // 返回回来的数据
        res.send(body);
    });
})

// 创建一个http server 启动端口 
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;