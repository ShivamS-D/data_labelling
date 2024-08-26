"use client"
import React, { useState } from 'react'
import { BACKEND_URL } from '../UploadImages';

const Connect = () => {
  const [address,setAddress]=useState('')
  const [token,setToken]=useState('')
  const [error,setError]=useState<string>('')
  const sendAndSign=async ()=>{
    const message=new TextEncoder().encode('Signin into Decentralized fivver');
    // @ts-ignore
    if(window.solana){
    // @ts-ignore

      const provider= window.solana;
      // @ts-ignore
      const response=await window.solana.connect();
      const publicKey=response.publicKey.toString('hex');
      setAddress(publicKey)
      window.localStorage.setItem('phantomAddress',JSON.stringify(publicKey));
      
          const signature=await provider.signMessage(message);
          console.log(signature)
          const res=await fetch(`${BACKEND_URL}/v1/user/signin`,{
            body:JSON.stringify({
              address:publicKey,signature
            }),
            method:"POST",
            headers:{
              "Content-Type":"application/json"
            }
          })
          const json:{token:string}|null=await res.json();
          console.log(json)
          if(json!=null){
      
            window.localStorage.setItem('token',json.token);
            setToken(json.token);
        // window.location.href=('http://localhost:3001/')
            window.location.href='http://localhost:3000/'
          }
         
      
           
           
    }
    else{
      console.log("Please have a phantom wallet")
      setError('Please have a metamask wallet')
    }
    //@ts-ignore
   }

  return (
    <div>
    <div className="flex justify-center  items-center w-[100vw] h-[100vh]  text-white">
      {error.length>0?<p className='text-black font-bold text-2xl'>{error}</p>:
      
      <div className="flex  gap-6 items-center ">
      {!(window.localStorage.getItem('token')??'')?  (<button onClick={sendAndSign} className="bg-red-500 rounded py-1 px-2">Connnect</button>):<p>{JSON.parse(window.localStorage.getItem('phantomAddress')??'').slice(0,6)}Ashutosh{JSON.parse(window.localStorage.getItem('phantomAddress')??'').slice(7,12)}</p>}
        
      </div>
      }
    </div>
  </div>  )
}

export default Connect

