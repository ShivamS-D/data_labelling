"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
export const BACKEND_URL='http://localhost:2000'
import {io} from 'socket.io-client'
import Submittask from "../submittask/page"
import Withdraw from "../withdraw"
const socket=io('http://localhost:2000')
socket.on('connect',()=>{
  console.log("connected")
})
const AppBar = () => {
  const [address,setAddress]=useState('')
  const [amount,setAmount]=useState<number>(0)
  const [token,setToken]=useState<string | null>(null)
  socket.on('get_amnt',(id)=>{
    console.log(id)
    console.log("ashutosh")
    pendingAmount();
  })

  const connectWallet=async ()=>{
    console.log("object")
    // @ts-ignore
  const {solana}=window
        if(solana){
              if(solana.isPhantom){
                const response=await solana.connect({onlyIfTrusted:false});
                const publicKey=response.publicKey.toString('hex')
                
                
                localStorage.setItem('phantomAddress',response.publicKey.toString())
                setAddress(publicKey)
                return solana
  
              }
        }
  
       }

  
    const pendingAmount=async ()=>{
      try{

        const amount=await fetch(`${BACKEND_URL}/v1/worker/pending_amount`,{
          method:"GET",
          headers:{
            Authorization:`${localStorage.getItem('token')}`,
            "Content-Type":"application/json"
          }
        });
        const json=await amount.json();
        setAmount((json.amount)/1e9)
      }
      catch(e){
        console.log(e)
      }
    }
    useEffect(()=>{

      pendingAmount();
      // sendAndSign();
    },[token])
  return (
    <div>
      <div className="flex justify-between  items-center py-4 px-7 bg-black text-white">
        <Link href={'/'}>For Worker </Link>
        <div className="flex  gap-6 items-center ">
        {/* <button onClick={transferSol}>TransferSol</button> */}
        <p>Pending Amount: {amount}</p>
        <Withdraw/>
        {localStorage.getItem('token')?
        
        <p>{JSON.parse(localStorage.getItem('phantomAddress')??'').slice(0,6)}...{JSON.parse(localStorage.getItem('phantomAddress')??'').slice(7,12)}</p>
        :null}
          
        </div>
      </div>
    </div>
  )
         
}

export default AppBar
