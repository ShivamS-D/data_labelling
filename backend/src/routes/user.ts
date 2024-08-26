const express=require('express')
const router=express.Router(); 
import { PrismaClient } from '@prisma/client';

const prismaClient=new PrismaClient()

//@ts-ignore
prismaClient.$transaction( async (tx) =>{}, { maxWait: 5000, timeout: 10000, 
})
import * as web3 from '@solana/web3.js'
import nacl from 'tweetnacl';
import jwt from 'jsonwebtoken'
import {S3Client,GetObjectCommand, PutObjectCommand,} from '@aws-sdk/client-s3'
import { authMiddleWare } from '../middleware';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner'
import { createInput } from '../types';
import dotenv from 'dotenv'
dotenv.config()

const S3_BUCKET = 'ashutoshadbucket';
const REGION = 'eu-north-1';
const s3Client=new S3Client({
  credentials:{
    accessKeyId:`${process.env.AWS_ACCESS_ID}`,
    secretAccessKey:`${process.env.AWS_SECRET_KEY}`
  },
  region:"eu-north-1"
});



router.post('/signin',async (req:any,res:any)=>{
  const data=new TextEncoder().encode('Signin into Decentralized fivverr')
  const {address,signature}=req.body;
    // Log the signature and its length
    console.log('Received signature:', signature);
    console.log('Signature length:', signature.signature.data.length);
  
  const verification=nacl.sign.detached.verify(data,
   new Uint8Array(signature.signature.data),
    new web3.PublicKey(address).toBytes(),)
    console.log(verification)
    console.log("ashutosh")
    if(!verification){
      return res.status(411).json({msg:"Incorrect sign"})
    }
    let user;
    try{

       user=await prismaClient.user.upsert(
        { 
          
          where:{address:address},
          create:{address:address},
          update:{}
        },
  
      )
    }
    
    catch(e){console.log(e)
      return res.status(400).json({msg:e})
    }
    const token=jwt.sign({
      userId:user?.id},`${process.env.JWT_SECRET}`,{expiresIn:'3d'})



      res.status(201).json({token})
      
})

const connection=new web3.Connection(web3.clusterApiUrl('devnet'))
router.get('/presignedurl',authMiddleWare,async (req:any,res:any)=>{    

  const userId=req.id;
  const command=new PutObjectCommand({
    Bucket:S3_BUCKET,
    Key:`fivver/${userId}/${Math.random()}/image.jpg`,
    ContentType:"image/jpg",

  });


const url=await getSignedUrl(s3Client,command,{expiresIn:100});
console.log(url)
  res.json({
    url
  })
})

router.post('/createtask',authMiddleWare,async (req:any,res:any)=>{
  const body=req.body
  console.log(body)
  const parsedData=createInput.safeParse(body);

  console.log(parsedData)
  if(!parsedData.success){
    return res.status(411).json({message:"Not valid data"})



  }

  const user=await prismaClient.user.findFirst({
    where:{
      id:req.id
    }
  })

  const bal=await connection.getBalance(new web3.PublicKey('2sDcJ9arLHgLQA8B6EaEDo2WaV1NxKstp2yuixqYgCGm'))
  console.log(bal)
  const transaction = await connection.getTransaction(parsedData.data.signature);

console.log(transaction);

if ((transaction?.meta?.postBalances[1] ?? 0) - (transaction?.meta?.preBalances[1] ?? 0) !== 1000000) {

  return res.status(411).json({
      message: "Transaction signature/amount incorrect"
  })
}

if (transaction?.transaction.message.getAccountKeys().get(1)?.toString() !== '2sDcJ9arLHgLQA8B6EaEDo2WaV1NxKstp2yuixqYgCGm') {
  return res.status(411).json({
      message: "Transaction sent to wrong address"
  })
}

if (transaction?.transaction.message.getAccountKeys().get(0)?.toString() !== user?.address) {
  return res.status(411).json({
      message: "Transaction sent to wrong address"
  })
}
  let response;
  try{

     response=await  prismaClient.$transaction(async tx=>{
  
      const response=  await tx.task.create({
          data:{
           title:parsedData.data.title??"Selete the most appropriate title",
           amount:1000000,
           signature:parsedData.data.signature,
           user_id:req.id
  
          }
        })
        await tx.options.createMany({
          data: parsedData.data.options.map(option => ({
            url: option.imageUrl,
            task_id: response.id 
          }))      })
          return response
      })
      
  }
  catch(e){
    console.log(e)
  }
  res.status(200).json({id:response?.id})
})

// get the tasks
router.get('/task',authMiddleWare,async (req:any,res:any)=>{
  const taskId=req.query.taskId
  const userId=req.id
  try{
    

    const task=await prismaClient.task.findUnique({
      where:{id:Number(taskId),user_id:Number(userId)},
      include:{
        options:true
      }
  
   }) 
   if(!task){
    return res.status(411).json({msg:"You don't have access to the task"})
   }
   const responses=await prismaClient.submission.findMany({
    where:{task_id:Number(taskId)},
    include:{
      task:true,
      option:true
    }
   })

   const result:Record<string,{
    count:number,
    option:{
      imageUrl:string,
      title:string
    }
  }>= {};

  const results:Array<Record<string,any>>=[]

    task.options.forEach((option)=>{
      result[option.id]={
        count:0,
        option:{
          imageUrl:option.url,
          title:task.title
        }
      }
      results.push({count:0, option:{id:option.id,imageUrl:option.url}})
    })
     
  
   responses.forEach((response)=>{
  
    result[response.option.id].count++;
    results.forEach(res=>{
      if(res.option.id==response.option.id){
        res.count++;
      }
    })
    
  }) 


   return res.json(
    {results,title:task.title}
  )
  }
  catch(e){
    return res.status(403).json({message:e})
  }
 
})
export const userRouter=router
