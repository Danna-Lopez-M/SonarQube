import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

const testingUsers = {
  admin: {
    fullName: 'Admin',
    email: 'lab.admin@example.com',
    password: 'labTest1234',
    dni: '1234567890',
    phone: '3011112233',
    roles: ['admin'],
  },
  client: {
    fullName: 'Client',
    email: 'cliente.lab@example.com',
    password: 'labTest1234',
    dni: '9876543210',
    phone: '3022223344',
    roles: ['client'],
  },
};

describe('Labs Integration', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let token: string;
    let rentalContractId: string;

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
        await request(app.getHttpServer()).post('/auth/register').send(testingUsers.client);

        // Login admin para crear labs
        const loginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: testingUsers.admin.email,
                password: testingUsers.admin.password,
            });
        token = loginRes.body.token;
        expect(token).toBeDefined();

        // Crear equipo y contrato de renta para asociar el reporte
        const equipmentRes = await request(app.getHttpServer())
            .post('/equipments')
            .set('Authorization', `Bearer ${token}`)
            .send({
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
            });
        const equipmentId = equipmentRes.body.id;

        const rentalRes = await dataSource.query(
                `INSERT INTO rental_contracts (id, "clientId", "equipmentId", "startDate", "endDate", status)
                 VALUES (uuid_generate_v4(), (SELECT id FROM users WHERE email = $1), $2, $3, $4, $5) RETURNING id`,
                [testingUsers.client.email, equipmentId, '2025-05-12', '2025-05-20', 'active']
            );
            rentalContractId = rentalRes[0].id;
    });

    afterAll(async () => {
        await app.close();
    });

    it('should create a new lab report', async () => {
        // Login como cliente
        const clientLogin = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: testingUsers.client.email,
                password: testingUsers.client.password,
            });
        const clientToken = clientLogin.body.token;
    
        const response = await request(app.getHttpServer())
            .post(`/labs/report/${rentalContractId}`)
            .set('Authorization', `Bearer ${clientToken}`)
            .send({ notes: 'Screen does not turn on' });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Equipo reportado y enviado al laboratorio');
        expect(response.body.lab).toBeDefined();
        expect(response.body.lab.notes).toBe('Screen does not turn on');
        expect(response.body.lab.isRepaired).toBe(false);
        expect(response.body.lab.equipment).toBeDefined();
        expect(response.body.lab.reportedBy).toBeDefined();
    });

    it('should not allow reporting without authentication', async () => {
        const response = await request(app.getHttpServer())
            .post(`/labs/report/${rentalContractId}`)
            .send({ notes: 'No auth' });
        expect(response.status).toBe(401);
    });
    
});