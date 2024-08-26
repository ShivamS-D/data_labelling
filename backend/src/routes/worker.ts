const express=require('express')
const router=express.Router(); 
import jwt from 'jsonwebtoken'
import { Prisma, PrismaClient } from "@prisma/client";
import { authMiddleWare } from '../middleware';
import { workerMiddleWare } from '../middleware';
import { getNextTask } from '../db';
import { TOTAL_DECIMALS } from '../total_decimal';
import * as web3 from '@solana/web3.js'
import bs58 from 'bs58'
import dotenv from 'dotenv'
import nacl from 'tweetnacl'
dotenv.config()
const prismaClient=new PrismaClient()
const TOTAL_SUBMISSIONS=100;
const connection=new web3.Connection(web3.clusterApiUrl('devnet'))

router.post('/signin',async (req:any,res:any)=>{
  const data=new TextEncoder().encode('Signin into Decentralized fivver')
  const {address,signature}=req.body;
    // Log the signature and its length
    console.log('Received signature:', signature);
    console.log('Signature length:', signature.signature.data.length);
  
  const verification=nacl.sign.detached.verify(data,
   new Uint8Array(signature.signature.data),
    new web3.PublicKey(address).toBytes(),)
    console.log(verification)
    if(!verification){
      return res.status(400).json({msg:"Incorrect sign"})
    }
    try{

      const worker=await prismaClient.worker.upsert(
        { 
          
          where:{address},
          create:{address:address,pending_amount:0, locked_amount:0},
          update:{}
        },
    
      )
      
      const token=jwt.sign({
        workerId:worker.id},`${process.env.JWT_WORKER_SECRET}`,{
          expiresIn:'3d'
        })
        if(token.length>0){
    
          return   res.status(201).json({token})
        }
    }

    catch(e){
      console.log(e)
      return res.status(400).json({msg:e})

    }
   
    
})




router.get('/nexttask',workerMiddleWare,async (req:any,res:any)=>{
  const userId=req.id
   const task=await getNextTask(userId)
   if(!task){
return res.status(411).json({msg:"You have no tasks pending"})
   }
return res.status(200).json({task})
})


router.post('/submission',workerMiddleWare,async (req:any,res:any)=>{
  const userId=req.id
  const body=req.body;
  
  const task=await getNextTask(userId);
  console.log(task)
  //@ts-ignore
  if(!task || task.id!==body.taskId){
    return res.status(411).json({mssg:"Inccorect task"})
  }

  const amount=((task.amount)/TOTAL_SUBMISSIONS)
 

  const submissions=await prismaClient.$transaction(async tx=>{
    const submission=await tx.submission.create({
      
      data:{
        worker_id:userId,
        task_id:Number(body.taskId),
        option_id:Number(body.optionId),
        amount:Number(amount)
  
      }
    })

    await tx.worker.update({
      where:{
        id:userId
      },
      data:{
        pending_amount:{increment:(amount)}
      }
    })
    return submission;
  })

  
   
   const nextTask=await getNextTask(userId)
  
  res.json({
    nextTask,
amount

  })
})

router.get('/pending_amount',workerMiddleWare,async (req:any,res:any)=>{
  const worker=await prismaClient.worker.findFirst({
    where:{
      id:req.id
    },
   
  })
  if(!worker){
    res.status(411).json({msg:"No pending amnt"})
  }
  else{
    res.status(200).json({amount:worker.pending_amount,locked_amount:worker.locked_amount})
  }
})

router.post("/withdraw_amnt",workerMiddleWare,async (req:any,res:any)=>{
  try{
    
    const worker=await prismaClient.worker.findFirst({
      where:{
        id:req.id
      }
    })
    if(!worker){
      return res.status(403).json({msg:"User not found"})
    }
    const address=worker.address
    await prismaClient.$transaction(async tx=>{
      
      await tx.worker.update({
        where:{id:req.id},
        data:{
          pending_amount:{
            decrement:worker.pending_amount
          },
          locked_amount:{
            increment:worker.pending_amount
          }
        }
      })
    await tx.payouts.create({
      data:{
        amount:worker.pending_amount,
        status:"PROCESSING",
        signature:"ABCDEF",
        worker_id:req.id
      }
    })
    
    })
    // sol transaction
    const secretKeyBase58 :string  = process.env.SECRET_KEY || ''
    const secretKeyUint8Array = bs58.decode(secretKeyBase58);
    const payer = web3.Keypair.fromSecretKey(secretKeyUint8Array);
        const transaction = new web3.Transaction().add(
        web3.SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: new web3.PublicKey(address),
          lamports: worker.pending_amount 
        })
      );
      const signature = await web3.sendAndConfirmTransaction(connection, transaction, [payer]);
      if(Object.keys(signature).length>0){
        await prismaClient.$transaction(async tx=>{
      
          await tx.worker.update({
            where:{id:req.id},
            data:{
              locked_amount:0
            }
          })
        
        })
        
        res.json({ msg: "Transaction successful", signature });
        
      }
      
  }

  catch(e){
    const worker=await prismaClient.worker.findFirst({
      where:{
        id:req.id
      }
    })
    await prismaClient.$transaction(async tx=>{
      
      await tx.worker.update({
        where:{id:req.id},
        data:{
          pending_amount:{
            increment:worker?.pending_amount
          }
        }
      })
    
    
    })
    res.status(500).json({ msg: "Internal server error", e});

  }
    
  
})

export const wrokerRouter=router

