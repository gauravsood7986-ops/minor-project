import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Orders & Service Purchase API Tests', () => {
  let userACookie;
  let userBCookie;
  let userCCookie;
  let serviceId;

  const seller = {
    name: 'Sarah Seller',
    email: 'sarah.seller@campus.edu',
    username: 'sarahseller',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  const buyer = {
    name: 'Brian Buyer',
    email: 'brian.buyer@campus.edu',
    username: 'brianbuyer',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  const outsider = {
    name: 'Oliver Outsider',
    email: 'oliver@campus.edu',
    username: 'oliverout',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  beforeEach(async () => {
    const resA = await request(app).post('/api/auth/register').send(seller);
    userACookie = resA.headers['set-cookie'];

    const resB = await request(app).post('/api/auth/register').send(buyer);
    userBCookie = resB.headers['set-cookie'];

    const resC = await request(app).post('/api/auth/register').send(outsider);
    userCCookie = resC.headers['set-cookie'];

    // Sarah publishes a Python notes resource
    const sRes = await request(app)
      .post('/api/services')
      .set('Cookie', userACookie)
      .send({
        title: 'Python Complete Lecture Notes and Exam Cheatsheet',
        description: 'Comprehensive 120-page Python lecture notes covering OOP, data structures, algorithms, and sample exam questions.',
        category: 'study_notes',
        price: 30,
        deliveryTime: 1,
        status: 'published',
        portfolioAssets: [
          {
            url: 'https://example.com/python-notes.pdf',
            name: 'python-notes.pdf',
            fileType: 'pdf',
            size: 1048576,
          },
        ],
      });

    serviceId = sRes.body.data.service._id;
  });

  it('should allow an authenticated student (Brian) to purchase Sarah service', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', userBCookie)
      .send({
        serviceId,
        notes: 'Looking forward to reviewing these exam notes!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order.title).toContain('Python Complete Lecture Notes');
    expect(res.body.data.order.price).toBe(30);
    expect(res.body.data.order.status).toBe('completed');
    expect(res.body.data.order.paymentStatus).toBe('paid');
    expect(res.body.data.order.downloadAssets).toHaveLength(1);
    expect(res.body.data.order.downloadAssets[0].name).toBe('python-notes.pdf');
  });

  it('should strictly PREVENT a seller from buying their own service', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', userACookie)
      .send({
        serviceId,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('cannot purchase your own');
  });

  it('should display purchased order in buyer purchases and seller sales', async () => {
    // Brian buys service
    await request(app)
      .post('/api/orders')
      .set('Cookie', userBCookie)
      .send({ serviceId });

    // Check Brian's purchases
    const purchasesRes = await request(app)
      .get('/api/orders/my-purchases')
      .set('Cookie', userBCookie);

    expect(purchasesRes.status).toBe(200);
    expect(purchasesRes.body.data.orders).toHaveLength(1);
    expect(purchasesRes.body.data.orders[0].price).toBe(30);

    // Check Sarah's sales
    const salesRes = await request(app)
      .get('/api/orders/my-sales')
      .set('Cookie', userACookie);

    expect(salesRes.status).toBe(200);
    expect(salesRes.body.data.orders).toHaveLength(1);
    expect(salesRes.body.data.orders[0].buyer.username).toBe('brianbuyer');
  });

  it('should forbid an unrelated third party from viewing another user order details', async () => {
    const buyRes = await request(app)
      .post('/api/orders')
      .set('Cookie', userBCookie)
      .send({ serviceId });

    const orderId = buyRes.body.data.order._id;

    // Oliver (unrelated third party) tries to view the order
    const viewRes = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Cookie', userCCookie);

    expect(viewRes.status).toBe(403);
    expect(viewRes.body.success).toBe(false);
    expect(viewRes.body.message).toContain('Access denied');
  });
});
