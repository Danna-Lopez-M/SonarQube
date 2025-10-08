import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

const testUser = {
  fullName: 'Test User',
  email: 'testuser@example.com',
  password: 'Test1234',
  dni: '123456789',
  phone: '3000000000',
  roles: ['client'],
};

describe('Users Integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    dataSource = app.get(DataSource);

    // Limpiar base de datos
    await dataSource.query('TRUNCATE TABLE labs, deliveries, rental_contracts, contract, users, equipment, roles RESTART IDENTITY CASCADE');
    
    // Insertar roles
    await dataSource.query(`
      INSERT INTO roles (name, description, permissions)
      VALUES
        ('client', 'Cliente', '{}'),
        ('admin', 'Administrador', '{}')
      ON CONFLICT (name) DO NOTHING;
    `);
    // Registrar usuario
    await request(app.getHttpServer()).post('/auth/register').send(testUser);

    // Login
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    token = loginRes.body.token;
    userId = loginRes.body.user?.id;

    // Obtener el id del usuario por email
    const userRes = await request(app.getHttpServer())
        .get(`/users/email/${testUser.email}`)
        .set('Authorization', `Bearer ${token}`);
    userId = userRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get all users', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get user by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('should get user by email', async () => {
    const res = await request(app.getHttpServer())
      .get(`/users/email/${testUser.email}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', testUser.email);
  });

  it('should delete user', async () => {
    const res = await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    
  });
});