import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

const testingUsers = {
  admin: {
    fullName: 'Admin User',
    email: 'admin@example.com',
    password: 'Test1234',
    dni: '1234567890',
    phone: '3011112233',
    roles: ['admin'],
  },
  client: {
    fullName: 'Client User',
    email: 'client@example.com',
    password: 'Test1234',
    dni: '9876543210',
    phone: '3022223344',
    roles: ['client'],
  },
  technician: {
    fullName: 'Technician User',
    email: 'tech@example.com',
    password: 'Test1234',
    dni: '1122334455',
    phone: '3033334455',
    roles: ['technician'],
  },
};

describe('Contract Integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;
  let clientId: string;
  let technicianId: string;
  let equipmentId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    dataSource = app.get(DataSource);

    // Limpiar base de datos
    await dataSource.query('TRUNCATE TABLE deliveries, rental_contracts, users, equipment RESTART IDENTITY CASCADE');

    await dataSource.query(`
      INSERT INTO roles (name, description, permissions)
      VALUES
        ('client', 'Cliente', '{}'),
        ('admin', 'Administrador', '{}'),
        ('technician', 'Técnico', '{}')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Registrar usuarios
    await request(app.getHttpServer()).post('/auth/register').send(testingUsers.admin);
    const clientRes = await request(app.getHttpServer()).post('/auth/register').send(testingUsers.client);
    clientId = clientRes.body.user?.id || clientRes.body.id;
    const techRes = await request(app.getHttpServer()).post('/auth/register').send(testingUsers.technician);
    technicianId = techRes.body.user?.id || techRes.body.id;

  
    const equipmentRes = await dataSource.query(`
      INSERT INTO equipment (name, description, type, brand, model, price, stock, "warrantyPeriod", "releaseDate")
      VALUES ('Laptop HP', 'Laptop de pruebas', 'computer', 'HP', 'EliteBook', 1000, 5, 12, '2024-01-01')
      RETURNING id
    `);
    equipmentId = equipmentRes[0].id;

    // Login client
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testingUsers.client.email,
        password: testingUsers.client.password,
      });
    token = loginRes.body.token;
    expect(token).toBeDefined();
    
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 404 for GET /contract/notfound', async () => {
    await request(app.getHttpServer())
      .get('/contract/notfound')
      .expect(404);
  });

  it('should get all contracts (GET /contracts/my)', async () => {
    const res = await request(app.getHttpServer())
      .get('/contracts/my')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });



  // Puedes agregar más pruebas aquí...
});