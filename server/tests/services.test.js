import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Services API Integration & Ownership Tests', () => {
  let userACookie;
  let userBCookie;

  const userA = {
    name: 'Alice Designer',
    email: 'alice@campus.edu',
    username: 'alicedesign',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  const userB = {
    name: 'Bob Coder',
    email: 'bob@campus.edu',
    username: 'bobcoder',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  const sampleService = {
    title: 'Professional Python Programming & Debugging',
    description: 'I will help debug complex Python code, algorithms, and homework assignments with clear comments.',
    category: 'programming',
    price: 35,
    deliveryTime: 2,
    tags: ['python', 'debugging', 'algorithms'],
    status: 'published',
  };

  beforeEach(async () => {
    const resA = await request(app).post('/api/auth/register').send(userA);
    userACookie = resA.headers['set-cookie'];

    const resB = await request(app).post('/api/auth/register').send(userB);
    userBCookie = resB.headers['set-cookie'];
  });

  it('should return empty list when no services exist', async () => {
    const res = await request(app).get('/api/services');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.services).toEqual([]);
    expect(res.body.data.pagination.total).toBe(0);
  });

  it('should reject service creation when unauthenticated', async () => {
    const res = await request(app)
      .post('/api/services')
      .send(sampleService);

    expect(res.status).toBe(401);
  });

  it('should allow authenticated user to publish a service', async () => {
    const res = await request(app)
      .post('/api/services')
      .set('Cookie', userACookie)
      .send(sampleService);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.service.title).toBe(sampleService.title);
    expect(res.body.data.service.price).toBe(35);
  });

  it('should retrieve published services via public marketplace API', async () => {
    await request(app)
      .post('/api/services')
      .set('Cookie', userACookie)
      .send(sampleService);

    const res = await request(app).get('/api/services');
    expect(res.status).toBe(200);
    expect(res.body.data.services.length).toBe(1);
    expect(res.body.data.services[0].title).toBe(sampleService.title);
    expect(res.body.data.services[0].owner.username).toBe(userA.username);
  });

  it('should filter services by category and search keyword', async () => {
    await request(app)
      .post('/api/services')
      .set('Cookie', userACookie)
      .send(sampleService);

    // Search matching
    const matchRes = await request(app).get('/api/services?search=python');
    expect(matchRes.body.data.services.length).toBe(1);

    // Search not matching
    const noMatchRes = await request(app).get('/api/services?search=graphicdesign');
    expect(noMatchRes.body.data.services.length).toBe(0);

    // Category matching
    const catMatch = await request(app).get('/api/services?category=programming');
    expect(catMatch.body.data.services.length).toBe(1);

    // Category not matching
    const catNoMatch = await request(app).get('/api/services?category=tutoring');
    expect(catNoMatch.body.data.services.length).toBe(0);
  });

  it('should allow owner to update their own service', async () => {
    const createRes = await request(app)
      .post('/api/services')
      .set('Cookie', userACookie)
      .send(sampleService);

    const serviceId = createRes.body.data.service._id;

    const updateRes = await request(app)
      .patch(`/api/services/${serviceId}`)
      .set('Cookie', userACookie)
      .send({
        price: 45,
        title: 'Updated Python & FastAPI Programming Assistance',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.service.price).toBe(45);
    expect(updateRes.body.data.service.title).toBe('Updated Python & FastAPI Programming Assistance');
  });

  it('should strictly PREVENT User B from editing User A service (Ownership Enforcement)', async () => {
    const createRes = await request(app)
      .post('/api/services')
      .set('Cookie', userACookie)
      .send(sampleService);

    const serviceId = createRes.body.data.service._id;

    // Bob tries to edit Alice's service
    const unauthorizedEdit = await request(app)
      .patch(`/api/services/${serviceId}`)
      .set('Cookie', userBCookie)
      .send({
        price: 5,
        title: 'Hacked Title By Bob',
      });

    expect(unauthorizedEdit.status).toBe(403);
    expect(unauthorizedEdit.body.success).toBe(false);

    // Verify service remained intact
    const getRes = await request(app).get(`/api/services/${serviceId}`);
    expect(getRes.body.data.service.price).toBe(35);
    expect(getRes.body.data.service.title).toBe(sampleService.title);
  });

  it('should strictly PREVENT User B from deleting User A service', async () => {
    const createRes = await request(app)
      .post('/api/services')
      .set('Cookie', userACookie)
      .send(sampleService);

    const serviceId = createRes.body.data.service._id;

    const unauthorizedDelete = await request(app)
      .delete(`/api/services/${serviceId}`)
      .set('Cookie', userBCookie);

    expect(unauthorizedDelete.status).toBe(403);

    // Verify service still exists
    const getRes = await request(app).get(`/api/services/${serviceId}`);
    expect(getRes.status).toBe(200);
  });

  it('should allow owner to delete their service', async () => {
    const createRes = await request(app)
      .post('/api/services')
      .set('Cookie', userACookie)
      .send(sampleService);

    const serviceId = createRes.body.data.service._id;

    const deleteRes = await request(app)
      .delete(`/api/services/${serviceId}`)
      .set('Cookie', userACookie);

    expect(deleteRes.status).toBe(200);

    const getRes = await request(app).get(`/api/services/${serviceId}`);
    expect(getRes.status).toBe(404);
  });
});
