import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import { InviteService } from './invite.service';
import { CreateInviteDto } from './dto/invite.dto';
import { Invite } from './invite.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('invite')
export class InviteController {
  constructor(private inviteService: InviteService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createInvite(
    @Body() inviteDto: CreateInviteDto,
    @Request() req: Express.Request,
  ) {
    return await this.inviteService.create(inviteDto, req.user.userId);
  }

  @Get()
  async getAllInvites(@Request() req: Express.Request): Promise<Invite[]> {
    return await this.inviteService.list(req.user.userId);
  }
}
