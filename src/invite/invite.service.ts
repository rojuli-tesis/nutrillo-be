import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Invite } from './invite.entity';
import { Repository } from 'typeorm';
import { CreateInviteDto, InviteStatus } from './dto/invite.dto';
import ShortUniqueId from 'short-unique-id';
import { add } from 'date-fns';
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
      expiresAt: add(new Date(), { days: 7 }),
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

  async list(adminId: number, status?: InviteStatus): Promise<Invite[]> {
    const queryBuilder = this.inviteRepository.createQueryBuilder('invite');
    queryBuilder.where('invite.adminId = :adminId', { adminId });
    if (status) {
      queryBuilder.andWhere('invite.status = :status', {
        status: status.toUpperCase(),
      });
    }
    return queryBuilder.getMany();
  }

  async expireInvites(adminId: number): Promise<void> {
    const queryBuilder = this.inviteRepository.createQueryBuilder('invite');
    queryBuilder.where('invite.adminId = :adminId', { adminId });
    queryBuilder.andWhere('invite.expiresAt < :now', { now: new Date() });
    const invites = await queryBuilder.getMany();
    invites.forEach((invite) => {
      invite.status = InviteStatus.EXPIRED;
    });
    await this.inviteRepository.save(invites);
  }

  async getInviteWithCode(code: string): Promise<Invite> {
    const invite = await this.inviteRepository.findOne({
      where: {
        code,
      },
    });
    if (!invite) {
      throw new NotFoundException();
    }
    // set expired if date is past
    if (invite.expiresAt < new Date()) {
      invite.status = InviteStatus.EXPIRED;
      await this.inviteRepository.save(invite);
    }
    if (invite.status === InviteStatus.PENDING) {
      return invite;
    }
    throw new NotFoundException();
  }

  async acceptInvite(id: number): Promise<void> {
    const invite = await this.inviteRepository.findOne({
      where: {
        id,
      },
    });
    invite.status = InviteStatus.ACCEPTED;
    invite.acceptedAt = new Date();
    await this.inviteRepository.save(invite);
  }

  async extendInvite(id: number, adminId: number): Promise<Invite> {
    const invite = await this.inviteRepository.findOne({
      where: {
        id,
        admin: { id: adminId },
      },
      relations: ['admin'],
    });
    if (!invite || invite.admin.id !== adminId) {
      throw new NotFoundException();
    }
    invite.expiresAt = add(new Date(), { days: 7 });
    invite.status = InviteStatus.PENDING;
    return await this.inviteRepository.save(invite);
  }

  async revokeInvite(id: number, adminId: number): Promise<void> {
    const invite = await this.inviteRepository.findOne({
      where: {
        id,
        admin: { id: adminId },
      },
      relations: ['admin'],
    });
    if (!invite || invite.admin.id !== adminId) {
      throw new NotFoundException();
    }
    invite.status = InviteStatus.REVOKED;
    await this.inviteRepository.save(invite);
  }
}
