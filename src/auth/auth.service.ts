import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { Request } from 'express'; // Importando Request do Express

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user.toObject(); // toObject é garantido para um UserDocument
      console.log('Resultado do validateUser:', result);
      return result; // Retorna o objeto sem o password
    }
    return null;
  }
  
  
  async login(user: any) {
    const payload = { username: user.email, sub: user._id.toString(), professor: user.professor }; // Certifique-se de converter o _id para string
    console.log('Payload JWT:', payload); // Verifique se o payload está correto agora
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
  

  async register(createUserDto: any) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    createUserDto.password = hashedPassword;

    const user = await this.userService.create(createUserDto);
    return { message: 'User registered successfully' };
  }

  async getUserFromRequest(request: Request) { // Usando Request do Express
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header not found');
    }

    const token = authHeader.split(' ')[1];
    const decoded = this.jwtService.verify(token) as JwtPayload; // Tipagem para JwtPayload
    const user = await this.userService.findOne(decoded.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}

// Definindo o JwtPayload
interface JwtPayload {
  sub: string;
  username: string;
}
