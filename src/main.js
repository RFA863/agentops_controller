import 'dotenv/config'
import Express from 'express';

import LogHelper from "./helpers/log.helper.js";

import HandlerModel from "./models/handler.model.js";
import HandlerRoute from './routes/handler.route.js';
import HandlerMiddleware from "./middlewares/handler.middleware.js";

class Server {
  constructor() {
    this.API = Express();
    this.env = process.env;
    this.logs = LogHelper;
    this.init();
  }

  async init() {

    if (this.env.DB_ENABLE === 'true') {
      this.model = new HandlerModel(this);
      const isModelConnected = await this.model.connect();

      if (isModelConnected === -1) return;
    }

    this.run();
  }

  run() {
    new HandlerMiddleware(this);
    new HandlerRoute(this);

    this.API.listen(this.env.PORT, this.env.HOST, () => {
      this.logs(`Server Started, Listening PORT ${this.env.PORT}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        this.logs(`Port ${this.env.PORT} is already in use`);
        process.exit(1);
      }
    });

    this.API.get('/', (req, res) => {
      res.status(200).send('AgentOps API')
    });
  }
}

new Server();