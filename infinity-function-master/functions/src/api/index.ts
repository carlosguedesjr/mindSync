import express, { NextFunction, Request, Response } from "express";
import "express-async-errors";

import * as functions from "firebase-functions";
import cors from "cors";
import nocache from "nocache";

import routes from "./routes";
import AppError from "../exceptions/app-error";

const app = express();
const regionalFunctions = functions.region('southamerica-east1');

app.disable('x-powered-by');

app.use(nocache());
app.use(cors());

app.use(express.json());

app.use(routes);

app.use(
  (
    err: Error,
    request: Request,
    response: Response,
    nextFunction: NextFunction
  ) => {
    if (err instanceof AppError) {
      return response.status(err.statusCode).json({
        code: err.code,
        message: err.message,
        status: err.statusCode
      });
    }

    console.error(err);

    return response.status(500).json({
      status: 500,
      message: 'Internal server error.'
    });
  }
);

export const api = regionalFunctions.https.onRequest(app);
