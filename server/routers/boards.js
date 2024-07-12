const express = require("express");
const router = express.Router();
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

async function getConnection() {
    let connection = await mysql.createConnection(
        {
            host: 'localhost',
            user: 'root',
            password: 'adminuser',
            database: 'board'
        }
    );
    return connection;
}
let paging = {
    page:1,    totalCount:0,    beginPage:0,
    endPage:0,    displayRow:10,    displayPage:10,
    prev:false,    next:false,    startNum:0,    endNum:0,
    calPaging:function(){
        this.endPage = Math.ceil(this.page / this.displayPage ) * this.displayPage;
        this.beginPage = this.endPage - (this.displayPage -1);
        let totalPage = Math.ceil(this.totalCount/this.displayRow);
        if(totalPage<this.endPage){
            this.endPage = totalPage;
            this.next = false;
        }else{
            this.next = true;
        }
        this.prev = (this.beginPage==1)?false:true;
        this.startNum = (this.page-1)*this.displayRow+1;
        this.endNum = this.page*this.displayRow;
        console.log(this.beginPage + " " + this.endPage + " " + this.startNum + " " + this.endNum + " " + this.totalCount); 
    }
}
router.get('/getBoardList/:page', async (req, res) => {
    if (req.params.page != undefined) {
        paging.page = req.params.page;
        req.session.page = req.params.page;
    } else if (req.session.page != undefined) {
        paging.page = req.session.page;
    }else{
        req.session.page='';
    }


    try {
        const connection = await getConnection();
        let sql = 'select * from board';
        let [rows, field] = await connection.query(sql);
        paging.totalCount = rows.length;
        paging.calPaging();
        sql = "select * from board order by num desc limit ? offset ?";
        const [rows2, fields2] = await connection.query(sql,[paging.displayRow,paging.startNum-1]);
        res.send({ boardList: rows2,paging });
    } catch (err) {
        console.error(err);
    }
});

router.get('/getBoard/:num', async (req, res) => {
    try {
        const connection = await getConnection();
        let sql = "update board set readcount = readcount+1 where num=?";
        const [result1, fields1] = await connection.query(sql, [req.params.num]);
        sql = "select * from board where num=?;";
        const [rows, fields] = await connection.query(sql, [req.params.num]);
        sql = 'select * from reply where boardnum = ? order by replynum desc';
        const [rows2, fields2] = await connection.query(sql, [req.params.num]);
        // console.log("server replylist:",rows2);
        res.send({ board: rows[0], replyList: rows2 });
    } catch (err) {
        console.error(err);
    }
});

router.post('/addReply', async (req, res) => {
    const { userid, num, rContent } = req.body;
    console.log("router addreply : ", req.body);
    try {
        const connection = await getConnection();
        const sql = 'insert into reply(userid, boardnum, content) values(?,?,?)';
        const [result, fields] = await connection.query(sql, [userid, num, rContent]);
    } catch (err) {
        console.error(err);
        next(err);
    }
    res.send('ok');
});

router.delete('/deleteReply/:replynum', async (req, res) => {
    console.log("router deleteReply : ", req.params.replynum);
    try {
        const connection = await getConnection();
        let sql = 'delete from reply where replynum=?'
        const [result, fields] = await connection.query(sql, [req.params.replynum]);
        res.send('ok');
    } catch (err) {
        console.error(err)
    }
})

router.delete('/deleteBoard/:boardnum', async (req, res) => {
    console.log("router deleteBoard : ", req.params.boardnum);
    try {
        const connection = await getConnection();
        let sql = 'delete from board where num=?'
        const [result, fields] = await connection.query(sql, [req.params.boardnum]);
        res.send('ok');
    } catch (err) {
        console.error(err)
    }
});

const uploadObj = multer({
    storage: multer.diskStorage({
        destination(req, file, done) {
            done(null, 'uploads/');
        },
        filename(req, file, done) {
            const ext = path.extname(file.originalname);
            done(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});
router.post('/fileupload', uploadObj.single('image'), (req, res) => {
    console.log("filename : ", req.file.originalname);
    console.log("savefilename : ", req.file.filename);
    res.send({ image: req.file.originalname, saveFileName: req.file.filename });
});

const upObj = multer();
router.post('/insertBoard', upObj.single('image'), async (req, res) => {
    const { userid, pass, email, title, content, img, saveFileName } = req.body;
    const sql = "insert into board( userid, pass, email, title, content, image, savefilename) values(?,?,?,?,?,?,?)";
    const connection = await getConnection();
    console.log(req.body)
    try {
        const [result, field] = await connection.query(sql, [userid, pass, email, title, content, img, saveFileName]);
        res.send('ok');
    } catch (err) {
        console.log(err)
    }
})

router.post('/updateBoard/:num', upObj.single('image'), async (req, res) => {
    const connection = await getConnection();
    const { title, content, image, saveFileName } = req.body;
    const num = req.session.boardnum;
    const sql = 'update board set title=?, content=?, image=?, savefilename=? where num=?';
    try {
        const [result, field] = await connection.query(sql, [title, content, image, saveFileName, req.params.num]);
        res.send('ok');
    } catch {
        console.error(err);
    }
})



module.exports = router;