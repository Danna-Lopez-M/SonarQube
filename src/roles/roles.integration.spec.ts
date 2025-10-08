import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

const adminUser = {
    fullName: 'role Dulce admi User',
    email: 'roleadulcen@example.com',
    password: 'roleTest1234',
    dni: '1234567890',
    phone: '3011112233',
    roles: ['admin'],
};

describe('Roles Integration', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let token: string;

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

        // Insertar roles de prueba
        await dataSource.query(`
            INSERT INTO roles (name, description, permissions)
            VALUES
                ('client', 'Cliente', '{}'),
                ('admin', 'Administrador', '{}'),
                ('technician', 'Técnico', '{}')
            ON CONFLICT (name) DO NOTHING;
        `);

        // Registrar usuario admin
        await request(app.getHttpServer()).post('/auth/register').send(adminUser);

        // Login admin
        const loginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: adminUser.email, password: adminUser.password });
        token = loginRes.body.token;
    });

    afterAll(async () => {
        await app.close();
    });

    it('should get all roles (GET /roles)', async () => {
        const res = await request(app.getHttpServer())
            .get('/roles')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(3);
    });

    it('should create a new role (POST /roles)', async () => {
        const res = await request(app.getHttpServer())
            .post('/roles')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'tester',
                description: 'Tester role',
                permissions: [],
            });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('name', 'tester');
    });

    it('should not create a role with existing name (POST /roles)', async () => {
        const res = await request(app.getHttpServer())
            .post('/roles')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'admin',
                description: 'Duplicate admin',
                permissions: [],
            });
        expect(res.status).toBe(409);
    });
});