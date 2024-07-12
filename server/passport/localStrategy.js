// localStrategy.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mysql = require('mysql2/promise');

async function getConnection() {
    const connection = await mysql.createConnection(
        {
            host: 'localhost',
            user: 'root',
            password: 'adminuser',
            database: 'mystargram'
        }
    );
    return connection;
}

module.exports = () => {
    passport.use(
        new LocalStrategy( // kakao 에서는 KAKAO_ID와 callbackURL
            {
                usernameField: 'email',
                passwordField: 'pwd',
            },
            async (email, password, done) => {
                const connection = await getConnection();
                // 사용자 인증이 완료되어 사용자 정보가 전달되었습니다.
                console.log('localstrategy:', email, password);
                try {
                    let sql = 'select * from member where email =?';
                    let [rows, fields] = await connection.query(sql, [email]);
                    // 회원 가입 내역에 따라 회원가입 후 또는 바로 done 함수로 실행하여 다음 로그인 절차를 진행합니다
                    if (rows.length >= 1) {
                        if (rows[0].pwd == password) {
                            // 정상 로그인
                            // 바로 done 실행
                            done(null, rows[0],null);
                            // const uniqInt = Date.now();
                            // req.session[uniqInt] = rows[0];
                            // res.cookie('session', uniqInt, { httpOnly: true, path: '/' });
                            // res.send({ msg: 'ok' });
                        } else {
                            // 패스워드 틀림
                            done(null, false,{ message: '패스워드가 다릅니다' });

                            // return res.send({ msg: '패스워드가 다릅니다' });
                        }

                        // null : 로그인에 에러가 없음을 의미
                    } else {
                        // 아이디 없음
                        done(null, false,{ message: '없는 이메일입니다' });
                    }
                } catch (err) {
                    console.error("kstrage \n", err);
                    done(err);
                }
            }
        )
    );
}
