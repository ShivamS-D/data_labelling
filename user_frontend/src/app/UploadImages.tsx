"use client"

import { integer } from "aws-sdk/clients/cloudfront"
import { useRef, useState } from "react"
import Image from "./Image"
export const BACKEND_URL='http://localhost:2000'
export const CDNURL='https://d3b4h90fxpgdwb.cloudfront.net'

const UploadImages = ({onImageAdded,image}:{onImageAdded:(imageUrl:string)=>void,image?:string}) => {
  const [file,setFiles]=useState<File | null>(null)
  const refrence=useRef() 
  const [submitted,setSubmitted]=useState(false)
  const [options,setOption]=useState<Array<string>>([])
  const handleSubmit=async ()=>{
    setSubmitted(true)
    try{

      const res=await fetch(`${BACKEND_URL}/v1/user/presignedurl`,{
        method:"GET",
        
        headers:{
         "Content-Type":"application/json",
         Authorization:`${localStorage.getItem('token')}`
        }
      })
      
      const {url}=await res.json();
      if(url){
        try{

          const res=await fetch(url,{
            method:"PUT",
            headers:{
              //@ts-ignore
              "Content-Type":file.type
             
            },
            body:file
          })
          console.log(typeof(res))
          console.log(res.ok)
          if(res.status===200){
          //  setOption(prev=>[...prev,res.url.split('.com')[1]])   
          //  console.log(options)

          onImageAdded(`${CDNURL}${res.url.split('com')[1]}`)
           setFiles(null)
          }
          setSubmitted(false)
        }
        catch(e){
          setSubmitted(false)
          console.log(e)
        }
      }
      else{
        setSubmitted(false);
      }
    }
    catch(e){
      setSubmitted(false)
      console.log(e)
    }
    
  }
  
  if(image){
    return <Image url={image}/>
  }
  return (

    <div className="w-40 m-2 h-40 cursor-pointer  rounded-xl border-solid border-black shadow   ">
      <div className="flex flex-col w-full items-center justify-center h-full text-2xl" onClick={()=>{
        // @ts-ignore
        refrence.current.click()
        

        }}>
        <input type="file" onChange={e=>{
          //@ts-ignore
      setFiles(e.target.files[0])
        }}  
        
        //@ts-ignore
        ref={refrence} hidden/>
        <p >Upload</p>
        <p >+</p>

      </div>
      <div className="flex items-center justify-center">
     {<button onClick={handleSubmit} className="bg-green-400 py-2 text-md px-2  rounded text-white mt-2 ">{!submitted?'Upload Image':"Uploading"}</button>} 
     
    
     </div>
    </div>
  )
  
}

export default UploadImages
