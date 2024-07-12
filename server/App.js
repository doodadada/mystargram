const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path=require("path");
// const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const app =express();
const fs = require('fs');

app.set('port',process.env.PORT || 5000);
dotenv.config();

app.use('/images',express.static(path.join(__dirname, 'images')));
app.use('/upimg',express.static(path.join(__dirname, 'uploads')));
app.use('/',express.static(path.join(__dirname, 'public')));
// 업로드 폴더 생성 -fs 모듈을 이용
// 업로드용 폴더로 사용할 폴더를 조사해보고 없으면 생성, 있으면 그 폴더를 이용(그냥 지나감)
try{
    fs.readdirSync('uploads');
}catch(err){
    console.error('uploads 폴더가 없어 uploads 폴더 생성')
    fs.mkdirSync('uploads');
}

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser(process.env.COOKIE_SECRET)); //쿠키사용

app.use(session({resave:false, saveUninitialized:false, secret:process.env.COOKIE_SECRET,cookie:{httpOnly:true,secure:false,},
}));


const memberRouter = require('./routers/member');
app.use('/member',memberRouter);

const passport = require('passport');
const passportConfig = require('./passport');
passportConfig();
app.use(passport.initialize());
app.use(passport.session());


const boardsRouter = require('./routers/boards');
app.use('/boards',boardsRouter);

app.get("/", (req,res)=>{
    res.send("<h1>MyStarGram</h1>");
});


app.listen(app.get('port'), () => {
    console.log(app.get('port'),
        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}:${String(new Date().getSeconds()).padStart(2, '0')}`,
        "포트 서버 오픈");
});