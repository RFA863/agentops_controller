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

  async register(data) {
    const findUser = await this.model.Users.findUnique({
      where: { username: data.username }
    })

    if (findUser) return -1;

    const hashPassword = await bcrypt.hash(data.password, 10);

    const userData = await this.model.Users.create({
      data: {
        username: data.username,
        password: hashPassword
      }
    });

    delete userData.password

    return userData;
  }

  async login(data) {

    const user = await this.model.Users.findUnique({
      where: {
        username: data.username,
      }
    });

    if (!user) return -1;

    const matchPassword = await bcrypt.compare(data.password, user.password);

    if (!matchPassword) return -2;

    const token = this.generateToken(user.id);
    delete user.password

    return { user, token };
  }

  async refreshToken(dataToken, refreshToken) {
    try {

      const decoded = jwt.verify(refreshToken, this.server.env.JWT_REFRESH_TOKEN_SECRET);

      if (decoded.userid !== dataToken.userid) return -1;

      return this.generateToken(dataToken.userid);

    } catch (error) {
      this.server.logs("RefresToken Error : " + error)
      return -2;
    }
  }
}

export default AuthService;