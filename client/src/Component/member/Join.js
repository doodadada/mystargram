import React, { useState, useEffect } from 'react'
import {  useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../../style/mystargram.css';

function Join() {

    const [email, setEmail] = useState('');
    const [pwd, setPwd] = useState("");
    const [pwdChk, setPwdChk] = useState("");
    const [nickname, setNickname] = useState('');
    const [phone, setPhone] = useState('');
    const [intro, setIntro] = useState('');
    const [profileimg, setProfileimg] = useState('');
    const [imgSrc, setImgSrc] = useState('http://via.placeholder.com/200x150');
    const [imgStyle, setImgStyle] = useState({ display: 'none' });

    const navigate = useNavigate();
    async function onSubmit() {
        if (!email) { return alert('이메일 입력하세요'); }
        if (!phone) { return alert('전화번호 입력하세요'); }
        if (pwd != pwdChk) { return alert('패스워드 확인이 일치하지 않습니다'); }
        if (!nickname) { return alert('닉네임을 입력하세요'); }
        try{
            let result = await axios.post('/api/member/emailcheck',{email});
            if (result.data.msg == 'no'){
                return alert('이메일이 중복됩니다');
            }

            result = await axios.post('/api/member/nicknamecheck',{nickname});
            if (result.data.msg == 'no'){
                return alert('닉네임이 중복됩니다');
            }

            result = await axios.post('/api/member/join',{email, pwd, nickname, phone, intro, profileimg:imgSrc});
            if (result.data.msg == 'ok'){
                alert('회원가입 완료되었습니다. 로그인하세요');
                navigate('/');
            }
        }catch(err){
            console.log(err);
        }
        // axios.post('/api/member/join', { email,pwd, })
        //     .then((result) => {
        //         if (result.data.msg) {
        //             alert('회원가입이 완료되었습니다. 로그인하세요');
        //         } else {
        //             alert('회원가입에 문제가 있습니다. 관리자에게 문의하세요');
        //         }
        //         navigate('/');
        //     })
        //     .catch((err) => {
        //         console.error(err);
        //     })

    }

    async function fileUpload(e) {
        const formData = new FormData();
        formData.append('image',    e.target.files[0]);
        const result = await axios.post('/api/member/fileupload', formData);
        setProfileimg(result.data.filename);
        setImgSrc(`http://localhost:5000/upimg/${result.data.filename}`);
        setImgStyle({ width: "300px" });
    }

    return (
        <div className='loginform'>
            <div className='logo' style={{ fontSize: "2.0rem" }}>Member Join</div>
            <div className="field">
                <label>E-MAIL</label>
                <input type="text" value={email} onChange={(e) => {
                    setEmail(e.currentTarget.value)
                }} />
            </div>
            <div className="field">
                <label>PASSWORD</label>
                <input type="password" value={pwd} onChange={(e) => {
                    setPwd(e.currentTarget.value)
                }} />
            </div>
            <div className="field">
                <label>RETYPE-PWD</label>
                <input type="password" value={pwdChk} onChange={(e) => {
                    setPwdChk(e.currentTarget.value)
                }} />
            </div>
            <div className="field">
                <label>NICKNAME</label>
                <input type="text" value={nickname} onChange={(e) => {
                    setNickname(e.currentTarget.value)
                }} />
            </div>
            <div className="field">
                <label>PHONE</label>
                <input type="text" value={phone} onChange={(e) => {
                    setPhone(e.currentTarget.value)
                }} />
            </div>
            <div className="field">
                <label>INTRO</label>
                <input type="text" value={intro} onChange={(e) => {
                    setIntro(e.currentTarget.value)
                }} />
            </div>
            <div className="field">
                <label>PROFILE-IMG</label>
                <input type="file" onChange={(e) => { fileUpload(e); }} />
            </div>
            <div className="field">
                <label>Profile img preview</label>
                <div><img src={imgSrc} style={imgStyle} /></div>
            </div>

            <div className="btns">
                <button onClick={() => { onSubmit() }}>JOIN</button>
                <button onClick={() => { navigate('/') }}>BACK</button>
            </div>


        </div>
    )
}

export default Join
