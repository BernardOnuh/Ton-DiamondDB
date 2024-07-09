const express = require('express');
const depositRoutes = require ('./routes/depositRoutes')
const cors = require('cors');
const connectDB = require('./db/connect')
const mongoose = require('mongoose');
const app = express();
require('dotenv').config()

app.use(cors());
app.use(express.json());
app.get('/hello', (req, res) => {res.send('Task Manager')})
const port = process.env.PORT || 3001
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, console.log(`Server is listening on port ${port}....`));
    } catch (error) {
        console.log(error)
    }
}
app.use('/api/gummybear',depositRoutes)
console.log('Running')

start()