import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

const testUsers = {
  client: {
    fullName: 'Nay User',
    email: 'nay.rentalcliente@example.com',
    password: 'rentaTest1234',
    dni: '9876543210',
    phone: '3022223344',
    roles: ['client'],
  },
  admin: {
    fullName: 'Super nay User',
    email: 'adminayrental@example.com',
    password: 'rentaTest1234',
    dni: '1234567890',
    phone: '3011112233',
    roles: ['admin'],
  },
};

describe('Rentals Integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;
  let equipmentId: string;
  let rentalId: string;

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
    await request(app.getHttpServer()).post('/auth/register').send(testUsers.admin);
    await request(app.getHttpServer()).post('/auth/register').send(testUsers.client);

    // Login client
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUsers.client.email,
        password: testUsers.client.password,
      });
    token = loginRes.body.token;

    // Crear equipo
    const equipmentRes = await request(app.getHttpServer())
      .post('/equipments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: "Laptop Test",
        type: "computer",
        brand: "BrandX",
        model: "ModelY",
        description: "Test laptop",
        price: 1000,
        stock: 10,
        warrantyPeriod: "1 year",
        releaseDate: "2024-01-01",
        computerSpecs: {
          processor: "i5",
          ram: "8GB",
          storage: "256GB SSD",
          os: "Windows 10"
        }
      });
    equipmentId = equipmentRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });



  it('should get all rental contracts', async () => {
    const res = await request(app.getHttpServer())
      .get('/rentals')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a rental contract with valid data', async () => {
    const res = await request(app.getHttpServer())
      .post('/rentals/request')
      .set('Authorization', `Bearer ${token}`)
      .send({
        equipmentId: equipmentId, // Usa el ID creado en beforeAll
        startDate: "2024-06-01T00:00:00.000Z",
        endDate: "2024-12-01T00:00:00.000Z"
      });
    expect(res.status).toBe(201);
  });


});