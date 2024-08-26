


### Backend Setup

• Navigate to the backend directory:
  cd backend

• Start the backend server
  npm run dev



### User Frontend Setup

• Navigate to the user_frontend directory:
  cd ../user_frontend

• Start the user frontend server:
  npm run dev


#### Worker Frontend Setup

• Navigate to the worker_frontend directory:
  cd ../worker_frontend

• Start the worker frontend server:
  npm run dev

### Some essential things to do to run this project
1) create a .env file in backend directory which must contain 
  • Two JWT SECRETs 
    1) JWT_SECRET=Your secret here
    2) JWT_WORKER_SECRET=Your worker secret here 

2) Create an AWS account then create an S3 bucket and then create an IAM user 
   then put your secrets as :
   1) AWS_SECRET_KEY=Your secret here
   2) AWS_ACCESS_ID=Your secret here

3) create a .env file in user_frontend directory which must contain   
   1) AWS_SECRET_KEY=Your secret here
   2) AWS_ACCESS_ID=Your secret here
# Project Aim

This platform allows users to upload data (e.g., YouTube thumbnails) as tasks, for which they pay in SOL (Solana cryptocurrency). Workers on the platform vote on the best submissions and earn SOL for their participation. The SOL used for payments and withdrawals is managed by a parent wallet.


## Workflow: 

• Task Creation: Users upload tasks and pay in SOL, which is stored in the parent wallet.

• Voting: Workers vote on tasks. For each vote, they earn a portion of the SOL paid by the task creator.

• Withdrawal: Workers can withdraw their earnings, which are deducted from the parent wallet.


## Technologies Used

1) Express.js: Backend server
2) Prisma: SQL database management
3) Next.js: Frontend framework for both user and worker interfaces
4) @solana/web3.js: Solana wallet connection and payment processing
5) Socket.io: Real-time vote count updates
6) Everything is written in typescript