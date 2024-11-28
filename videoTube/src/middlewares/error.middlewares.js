import mongoose from "mongoose";

import { ApiErrors } from "../utils/ApiErrors.js";

const errorHandler = (err, req, res, next) => {
  let error = err

  if(!(error instanceof ApiErrors)) {
    const statusCode = error.statusCode || error instanceof mongoose.Error ? 400 : 500

    const message = error.message || "Something went wrong"

    error = new ApiErrors(statusCode, message, error?.errors || [], err.stack)
  }

  const resposne = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack} : {})
  }

  return res.status(error.statusCode).json(resposne)
}

export {errorHandler}


