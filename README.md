# Intel

This project connects to a MongoDB database and runs a server on port 5000. Please follow the steps below to set up and run the project.

## Prerequisites

- [Node.js](https://nodejs.org/en/) (for backend)
- [MongoDB](https://www.mongodb.com/) account (for connecting to the database)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) (for package management)

## Installation

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/mayankjaiswal27/intel
   cd intel
   npm install
  ```

2. Create a `.env` file in the root directory and add the following content:
   ```bash
   MONGO_URI=mongodb+srv://<your-mongodb-uri>
   PORT=5000
   ```
   Replace `<your-mongodb-uri>` with your MongoDB URI.

3. Start the frontend server:
   ```bash
   npm start
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```