import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import json from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import AuthRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/post.js";
import { register } from './controllers/auth';
import { createPost } from "./controllers/posts.js";
import { verifyToken } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }))
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.subscribe("/assets", express.static(path.join(__dirname, 'public/assets')));

// FILE STORAGE
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/assets");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// ROUTES WITH FILES
app.post("auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

// ROUTES
app.use("/auth", AuthRoutes);
app.use("/user", userRoutes);
app.use("/posts", postRoutes);

// MONGOOSE SETUP
const PORT = process.env.PORT || 5005;
mongoose.connect(process.env.MONGO_URL, {
    // useNewUrlParser: true,
    // UseUnifiedTopology: true,
}).then(() => {
    app.listen(PORT, () => console.log(`💪Server running at Port: ${PORT}`))
})
.catch((error) => console.log(`Error: ${error}  did not connect😒`))