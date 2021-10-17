import mongoose from "mongoose";

mongoose.connect(process.env.DB_US_URL || process.env.DB_URL_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
const handleOpen = () => console.log("✅ Connected to DB");
const handleError = (error) => console.log("DB Error", error);
db.on("error", handleError);
db.once("open", handleOpen);