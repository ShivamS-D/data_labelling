const epxress=require('express')
const app=epxress();
const cors=require('cors')
const aws=require('aws-sdk')
import http from 'http'
import dotenv from 'dotenv'

import { Socket } from 'socket.io';
const {userRouter}=require('./routes/user')
const {wrokerRouter}=require('./routes/worker')
app.use(cors());
dotenv.config();
app.use(epxress.json())
const sockets=require('socket.io')
const server=http.createServer(app)
const io=sockets(server,{
  cors:{
    origin:['http://localhost:3000','http://localhost:3001']
  }
})

const users:string[]=[]
io.on('connection',(socket:Socket)=>{

        socket.on('join-room',data=>{
          socket.join(data);
          console.log(`${socket.id} joined room `,data);
        })

        socket.on('voted', (taskId) => {
          console.log(`Vote received for task ID: ${taskId}`);
          socket.to(taskId).emit('voting', taskId);  
          socket.on('get_pending_amnt',()=>{
            console.log("pending_amont")
            socket.broadcast.emit('get_amnt',1);
          })
          // io.emit('voting',taskId)
        });
})


const S3_BUCKET = 'ashutoshadbucket';
const REGION = 'eu-north-1';

aws.config.update({
    accessKeyId: `${process.env.AWS_ACCESS_ID}`,
    secretAccessKey:`${process.env.AWS_SECRET_KEY}`,
    region: REGION
});

const myBucket = new aws.S3({
    params: {Bucket:S3_BUCKET}
});




app.use('/v1/user',userRouter);
app.use('/v1/worker',wrokerRouter)

app.get('/',(req:any,res:any)=>{
  console.log("object")
  res.status(200).json("ashutosh")
})
app.get('/presignedurl',async (req:any,res:any)=>{

    const params={
      Bucket:S3_BUCKET,
      Key:req.query.fileName,
      Expires:3600,
      ContentType:req.query.mimetype
    }
    const url=await myBucket.getSignedUrl('putObject',params)
    res.status(200).json({url})
})
server.listen(2000)