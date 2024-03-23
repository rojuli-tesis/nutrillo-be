import { Inject, Injectable } from '@nestjs/common';
import { Invite } from './invite.entity';
import { Repository } from 'typeorm';
import { CreateInviteDto } from './dto/invite.dto';
import ShortUniqueId from 'short-unique-id';
import { Admin } from '../admin/admin.entity';

@Injectable()
export class InviteService {
  private uid: ShortUniqueId;
  constructor(
    @Inject('INVITE_REPOSITORY') private inviteRepository: Repository<Invite>,
    @Inject('ADMIN_REPOSITORY') private adminRepository: Repository<Admin>,
  ) {
    this.uid = new ShortUniqueId();
  }

  async create(inviteData: CreateInviteDto, adminId: number): Promise<Invite> {
    const completeData = {
      ...inviteData,
      code: this.uid.rnd(),
    };
    const invite = new Invite();
    Object.keys(completeData).forEach((key) => {
      invite[key] = completeData[key];
    });
    await this.inviteRepository.save(invite);
    const admin = await this.adminRepository.findOne({
      where: {
        id: adminId,
      },
      relations: ['invites'],
    });
    admin.invites.push(invite);
    await this.adminRepository.save(admin);
    return invite;
  }

  async list(adminId: number): Promise<Invite[]> {
    const admin = await this.adminRepository.findOne({
      where: { id: adminId },
      relations: ['invites'],
    });
    return admin.invites;
  }
}
