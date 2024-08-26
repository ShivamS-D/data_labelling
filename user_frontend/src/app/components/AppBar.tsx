"use client"
import * as web3 from '@solana/web3.js'
import { transformSync } from 'next/dist/build/swc'
import Link from 'next/link'
import { useEffect, useState } from 'react'
const AppBar = () => {
  const [address,setAddress]=useState('')
  const [msg,setMessage]=useState<string | null>(null)
  const [changed,setChanged]=useState(false
  )
  const [balance,setBalance]=useState<string | null>(null)
  const isLoggedIn=async ()=>{
    if(localStorage.getItem('token')==null){
      window.location.href=('http://localhost:3000/connectwallet')
    }
   }
  useEffect(()=>{
    isLoggedIn()
  },[])    
  
     const getBalance=async ()=>{
      // @ts-ignore
      const account=await window.solana.connect();
      const pubKey=account.publicKey.toString('hex')
      setAddress(pubKey)
      const connection=new web3.Connection(web3.clusterApiUrl('devnet'));
      const balance=await connection.getBalance(new web3.PublicKey(pubKey));
      setBalance((balance/1e9).toString());

     }


    
     useEffect(()=>{
        getBalance();
      
     },[address])

     const logOut=async ()=>{
      localStorage.removeItem('token');
      localStorage.removeItem('phantomAddress');
      setChanged(true);
      window.location.href='http://localhost:3000/connectwallet'
     }
  return (
    <div>
      <div className="flex justify-between items-center py-2 px-4 bg-black text-white">
        <Link href={'/'} className='font-semibold text-2xl'>For User </Link>
        {/* {localStorage.getItem('token')===null?  (<button onClick={connectWallet} className="bg-red-500 rounded py-1 px-2">Connnect</button>): */}
        <div className='flex items-center gap-4'>
   <p>{(localStorage.getItem('phantomAddress')??'').slice(1,6)}...{(localStorage.getItem('phantomAddress')??'').slice(7,12)}</p>        <button className='px-4 py-1 bg-red-500 rounded-md' onClick={logOut}>LOGOUT</button>
        </div>
        {balance && <p className='font-semibold text-xl text-white'>Balaance: {balance}</p>}
        {/* <button onClick={transferSol}>TransferSol</button> */}
      
      </div>

    </div>
  )
}

export default AppBar
