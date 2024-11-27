import express from 'express';
import cors from 'cors';
import healthcheckRouter  from './routes/healthcheck.routes.js';
import cookieParser from 'cookie-parser';

// create an app from express
const app = express()

// middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  })
);

// common middlewares
// limit thedata
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit:"16kb"}))
// serving assets
app.use(express.static("public"))
app.use(cookieParser)
// routes
app.use("/api/v1/healthcheck", healthcheckRouter)



export { app }


// CORS - cross origin resource source
