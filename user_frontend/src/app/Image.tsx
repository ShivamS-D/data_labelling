"use client"
export default function Image({url,onClick}:{url:string,onClick?:()=>(optionId:number)=>void}){
   return <>
   <img className="rounded w-40 h-40" src={url}  />
   </>
}