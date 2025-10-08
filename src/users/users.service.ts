import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  InternalServerErrorException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, ...rest } = createUserDto;
      const hashedPassword = bcrypt.hashSync(password, 10);

      const user = this.userRepository.create({
        ...rest,
        password: hashedPassword,
        roles: createUserDto.roles || ['client'],
      });

      return await this.userRepository.save(user);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<{ user: Omit<User, 'password'>; passwordChanged: boolean }> {
    let passwordChanged = false;
    
    if (updateUserDto.password) {
      updateUserDto.password = bcrypt.hashSync(updateUserDto.password, 10);
      passwordChanged = true;
    }

    const user = await this.userRepository.preload({
      id,
      ...updateUserDto,
    });

    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    try {
      await this.userRepository.save(user);
      const { password: _, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        passwordChanged
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async findByEmail(email: string, withPassword = false): Promise<User | null> {
    const query = this.userRepository.createQueryBuilder('user')
      .where('user.email = :email', { email: email.toLowerCase() });

    if (withPassword) {
      query.addSelect('user.password');
    }

    return query.getOne();
  }

  async updateUserRoles(id: string, roles: string[]): Promise<User> {
    const user = await this.findOne(id);
    user.roles = roles;
    return this.userRepository.save(user);
  }

  async toggleUserStatus(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = !user.isActive;
    return this.userRepository.save(user);
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException('Email already exists');
    }
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}