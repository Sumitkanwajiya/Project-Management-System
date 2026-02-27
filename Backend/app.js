import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import { errorMiddleware } from './middleware/error.js';
import authRouter from './Routes/userRoutes.js';
import adminRouter from './Routes/AdminRoutes.js';
import studentRouter from './Routes/StudentRoutes.js';
import notificationRouter from './Routes/notificationRoutes.js';
import deadlineRouter from './Routes/deadlineRoutes.js';
import teacherRouter from './Routes/teacherRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import projectRouter from './Routes/projectRoutes.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

app.set('trust proxy', 1); // Trust first proxy (Render/Vercel)

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            "http://localhost:5173",
            process.env.FRONTEND_URL
        ];

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
            callback(null, true);
        } else {
            console.log("Blocked by CORS:", origin); // Debugging
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

const uploadDir = path.join(__dirname, "uploads");
const tempDir = path.join(uploadDir, "temp");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/student', studentRouter);
app.use('/api/v1/notification', notificationRouter);
app.use('/api/v1/project', projectRouter);
app.use('/api/v1/deadline', deadlineRouter);
app.use('/api/v1/teacher', teacherRouter);

// Error handling middleware – must have 4 parameters
app.use(errorMiddleware);

export default app;
