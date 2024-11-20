import express from 'express';
import cors from 'cors';

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

// export this express app so we can use it elsewhere
export { app }


// CORS - cross origin resource source
