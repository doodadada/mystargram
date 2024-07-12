import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios'

function Main() {
  const[loginUser,setLoginUser] = useState({});
  const navigate = useNavigate();
  useEffect(
    ()=>{
      axios.get('/api/member/getLoginUser')
      .then((result)=>{
        if(!result.data.loginUser){
          alert('로그인이 필요합니다');
          navigate('/');
        }
        setLoginUser(result.data.loginUser);
        console.log('mainloginuser:', loginUser);
      })
    },[]
  )
  return (
    <div>
      <h1>{loginUser.nickname}님이 로그인하셨습니다 !</h1>
    </div>
  )
}

export default Main 
