import { useEffect, useState } from "react"
import UploadImages, { BACKEND_URL } from "./UploadImages"

import * as web3 from '@solana/web3.js'

const Upload = () => {

  const [title,setTitle]=useState('')
  const [txSign,setTxSign]=useState('0xklsjfsf')
  const [signature,setSignature]=useState('');
  const [isCreated,setIsCreated]=useState(true)
  const [creating,setIsCreating]=useState(false)
  const [makingPayment,setMakingPayment]=useState(false)
const [option,setOption]=useState<Record<string,string>[]>([])

  const sumbitTask=async ()=>{
       console.log(option)
       setIsCreating(true)
       try{

         const res=await fetch(`${BACKEND_URL}/v1/user/createtask`,{
           method:"POST",
           headers:{
             "Content-Type":"application/json",
             Authorization:`${localStorage.getItem('token')}`
           },
           body:JSON.stringify({title,signature,options:option})
           
         })
         console.log(window.location)
         if(res.ok){
           
           const json=await res.json();
           console.log(json)
           setIsCreated(!isCreated);
           
           window.location.href=`${window.location.href}/task/${json?.id}`
          }
          setIsCreating(false)

       }
       catch(e){
        setIsCreated(!isCreated);
        setIsCreating(false)
        
        console.log(e)
       }
  }

  const makePayment=async ()=>{
    //@ts-ignore
    setMakingPayment(true)
    // @ts-ignore
    const {solana}=window;
    if(solana){
      const response=await solana.connect({onlyIfTrusted:false});
      const publicKey=response.publicKey.toString('hex')

  const provider=solana
  const connection=new web3.Connection(web3.clusterApiUrl('devnet'));
  // const publicKey='5Efn5gtWukbXRxGQGDs3TReEzqNbXt9dZufuJpFV2J9X'
  const transaction=new web3.Transaction().add(web3.SystemProgram.transfer({
    fromPubkey:new web3.PublicKey(publicKey),
    toPubkey:new web3.PublicKey('2sDcJ9arLHgLQA8B6EaEDo2WaV1NxKstp2yuixqYgCGm'),
    lamports:1000000
  }))
transaction.feePayer=new web3.PublicKey(publicKey)
console.log(transaction)
console.log(connection)
const blockHashObj=await connection.getLatestBlockhash()
transaction.recentBlockhash=await blockHashObj.blockhash

let signed = await provider.signTransaction(transaction);
// The signature is generated
let signature = await connection.sendRawTransaction(signed.serialize());
await connection.confirmTransaction(signature);

const transfering=await connection.getTransaction(signature,{commitment:'finalized',maxSupportedTransactionVersion:10});
console.log(transfering);

setSignature(signature);
setIsCreated(!isCreated);
setMakingPayment(false)


}
  }

  
  return (
    
    <div className="flex flex-col justify-center w-full h-[100vh] items-center">
      
      <button onClick={(signature && !isCreated)?sumbitTask:makePayment} className="bg-blue-300 m-3 p-2 rounded text-white">{(signature && !isCreated)?(creating?'Creating Task':'Create Task'):makingPayment===true?'Making Payment':'Make Payemnt'}</button>
      <div className="flex items-center justify-center gap-2">
      <label htmlFor="">Title</label>
<input type="text" className="border-solid rounded shadow py-2 px-1 " placeholder="Enter the title "  onChange={e=>setTitle(e.target.value)}/>
</div>
      <div className="flex gap-2 w-full justify-center items-center"> 
      {option.map((option,idx)=>(
        <UploadImages key={idx} onImageAdded={(imageUrl:string)=>setOption(prev=>[...prev,{imageUrl}])} image={option.imageUrl}/>
      ))}
      </div>
      <div className="flex justify-center w-full ">
      <UploadImages onImageAdded={(imageUrl:string)=>setOption(prev=>[...prev,{imageUrl}])} />
      </div>

    </div>
  )
}

export default Upload
