import cors from "cors";
import express, { Application } from "express";
import helmet from "helmet";

const app: Application = express();

//-----middlewares--------//

app.use(cors());
app.use(helmet());
app.use(express.json());

export default app;
