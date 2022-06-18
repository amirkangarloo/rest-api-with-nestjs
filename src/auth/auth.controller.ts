import { Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('singup')
    singup(){
        return this.authService.singup()
    }
    
    @Post('singin')
    singin(){
        return this.authService.singin()
    }
    
}