import React from 'react'
import AppBar from './Components/appbar'
import Withdraw from './withdraw'
import Submittask from './submittask/page'

const page = () => {
  return (
    <div>
      <AppBar/>
      <Submittask/>
      <Withdraw/>
    </div>
  )
}

export default page
