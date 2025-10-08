import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

const testingUsers = {
  admin: {
    fullName: 'Admin User',
    email: 'admin.equipments@example.com',
    password: 'equipoTest1234',
    dni: '1234567890',
    phone: '3011112233',
    roles: ['admin'],
  },
  client: {
    fullName: 'Client User',
    email: 'client.equipments@example.com',
    password: 'equipoTest1234',
    dni: '9876543210',
    phone: '3022223344',
    roles: ['client'],
  },
};

describe('Equipments Integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;
  let equipmentId: string;

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
    
    await dataSource.query(`
      INSERT INTO roles (name, description, permissions)
      VALUES
        ('client', 'Cliente', '{}'),
        ('admin', 'Administrador', '{}')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Registrar usuarios
    await request(app.getHttpServer()).post('/auth/register').send(testingUsers.admin);
    const clientRes = await request(app.getHttpServer()).post('/auth/register').send(testingUsers.client);

    // Login admin para crear equipos
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testingUsers.admin.email,
        password: testingUsers.admin.password,
      });
    token = loginRes.body.token;
    expect(token).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a new equipment', async () => {
    const equipmentDto = {
      name: "Laptop Pro",
      type: "computer",
      brand: "TechBrand",
      model: "X-2000",
      description: "High performance laptop",
      price: 1299.99,
      stock: 50,
      warrantyPeriod: "2 years",
      releaseDate: "2023-06-15",
      computerSpecs: {
        processor: "Intel Core i7",
        ram: "16GB DDR4",
        storage: "1TB SSD",
        os: "Windows 11 Pro"
      }
    };

    const response = await request(app.getHttpServer())
        .post('/equipments')
        .set('Authorization', `Bearer ${token}`)
        .send(equipmentDto);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        equipmentId = response.body.id;
    });

    it('should retrieve the created equipment', async () => {
        const response = await request(app.getHttpServer())
        .get(`/equipments/${equipmentId}`)
        .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Laptop Pro');
        expect(response.body.computerSpecs.processor).toBe('Intel Core i7');
    });

    it ('should get all equipments', async () => {
        const response = await request(app.getHttpServer())
        .get('/equipments')
        .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
    });

    it ('should get one equipment', async () => {
        const response = await request(app.getHttpServer())
        .get(`/equipments/${equipmentId}`)
        .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
    });

    it('should delete the equipment', async () => {
        const response = await request(app.getHttpServer())
        .delete(`/equipments/${equipmentId}`)
        .set('Authorization', `Bearer ${token}`);
        expect([200, 204]).toContain(response.status);
    });



});