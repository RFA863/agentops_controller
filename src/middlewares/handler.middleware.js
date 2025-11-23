import Express from "express";
import cors from "cors";

class HandlerMiddleware {
  constructor(server) {
    this.server = server;
    this.API = this.server.API;

    this.global();
  }

  global() {

    this.API.use(Express.json());

    this.API.use(cors({
      methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
      origin: this.server.env.MIDDLEWARE_ORIGIN
    }));

    this.API.use((req, res, next) => {
      req.middlewares = {};
      next();
    });
  }
}

export default HandlerMiddleware;
