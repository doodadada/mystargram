const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

async function getConnection(){
    const connection = await mysql.createConnection({
        host : 'localhost',
        user : 'root',
        password : 'adminuser',
        database : 'mystargram'
    });
    return connection;
}


try{
    fs.readdirSync('uploads');
}catch(err){
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}

const uploadObj = multer({
    storage: multer.diskStorage({
        destination(req, file, done){ done(null, 'uploads/');},
        filename(req, file, done){
            const ext = path.extname(file.originalname);
            done(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: {fileSize:5*1024*1024},
});

router.post('/fileupload', uploadObj.single('image'), (req, res)=>{
    res.send(
        {
            profileimg : req.file.filename,
        }
    )
})

router.post('/emailcheck', async (req, res)=>{
    const {email} = req.body;
        try{
            const connection = await getConnection();
            const sql = 'select * from member where email=?';
            const [ rows, fields] = await connection.query(sql, [email]);
            if(rows.length >=1){
                res.send({msg:'no'});
            } else{
                res.send({msg:'ok'});
            }
        }catch(err){
            console.error(err);
        }
});


router.post('/nicknamecheck', async (req, res)=>{
    const {nickname} = req.body;
        try{
            const connection = await getConnection();
            const sql = 'select * from member where nickname=?';
            const [ rows, fields] = await connection.query(sql, [nickname]);
            if(rows.length >=1){
                res.send({msg:'no'});
            } else{
                res.send({msg:'ok'});
            }
        }catch(err){
            console.error(err);
        }
});
router.post('/join', async (req, res)=>{
    const {email, pwd, nickname, phone, intro, profileimg} = req.body;
    try{
        const connection= await getConnection();
        const sql = 'insert into member(email, pwd, nickname, phone, profilemsg, profileimg) values(?,?,?,?,?,?)';
        const [ result, fields ] = await connection.query(sql, [email, pwd, nickname, phone, intro, profileimg]);
        res.send({msg:'ok'});
    } catch(err){
        console.error(err);
    }
});

const passport = require('passport');

router.post('/loginlocal', (req, res, next)=>{
    passport.authenticate(
        'local', 
        (authError, user, info )=>{
            if(authError){
                //서버에러가 발생
                console.error(authError);
                return;
            }
            if( !user ){
                // 이메일이 없거나 패스워드가 틀렸다. 
                console.log(info.message);
                return res.send({msg : info.message});
            }

            // 정상로그인   // req.login() : req가 같고 있는 로그인 관련 함수
            return req.login(user, (loginError)=>{
                if(loginError){
                    console.error(loginError);
                    return;
                }
                console.log('member return locallogin',req.user);
                return res.send({msg:'ok', loginUser : req.user });
            })
        })(req, res, next);
});

router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', 
    passport.authenticate('kakao', 
        { 
            failureRedirect:'http://localhost:3000/'
        }
    ),
    (req, res) =>{
        res.redirect('http://localhost:3000/main')
    }
);

router.get('/getLoginUser', (req, res)=>{
    
    console.log("member req.user:",req.user);
    console.log("member req.loginUser",req.loginUser);
    res.send({loginUser:req.user});

} )

module.exports = router;