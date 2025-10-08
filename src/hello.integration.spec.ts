import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Controller, Get } from '@nestjs/common';
import * as request from 'supertest';

// Controlador de ejemplo para mockear la respuesta
@Controller()
class MockHelloController {
  @Get()
  hello() {
    return 'Hello world';
  }
}

describe('Hello Integration (mocked)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MockHelloController],
      providers: [], 
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return Hello World', async () => {
    const res = await request(app.getHttpServer())
      .get('/')
      .expect(200);

    expect(res.text).toContain('Hello world');
  });

  it('should return 404 for unknown route', async () => {
    await request(app.getHttpServer())
      .get('/unknown-route')
      .expect(404);
  });
});