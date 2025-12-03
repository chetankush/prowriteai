import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService, TokenPayload } from './auth.service';
import { LoginDto, AuthResponseDto, UserInfoDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';

export interface AuthenticatedRequest extends Request {
  user: TokenPayload;
}

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/login
   * Handle Supabase token exchange
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.handleSupabaseUser(loginDto.access_token);
  }

  /**
   * GET /api/auth/me
   * Return current user info
   */
  @Get('me')
  @UseGuards(AuthGuard)
  async getCurrentUser(@Request() req: AuthenticatedRequest): Promise<UserInfoDto> {
    return this.authService.getCurrentUser(req.user);
  }
}
