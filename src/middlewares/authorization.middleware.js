import jwt from 'jsonwebtoken';

import ResponsePreset from "../helpers/responsePreset.helper.js";

class AuthorizationMiddleware {
  constructor(Server) {
    this.Server = Server;
    this.ResponsePreset = new ResponsePreset();
  }

  check() {
    return (req, res, next) => {
      req.middlewares.authorization = {};
      const token = req.headers['authorization'];

      if (!token || token === 'undefined') {

        return res.status(401).json(this.ResponsePreset.resErr(
          401, 'Request Unauthorized', 'token', { code: -1 }
        ));
      };

      jwt.verify(token, this.Server.env.JWT_ACCESS_TOKEN_SECRET, (err, data) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {

            if (!req.path.endsWith('refresh-token')) return res.status(401).json(this.ResponsePreset.resErr(
              401, 'Token Expired', 'token', { code: -3 }
            ));

            data = jwt.decode(token);

          } else {

            return res.status(401).json(this.ResponsePreset.resErr(401, 'Token Unauthorized'));
          }
        }

        req.middlewares.authorization = data;

        return next();
      });
    }
  }


}

export default AuthorizationMiddleware;