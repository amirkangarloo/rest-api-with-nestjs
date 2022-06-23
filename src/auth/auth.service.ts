import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AuthService {
    constructor(private prisma:PrismaService){}
    singup() {
        return {
            mes: 'I am singup'
        }
    }
    
    singin() {
        return {
            mes: 'I am singin'
        }
    }
}