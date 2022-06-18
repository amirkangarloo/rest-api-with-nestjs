import { Injectable } from "@nestjs/common";

@Injectable({})
export class AuthService {
    
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