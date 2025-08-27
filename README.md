# User Authentication System

## Description

This is a comprehensive user authentication system built with Node.js, Express, and MySQL. It includes features such as registration, login, email verification, password reset, Google OAuth, role-based access control, and profile management.

## Features

- **User Authentication:**
  - Registration with email verification
  - Login with password
  - Password reset functionality
  - Google OAuth integration
- **Authorization:**
  - Role-based access control (Admin, User)
  - JWT authentication
- **Profile Management:**
  - Update profile information (first name, last name, email)
  - Upload and delete profile image
  - Change password
  - Delete account
- **Admin Panel:**
  - User listing with pagination and search
  - Get user details by ID
  - Update user roles
  - Delete users
- **Security:**
  - Password hashing with bcryptjs
  - JWT for authentication
  - Refresh tokens for token renewal
  - Token blacklisting on logout
  - CORS protection
  - Helmet for security headers
  - Express Validator for input validation
- **Email:**
  - Sending verification emails
  - Sending password reset emails
- **Redis:**
  - Storing refresh tokens
  - Blacklisting tokens on logout

## Technologies Used

- Node.js
- Express
- MySQL
- Sequelize
- bcryptjs
- jsonwebtoken
- nodemailer
- redis
- passport
- express-validator
- dotenv
- cors
- helmet
- morgan
- multer

## Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    ```

2.  **Navigate to the backend directory:**

    ```bash
    cd backend
    ```

3.  **Install dependencies:**

    ```bash
    npm install
    ```

4.  **Configure environment variables:**

    - Create a `.env` file in the `backend` directory.
    - Copy the contents from the provided `.env` file and update the values accordingly.

5.  **Database setup:**

    - Ensure you have MySQL installed and running.
    - Create a database with the name specified in the `.env` file (`DB_NAME`).
    - The application uses Sequelize to manage the database schema. The database will be automatically initialized on the first run.

6.  **Redis setup:**

    - Ensure you have Redis installed and running.
    - The connection details are configured in the `.env` file.

7.  **Run the application:**

    ```bash
    npm run dev
    ```

    or

    ```bash
    npm start
    ```

## Environment Variables

- `NODE_ENV`: Environment mode (development or production)
- `PORT`: Server port
- `DB_HOST`: Database host
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `DB_PORT`: Database port
- `JWT_SECRET`: JWT secret key
- `JWT_REFRESH_SECRET`: JWT refresh secret key
- `JWT_EXPIRE`: JWT expiration time (e.g., 1h)
- `JWT_REFRESH_EXPIRE`: JWT refresh expiration time (e.g., 7d)
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port
- `EMAIL_HOST`: Email host (for Nodemailer)
- `EMAIL_PORT`: Email port
- `EMAIL_USER`: Email user
- `EMAIL_PASS`: Email password
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GOOGLE_CALLBACK_URL`: Google OAuth callback URL
- `CLIENT_URL`: Frontend URL

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login user
- `GET /api/auth/verify-email`: Verify email
- `POST /api/auth/forgot-password`: Forgot password
- `POST /api/auth/reset-password`: Reset password
- `POST /api/auth/refresh-token`: Refresh token
- `POST /api/auth/logout`: Logout
- `GET /api/auth/google`: Google OAuth login
- `GET /api/auth/google/callback`: Google OAuth callback

### User

- `GET /api/user/profile`: Get user profile
- `PUT /api/user/profile`: Update user profile
- `POST /api/user/profile/image`: Upload profile image
- `DELETE /api/user/profile/image`: Delete profile image
- `POST /api/user/change-password`: Change password
- `DELETE /api/user/delete-account`: Delete account

### Admin

- `GET /api/admin/users`: Get all users (with pagination and search)
- `GET /api/admin/users/:id`: Get user by ID
- `PUT /api/admin/users/:id/role`: Update user role
- `DELETE /api/admin/users/:id`: Delete user

## Middleware

- **auth.js:** JWT authentication middleware.
- **roleCheck.js:** Role-based access control middleware.
- **validator.js:** Express-validator middleware for request validation.

## Models

- **User.js:** User model definition.
- **Role.js:** Role model definition.

## Controllers

- **authController.js:** Handles authentication-related logic (register, login, logout, etc.).
- **userController.js:** Handles user profile-related logic.
- **adminController.js:** Handles admin-related logic (user management).

## Contributing

Please feel free to contribute to this project by submitting pull requests.

## Folder Structure

backend/
│── src/
│ ├── config/
│ │ ├── db.js # Sequelize + MySQL connection
│ │ ├── redis.js # Redis setup
│ │ ├── passport.js # Google OAuth2 strategy
│ │ └── env.js # Environment variables
│ │
│ ├── models/
│ │ ├── index.js # Sequelize initialization
│ │ ├── User.js # User model
│ │ └── Role.js # Role model (Admin/User)
│ │
│ ├── middleware/
│ │ ├── auth.js # JWT authentication
│ │ ├── roleCheck.js # Role-based access
│ │ └── validator.js # Express-validator rules
│ │
│ ├── controllers/
│ │ ├── authController.js # Register, Login, Google Login, Password reset
│ │ ├── userController.js # Profile CRUD
│ │ └── adminController.js # User list (pagination, search)
│ │
│ ├── routes/
│ │ ├── authRoutes.js
│ │ ├── userRoutes.js
│ │ └── adminRoutes.js
│ │
│ ├── utils/
│ │ ├── mailer.js # Nodemailer config
│ │ ├── token.js # JWT utils
│ │ └── fileUpload.js # Multer config
│ │
│ ├── app.js # Express app setup
│ └── server.js # Server entry point
│
├── tests/ # Unit & integration tests
├── .env
├── package.json
└── README.md

## License

[MIT](LICENSE)
