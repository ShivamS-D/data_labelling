"use client"
import {useState} from 'react'
import { BACKEND_URL } from './Components/appbar'

const Withdraw = () => {
   const [withdrawed,setWithdrawed]=useState<Boolean>(false);
   const withDrawAmount=async ()=>{
     setWithdrawed(true)
    try{
      const res=await fetch(`${BACKEND_URL}/v1/worker/withdraw_amnt`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":`${localStorage.getItem('token')}`
        }
      })
      if(res.ok){
        const json=await res.json();
  
        console.log(json)
      }
      setWithdrawed(false)
    }
    catch(e){
      setWithdrawed(false);
      console.log(e)
    }
   }
  return (
     <>
      {localStorage.getItem('token') ?<button className='bg-green-400 px-2 py-1 rounded-md  text-white text-xl' onClick={withDrawAmount}>{!withdrawed?'Withdraw':'Withdrawing'}</button>:<p>Login to Continue</p>}
      </>
  )
}

export default Withdraw
