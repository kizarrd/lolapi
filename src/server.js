import express from "express";
import morgan from "morgan";
import homeRouter from "./routers/homeRouter";
import summonerRouter from "./routers/summonerRouter";

const PORT_NUMBER = 3500;

const app = express();

app.set("view engine", "pug");
app.set("views", process.cwd()+"/src/views");

app.use(morgan('dev'));
app.use("/", homeRouter);
app.use("/summoner", summonerRouter);

const handleListen = () => console.log(`Server Listening on port ${PORT_NUMBER} 🚀`);

app.listen(PORT_NUMBER, handleListen);

