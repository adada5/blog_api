const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const formidable = require("formidable");
const fs = require("fs");
const api = require('./router/api.js')
const admin = require('./router/admin.js')

const app = express()

// 将/public目录作为静态公开目录
app.use('/public', express.static('public'));

// 配置body-parser
// 只要加入这个配置，则在req请求对象上会多出来一个属性：body
// 也就是说可以直接通过req.body来获取表单post请求数据
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.all('*',(req, res, next) => {
    //设置请求头为允许跨域
    res.setHeader('Access-Control-Allow-Origin','*');
    // 设置服务器支持的所有头信息字段
    res.setHeader('Access-Control-Allow-Headers','*');
    res.set("Access-Control-Allow-Origin","*")

    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    
    next();
  })

app.use(api)
app.use(admin)

//上传照片
app.post('/upload', function (req, res) {
    // const body = req.body
    // console.log(body)
    var form = new formidable.IncomingForm();
    console.log("about to parse");
    form.parse(req, function(error, fields, files) {
        console.log("parsing done");
        // console.log(files.upload.path);
        const url = "public/"+Date.now()+".png"
        fs.writeFileSync(url, fs.readFileSync(files.upload.path));
        // res.redirect("/public/upload.html") ;
        res.status(200).json({
            url: 'http://127.0.0.1:2020/'+url,
            status: 200
        })
    });
});

//删除照片
app.put('/delete', function (req, res) {
    const body = req.body
    let url = body.url
    
    let path = '.'+ url.slice(21) 
    // console.log(body)
    console.log(path)

    fs.unlink(path,err=>{
        if(err){
            console.log(err);
        }
    })

    res.status(200).json({
        
        status: 200
    })
    
});

mongoose.connect('mongodb://localhost:27017/blog',{ useNewUrlParser: true ,useUnifiedTopology: true},function(err){
    if(err){
        console.log('数据库连接失败');
    }else{
        console.log('数据库连接成功');
        app.listen(2020);
    }
})

