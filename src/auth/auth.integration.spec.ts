import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';

import { Contract } from '../contract/entities/contract.entity';
import { ComputerSpecs } from '../equipments/entities/computer-specs.entity';
import { Equipment } from '../equipments/entities/equipment.entity';
import { PhoneSpecs } from '../equipments/entities/phone-specs.entity';
import { PrinterSpecs } from '../equipments/entities/printer-specs.entity';
import { RentalContract } from '../rentals/entities/rental.entity';
import { Role } from '../roles/entities/role.entity';
import { RolesModule } from '../roles/roles.module';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { AuthModule } from './auth.module';
import { ValidRoles } from './interfaces/valid-roles';

jest.setTimeout(30000);

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('DB_HOST'),
            port: +configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_NAME'),
            entities: [
              User,
              Role,
              Contract,
              RentalContract,
              Equipment,
              ComputerSpecs,
              PrinterSpecs,
              PhoneSpecs,
            ],
            synchronize: true,
            logging: false,
          }),
          inject: [ConfigService],
        }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get('JWT_SECRET'),
            signOptions: { expiresIn: '1h' },
          }),
          inject: [ConfigService],
        }),
        AuthModule,
        UsersModule,
        RolesModule,
      ],
    }).compile();
  
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  
    const roles = [
      { name: 'user', description: 'User role' },
      { name: 'admin', description: 'Admin role' },
      { name: 'client', description: 'Client role' },
      { name: 'technician', description: 'Technician role' },
    ];
    for (const role of roles) {
      await request(app.getHttpServer())
        .post('/roles')
        .send(role)
        .catch(() => {});
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {

    it('should fail with weak password', async () => {
      const weakPasswordData = {
        fullName: 'Weak Password',
        email: 'weak@example.com',
        password: 'password',
        dni: '222222222',
        phone: '2222222222',
        roles: ['user'],
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(weakPasswordData)
        .expect(400);

      expect(response.body.message).toBeDefined();
      expect(
        Array.isArray(response.body.message)
          ? response.body.message.some((msg: string) => msg.toLowerCase().includes('password'))
          : response.body.message.toLowerCase().includes('password')
      ).toBe(true);
    });
    
  });

  describe('POST /auth/login', () => {
    it('should fail with wrong password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBeDefined();
    });

    it('should fail with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!@#',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBeDefined();
    });
   
    it('should fail with invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          fullName: 'Wrong Password User',
          email: 'wrongpass@example.com',
          password: 'Password123!@#',
          dni: '888888888',
          phone: '8888888888',
        })
        .catch(() => {});
    
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'wrongpass@example.com',
          password: 'IncorrectPassword',
        })
        .expect(401);
    
      expect(response.body.message).toContain('Credenciales inválidas');
    });

    it('should fail with missing fields', async () => {
      const loginData = {
        email: '',
        password: '',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /auth/check-auth-status', () => {
    beforeAll(async () => {
      // Registra el usuario antes de hacer login
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'Password123!@#',
          dni: '123456789',
          phone: '1234567890',
          roles: ['user'],
        })
        .catch(() => {});
  
      const loginData = {
        email: 'test@example.com',
        password: 'Password123!@#',
      };
      const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginData);

      authToken = response.body.token;
    });


    it('should fail without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/check-auth-status')
        .expect(401);

      expect(response.body.message).toBeDefined();
    });

    it('should fail with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/check-auth-status')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /auth/admin-dashboard', () => {
    beforeAll(async () => {
      const adminData = {
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: 'Admin123!@#',
        dni: '111111111',
        phone: '1111111111',
        roles: [ValidRoles.admin],
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(adminData);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'Admin123!@#',
        });

      adminToken = loginResponse.body.token;
    });


    it('should fail without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/admin-dashboard')
        .expect(401);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('JwtAuthGuard', () => {
    let token: string;
  
    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          fullName: 'Guard User',
          email: 'guarduser@example.com',
          password: 'Password123!@#',
          dni: '555555555',
          phone: '5555555555',
        })
        .catch(() => {});
  
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'guarduser@example.com',
          password: 'Password123!@#',
        });
      token = res.body.token;
    });
  
    it('should return 401 if no token is provided', async () => {
      await request(app.getHttpServer())
        .get('/auth/check-auth-status')
        .expect(401);
    });
  
    it('should return 401 if token is invalid', async () => {
      await request(app.getHttpServer())
        .get('/auth/check-auth-status')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);
    });
  
  });

});