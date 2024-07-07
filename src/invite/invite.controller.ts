import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Request,
  Query,
  Param,
  Patch,
} from '@nestjs/common';
import { InviteService } from './invite.service';
import { CreateInviteDto, InviteStatus } from './dto/invite.dto';
import { Invite } from './invite.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

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
  async getAllInvites(
    @Request() req: Express.Request,
    @Query('status') status?: InviteStatus,
  ): Promise<Invite[]> {
    await this.inviteService.expireInvites(req.user.userId);
    return await this.inviteService.list(req.user.userId, status);
  }

  @Patch(':id/extend')
  async extendExpired(
    @Param('id') id: number,
    @Request() req: Express.Request,
  ) {
    return await this.inviteService.extendInvite(id, req.user.userId);
  }

  @Patch(':id/revoke')
  async revoke(@Param('id') id: number, @Request() req: Express.Request) {
    return await this.inviteService.revokeInvite(id, req.user.userId);
  }

  @Get(':code')
  @Public()
  async getInvite(@Param('code') code: string): Promise<Invite> {
    return await this.inviteService.getInviteWithCode(code);
  }
}
