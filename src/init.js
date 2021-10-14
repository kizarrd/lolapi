import "regenerator-runtime";
import "dotenv/config";

import app from "./server";

const PORT_NUMBER = process.env.PORT || 3500;

const handleListen = () => console.log(`Server Listening on port ${PORT_NUMBER} 🚀`);

app.listen(PORT_NUMBER, handleListen);