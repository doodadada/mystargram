// kakaostrategy.js
const passport = require('passport');
const kakaoStrategy = require('passport-kakao').Strategy;
const mysql = require('mysql2/promise');

async function getConnection() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'adminuser',
        database: 'mystargram'
    });
    return connection;
}

module.exports = ()=>{
    passport.use(
        new kakaoStrategy(
            {
                clientID : process.env.KAKAO_ID,
                callbackURL : '/member/kakao/callback',
            }, 
            async ( accessToken, refreshToken, profile, done)=>{
                // 회원조회를 해서 없으면 회원 가입부터 하고 로그인
                const connection = await getConnection();
                let sql = "select * from member where snsid=? and provider=?";
                let [ rows, fields] = await connection.query(sql, [profile.id, 'kakao']);
                if(rows.length>=1){
                    done(null,rows[0]);
                    console.log(rows[0]);
                } else{
                    sql = 'insert into member(email, nickname, snsid, provider) values(?,?,?,?)';
                    [result, fields] = await connection.query(sql, [profile._json.properties.nickname, profile.displayName, profile.id, 'kakao']);

                    sql = 'select * from member where snsid=? and provider=?';
                    let [rows2, fields2] = await connection.query(sql, [profile.id, 'kakao']);
                    console.log(rows[0]);
                    done(null, rows2[0]);
                }
            }
        )
    )
}