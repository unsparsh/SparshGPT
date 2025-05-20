const express = require('express');
const PORT = 8000;
const cors = require('cors');
require('dotenv').config();
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(cors());

app.listen(PORT , () =>{
    console.log(`Server is running at PORT  ${PORT}`);
})

const api = process.env.groq_api_key;

app.get("/" , (req,res) =>{
    res.send("Welcome to the Home page of backend");
})

app.post("/completions" , async (req,res) => {

    const options = {
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json',
            'Authorization' : `Bearer ${api}`
        },
        body: JSON.stringify({
            model: "llama3-8b-8192",
            messages:req.body.messages,
            temperature: 0.7,
            max_tokens: 100,
        }) 
    }

    try{
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions' , options);
        const data = await response.json();

          if (!response.ok) {
            console.error("Groq API Error:", data);
            return res.status(500).json({ error: data });
        }

        res.send(data);
    }catch(err){
        console.error("Error while fetching from Groq:", err);
        res.status(500).json({ error: "Something went wrong with Groq API" });

    }
});