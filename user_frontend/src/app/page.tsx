"use client";
import AWS from 'aws-sdk';
import { useState } from 'react';
import AppBar from './components/AppBar';
import UploadImages from './UploadImages';
import Upload from './Upload';
const S3_BUCKET = 'ashutoshadbucket';
const REGION = 'eu-north-1';
import dotenv from 'dotenv'
dotenv.config();
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_ID,
    secretAccessKey:process.env.AWS_SECRET_KEY,
    region: REGION
});

const myBucket = new AWS.S3({
    params: { Bucket: S3_BUCKET }
});

const Page = () => {
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            console.log(e.target.files[0]);
        }
    };

    const uploadFile = (file: File) => {
        const params = {
            Body: file,
            Bucket: S3_BUCKET,
            Key: file.name
        };

        myBucket.putObject(params).on('httpUploadProgress', (evt) => {
            setProgress(Math.round((evt.loaded / evt.total) * 100));
        }).send(err => {
            if (err) {
                console.log(err);
            } else {
                console.log('Upload successful');
            }
        });
    }

    const deleteFile=(file:File)=>{
      const params = {
        Bucket: S3_BUCKET,
        Key: file.name
    };
    myBucket.deleteObject(params, (err, data) => {
      if (err) {
          console.log('Error deleting file:', err);
      } else {
          console.log('File deleted successfully:', data);
          setFile(null);
          setProgress(0);
      }
  });

    }


     const getFile =(file:File)=>{
      const params = {
        Bucket: S3_BUCKET,
        Key: file.name
    };

    myBucket.getObject(params,(err,data)=>{
      if(err){
        console.log(err)
      }
      else{
        console.log(data)
      }
    })
     }

     const getPresignedUrls=(file:File)=>{
      const params={
        Bucket:S3_BUCKET,
        Key:file.name,
        Expires:3600
      }

      myBucket.getSignedUrl('putObject',params,async  (err,url)=>{
        if(err){
          console.log(err)
        }
        else{
          const res=await fetch(url,{
            method:"PUT",
            headers:{
              'Content-Type':encodeURI(file.name)
            },
            
            body:file
          })
          console.log(res)
        }
      })
     }

     const putFile=async ()=>{
      const res=await fetch(`http://localhost:2000/presignedurl?fileName=${file?.name}&mimetype=${file?.type}`,
        {
          method:'GET',
          headers:{
            "Content-Type":"application/json"
          }
        }
      )
      const data=await res.json();
      if(data.url){
        const result=await fetch(data.url,{
          method:"PUT",
          headers:{
            'Content-Type':encodeURI(`${file?.type}`)
          },
          
          body:file
        })
        if(result.status==200){
          console.log("uploaded")
        }
        else{
          console.log("object")
        }
      }
     }
     const getCors=async ()=>{
      const params={
        Bucket:S3_BUCKET
      }
    const cors=  myBucket.getBucketPolicy((err,data)=>{
      console.log(data)
    });
     }
    return (
        <div >
            {/* <input type="file" onChange={handleFile} />
            {file && <button onClick={() => uploadFile(file)}>Upload</button>}
            <div>Progress: {progress===100?"Uploaded":progress}%</div>
            {file && <button onClick={() => deleteFile(file)}>Delete</button>}
            {file && <button onClick={() => getFile(file)}>Get</button>}
{file && <button onClick={()=>getPresignedUrls(file)}>Get Url</button>}
{file && <button onClick={putFile}>PutFIle</button>}
<button onClick={getCors}>GET CORS</button>
<AppBar/> */}
<AppBar/>
<Upload/>
        </div>
    );
}

export default Page;
