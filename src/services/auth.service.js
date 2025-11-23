import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

class AuthService {
  constructor(server) {
    this.server = server;
    this.model = this.server.model.db;
  }

  generateToken(id) {
    const token = jwt.sign(
      { userid: id }, this.server.env.JWT_ACCESS_TOKEN_SECRET,
      { expiresIn: this.server.env.JWT_EXPIRED_KEY }
    );

    const refreshToken = jwt.sign(
      { userid: id }, this.server.env.JWT_REFRESH_TOKEN_SECRET
    );

    return { token, refreshToken };
  }

  async register() {
    const findUser = await model.Users.findUnique({
      where: { username: req.username }
    })

    if (findUser) return -1;

    const hashPassword = await bcrypt.hash(req.password, 10);

    const userData = await model.Users.create({
      data: {
        username: req.username,
        password: hashPassword
      }
    });

    delete userData.password

    return userData;
  }

  async login(req) {

    const user = await model.Users.findUnique({
      where: {
        username: req.username,
      }
    });

    if (!user) return -1;

    const matchPassword = await bcrypt.compare(req.password, user.password);

    if (!matchPassword) return -2;

    const token = this.generateToken(user.id);
    delete user.password

    return { user, token };
  }

  async refreshToken(dataToken, refreshToken) {
    try {

      const decoded = jwt.verify(refreshToken, this.Server.env.JWT_REFRESH_TOKEN_SECRET);

      if (decoded.userid !== dataToken.userid) return -1;

      return this.generateToken(dataToken.userid);

    } catch (error) {
      console.log(error);
      return -2;
    }
  }
}

export default AuthService;