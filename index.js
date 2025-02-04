require('dotenv').config()
const express = require('express')
const app = express()

app.get('/', (req,res)=>{
    res.send('sorry cant find it')
})

app.get('/hello',(req,res)=>{
    res.send('HELLO WORLD')
})

app.listen(PORT,(err)=>{
    if(err) throw err
    console.log(`Server Started at ${process.env.PORT}, link - http://localhost:${process.env.PORT}/`)
})