import { AuthService, TokenPayload } from './auth.service';
import { LoginDto, AuthResponseDto, UserInfoDto } from './dto';
export interface AuthenticatedRequest extends Request {
    user: TokenPayload;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    getCurrentUser(req: AuthenticatedRequest): Promise<UserInfoDto>;
}
