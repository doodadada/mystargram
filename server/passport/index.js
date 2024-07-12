// passport / index.js

const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaostrategy');
const mysql = require('mysql2/promise');

async function getConnection(){
    const connection = await mysql.createConnection({
        host:"localhost",
        user:'root',
        password:'adminuser',
        database:'mystargram'
    })
    return connection;
}

module.exports = ()=>{
    passport.serializeUser((user, done)=>{
        console.log("serial",user);
        done(null, user.email); // 세션에 로그인 유저 이메일만 저장
    });
    passport.deserializeUser(async(email, done)=>{
        console.log("제발나와라ㅏㅏ",email);
        console.log('----deserial 시작------');
        const sql = 'select * from member where email=?';
        try{
            const connection = await getConnection();
            const [rows, fields] = await connection.query(sql, [email]);
            console.log("index:",rows[0]);
            done(null, rows[0]); // 로그인유저 정보 복구
        }catch(err){
            done(err);
        }
    });
    local();
    kakao();
}