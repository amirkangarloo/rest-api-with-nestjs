import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { error } from 'console';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

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
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });

      // return the save user
      return user;
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
    const isTruePassword = await argon.verify(user.hash, dto.password)

    // if the password is not valid
    if (!isTruePassword) {
      throw new UnauthorizedException(
        'Password is not valid',
      );
    }

    // send response
    delete user.hash
    return user
  }
}
