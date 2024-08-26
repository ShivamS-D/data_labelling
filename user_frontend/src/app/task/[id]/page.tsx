'use client'
import { BACKEND_URL } from '@/app/UploadImages'
import React, { useEffect, useState } from 'react'
import Image from '../../Image'
import {io} from 'socket.io-client'
import AppBar from '@/app/components/AppBar'
interface TaskDetail {
  option: {
    imageUrl: string;
  };
  count: number;
}

const socket=io('http://localhost:2000');
socket.on('connect',()=>{
  console.log('connected')
})

socket.on('received-msg',data=>{
  console.log(data)
})
const Page = ({ params: { id } }: { params: { id: string } }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [taskDetails, setTaskDetails] = useState<TaskDetail[]>([]);
   const [title,setTitle]=useState('')
  const getTask = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/v1/user/task?taskId=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${localStorage.getItem('token')}`,
        },
      });
      // console.log(response)

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const json = await response.json();
      console.log(json)
      socket.emit('join-room',Number(id));
      return json;
    } catch (error:any) {
      throw new Error(`Fetching task failed: ${error.message}`);
    }
  };

  // socket.on('voting',data=>{
  //   console.log(data+ "inside 24th task")
  //   getTask()
  //   .then((res) => {
  //     setLoading(false);
  //     console.log(res)
  //     if (typeof res === 'object' && res.message) {
  //       setError(res.message);
  //     } else {

  //       setTaskDetails(res);
  //     }
  //   })
  //   .catch((e) => {
  //     setLoading(false);
  //     setError(e.message);
  //     console.log(e);
  //   });
  // })

  socket.on('voting', (taskId) => {
    console.log(`Received voting message for task ID: ${taskId}`);
    getTask().then((res) => {
      setLoading(false);
      if (typeof res === 'object' && res.message) {
        setError(res.message);
      } else {
        setTitle(res.title)
        setTaskDetails(res.results);
      }
    });
  });  

  useEffect(() => {
    getTask()
      .then((res) => {
        setLoading(false);
        if (typeof res === 'object' && res.message) {
          setError(res.message);
        } else {
          setTitle(res.title)
          setTaskDetails(res.results);
        }
      })
      .catch((e) => {
        setLoading(false);
        setError(e.message);
        console.log(e);
      });
  }, [id]);

  return (
    <>
    <AppBar/>
    <div className='flex justify-center items-center w-full h-[100vh]'>
      {loading ? (
        <p className='font-semibold text-2xl'>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="flex-col justify-center items-center gap-2">
          <h2 className='mb-5 text-2xl font-bold text-center'>{title}</h2>
          <div className='flex gap-3'>
          {taskDetails.map((taskDetail, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <Image url={taskDetail.option.imageUrl} />
              <p>{taskDetail.count}</p>
            </div>
          ))}
          </div>
          
        </div>
      )}
    </div>
    </>
    
  );
};

export default Page;
