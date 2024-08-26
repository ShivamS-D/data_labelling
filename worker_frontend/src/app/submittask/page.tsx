'use client'

import { useEffect, useState } from "react"
import Image from '../../../../user_frontend/src/app/Image'
import {io} from 'socket.io-client'
import AppBar from "../Components/appbar";
interface TaskOption {
  id: string;
  url: string;
  taskId: number;
}

interface Task {
  amount: number;
  id: number;
  title: string;
  options: TaskOption[];
}

interface Tasks {
  task: Task;
}


const BACKEND_URL = 'http://localhost:2000/v1/worker';
const socket=io('http://localhost:2000');
socket.on('connect',()=>{
  console.log("connected")
  socket.emit("msg","ashutohs");
  
})
const Submittask = () => {
  const [submit,setSubmit]=useState(false)
  const [task, setTask] = useState<Tasks | null>(null);
  const [error,setError]=useState('')
  const [receipt,setReceipt]=useState<string| null>(null)

   const isLoggedIn=async ()=>{
    if(localStorage.getItem('token')==null){
      window.location.href=('http://localhost:3001/connectwallet')
    }
   }
  useEffect(()=>{
    isLoggedIn()
  },[])
  const getTask = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/nexttask`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization":`${localStorage.getItem('token')}`

        }
      });
      const json = await response.json();
      console.log(json)
      if(json.msg){
        setError(json.msg)
      }
      else{

        setTask(json);
        console.log(json)
        socket.emit('join-room',json.task.id);
        
      }
    } catch (error) {
      console.error("Failed to fetch task:", error);
    }
  };

  const submittask = async (optionId: string) => {
    setSubmit(true)
    try {
      const response = await fetch(`${BACKEND_URL}/submission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization":`${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ taskId: task?.task.id, optionId })
      });
      const json = await response.json();
        socket.emit('voted',task?.task.id)
        socket.emit('get_pending_amnt','ashutosh')
      console.log(json);

      if(json.nextTask==null){
      setError("You have no tasks pending")
      }
      else{

        setTask({task:json.nextTask});
        socket.emit('join-room',json.nextTask.id);

        setReceipt("Next task")
      }
    } catch (error) {

      console.error("Failed to submit task:", error);
    }
    setSubmit(false)
  };

  useEffect(() => {
    getTask();
  }, []); 
  return (
    <div>
    <div className=" flex items-center justify-center h-[94vh]">
      
      {error.length>0 ? <p className="text-2xl font-semibold">{error}</p>:
      (
        
        <div className="h-[100vh] w-full flex flex-col justify-center items-center   gap-2">
          <h2 className="font-bold text-2xl">{task?.task.title}</h2>
          <p>{submit?'Submitting':null}</p>
        <div className="flex w-full justify-center items-center gap-2">
        {task && task.task.options.map((option) => (
        <img className="w-40 h-40 cursor-pointer"
          key={option.id} 
          src={option.url} 
          onClick={() => submittask(option.id)} 
        />))  }

        </div>
      </div>
      )}
    </div>
    </div>
  );
};

export default Submittask;
