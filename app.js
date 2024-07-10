const express = require('express');
const gameRoutes = require ('./routes/gameRoutes')
const cors = require('cors');
const connectDB = require('./db/connect')
const mongoose = require('mongoose');
const app = express();
require('dotenv').config()

app.use(cors());
app.use(express.json());
app.get('/hello', (req, res) => {res.send('Ton Diamond')})
const port = process.env.PORT || 3001
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, console.log(`Server is listening on port ${port}....`));
    } catch (error) {
        console.log(error)
    }
}
app.use('/api/ton-diamond',gameRoutes)
console.log('Running')

start()