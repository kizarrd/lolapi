import express from "express";

const PORT_NUMBER = 3500;

const app = express();

const handleListen = () => console.log(`Server Listening on port ${PORT_NUMBER} 🚀`);

app.listen(PORT_NUMBER, handleListen);

