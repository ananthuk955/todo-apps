
# To-Do List Application with User Authentication

This is a full-stack To-Do List application built using the MERN stack (MongoDB, Express.js, React.js, Tailwindcss and Node.js) that allows users to securely sign up, log in, and manage personal tasks.

## Features

- User Registration & Login
- JWT-based Authentication
- Password Hashing with bcrypt
- Create, Read, Update, Delete (CRUD) for To-Do Items
- Each To-Do includes Title, Description, and Status (Pending or Completed)
- Protected Routes on Frontend
- React Context API for Auth State Management
- Axios for API communication

## Tech Stack

- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt
- **Frontend:** React.js (Vite), React Router, Axios
- **Authentication:** JWT (JSON Web Tokens), bcrypt for password hashing

## Project Structure

todo-app/
├── backend/
│ ├── bin/
│ │ └── www
│ ├── config/
│ │ └── database.js
│ ├── controllers/
│ │ ├── authController.js
│ │ └── todoController.js
│ ├── middleware/
│ │ └── auth.js
│ ├── models/
│ │ ├── User.js
│ │ └── Todo.js
│ ├── routes/
│ │ ├── auth.js
│ │ └── todos.js
│ ├── app.js
│ └── package.json
└── frontend/
├── src/
│ ├── components/
│ │ ├── Auth/
│ │ │ ├── Login.jsx
│ │ │ └── Register.jsx
│ │ ├── Todo/
│ │ │ ├── TodoList.jsx
│ │ │ ├── TodoItem.jsx
│ │ │ └── TodoForm.jsx
│ │ └── Layout/
│ │ ├── Header.jsx
│ │ └── ProtectedRoute.jsx
│ ├── context/
│ │ └── AuthContext.jsx
│ ├── services/
│ │ └── api.js
│ ├── App.jsx
│ └── main.jsx
└── package.json


## How to Run

### 1. Clone the Repo
```bash
git clone https://github.com/your-username/todo-app.git
cd todo-app

2. Setup Backend
cd backend
npm install
npm start

3. Setup Frontend
cd ../frontend
npm install
npm run dev

4. Environment Variables
Create a .env file in the backend/ directory:
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret_key
