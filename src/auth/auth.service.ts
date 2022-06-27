import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { error } from 'console';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // sign up logic
  async signup(dto: AuthDto) {
    try {
      // generate the password hash
      const hash = await argon.hash(dto.password);

      // save the new user in the DB
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      // return the save user
      // send token response
      return this.singToken(user.id, user.email);
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'credential taken',
          );
        }
      }
    }
    throw error;
  }

  // sign in logic
  async signin(dto: AuthDto) {
    // find user by email
    const user =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

    // if user is not valid
    if (!user) {
      throw new UnauthorizedException(
        'Email is not valid',
      );
    }

    // check the password
    const isTruePassword = await argon.verify(
      user.hash,
      dto.password,
    );

    // if the password is not valid
    if (!isTruePassword) {
      throw new UnauthorizedException(
        'Password is not valid',
      );
    }

    // send token response
    return this.singToken(user.id, user.email);
  }

  // Create token
  async singToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('SECRET_KEY');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15d',
      secret,
    });

    return {
      access_token: token,
    };
  }
}
