# 📝Notezy – MERN Stack Notes App

## 📘Overview
Notezy is a fully responsive MERN Stack Notes Management Web Application built with
React (Vite + Tailwind CSS) on the frontend and Node.js, Express.js, MongoDB on the backend.

It allows users to sign up, log in, create, edit, delete, and manage notes securely.
The app includes authentication, password reset via email, profile management, testing, and SonarQube integration for code quality.

## 🛠️ Features
### 🔐 Authentication & Authorization

### Signup Page

- Fields: Name, Email, Password, Confirm Password
- Email format validation: example@domain.com
- Password must include uppercase, lowercase, number, and special character

“Already have an account? Login here” link

### Login Page

- Fields: Email, Password
- Includes Forgot Password option
- Uses NodeMailer to send a password reset link

Redirects to reset password page → user enters new password → successfully updates login credentials

### 🏠 Dashboard
 
#### Sidebar Navigation:
Dashboard | Add Notes | My Notes | Profile | Settings | Logout

##### Shows:
- App name Notezy
- Total notes count
- 6 recent notes
- “More” button → View all notes
- Floating “+” button → Add new note

### 🗒️ Add Notes

- Rich Text Editor with formatting options
- Save or cancel note creation

### 📚 My Notes

- Displays all notes with pagination
- Each note includes:
     - Edit
     - Delete (confirmation popup)
     - View full note details

### 👤 Profile Page

- Displays user info (name, email, profile image)
- Edit name and email
- Upload or delete profile picture (stored on backend folder)

### ⚙️ Settings Page

- Change Password
- Fields: Old Password, New Password, Confirm Password
- Button: Change Password
- Delete Account
- Confirmation popup: “Are you sure?” → Yes / No
- Permanently removes user data

## 🧪 Testing

### Backend Testing (Mocha + Chai)

- Tested all API endpoints and controllers
- Covered authentication, CRUD operations, and error handling

### Frontend Testing (Jest)

- Unit testing for pages and reusable components
- Verified UI rendering and core functionality

## 🧱 Code Quality with SonarQube
- Integrated SonarQube via Docker for code analysis
- Ensures clean, maintainable, and secure JavaScript code
- Evaluated code coverage, maintainability, and vulnerabilities

📸 SonarQube Dashboard Screenshot:
<img width="1599" height="778" alt="image" src="https://github.com/user-attachments/assets/1b7fecc0-774e-4c42-b7c3-c1ec9b54c777" />


## ⚙️ Installation & Setup
### 1️⃣ Clone Repository
git clone https://github.com/ZarishFatima-zf/zarish-fatima-mern-10pshine 
cd notezy

### 2️⃣ Install Dependencies
#### Frontend
cd frontend
npm install
npm run dev

#### Backend
cd backend
npm install
npm run server

### 3️⃣ Setup Environment Variables
Create a .env file in the backend directory:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=youremail@example.com
EMAIL_PASS=your_email_password

## 🧰 Tools & Technologies
### Category	Tools Used
#### Frontend	
- React.js (Vite)
- Tailwind CSS
-  Axios
-  React Router DOM
#### Backend	
- Node.js
- Express.js
- MongoDB
- Mongoose
- Pino Logger
- Email Service	NodeMailer
#### Testing
- Mocha
- Chai
- Jest
#### Code Quality	SonarQube (Docker)
#### Version Control	Git & GitHub
