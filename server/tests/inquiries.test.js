import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Inquiries API & Access Control Tests', () => {
  let userACookie;
  let userBCookie;
  let userCCookie;
  let serviceId;

  const userA = {
    name: 'Alice Tutor',
    email: 'alice.tutor@campus.edu',
    username: 'alicetutor',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  const userB = {
    name: 'Bob Student',
    email: 'bob.student@campus.edu',
    username: 'bobstudent',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  const userC = {
    name: 'Charlie Snooper',
    email: 'charlie@campus.edu',
    username: 'charliesnoop',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  beforeEach(async () => {
    const resA = await request(app).post('/api/auth/register').send(userA);
    userACookie = resA.headers['set-cookie'];

    const resB = await request(app).post('/api/auth/register').send(userB);
    userBCookie = resB.headers['set-cookie'];

    const resC = await request(app).post('/api/auth/register').send(userC);
    userCCookie = resC.headers['set-cookie'];

    // Alice publishes a tutoring service
    const sRes = await request(app)
      .post('/api/services')
      .set('Cookie', userACookie)
      .send({
        title: 'Calculus and Linear Algebra Tutoring',
        description: 'Experienced math major offering step-by-step calculus homework and exam prep tutoring.',
        category: 'tutoring',
        price: 25,
        deliveryTime: 1,
        status: 'published',
      });

    serviceId = sRes.body.data.service._id;
  });

  it('should prevent owner from inquiring on their own service', async () => {
    const res = await request(app)
      .post('/api/inquiries')
      .set('Cookie', userACookie)
      .send({
        serviceId,
        message: 'Hello, I want to talk to myself about calculus.',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should allow a client (Bob) to send an inquiry to the freelancer (Alice)', async () => {
    const res = await request(app)
      .post('/api/inquiries')
      .set('Cookie', userBCookie)
      .send({
        serviceId,
        message: 'Hi Alice, are you available this Friday afternoon for a 1-hour session on limits?',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.inquiry.message).toContain('Friday afternoon');
  });

  it('should show received inquiry in Alice workspace and sent inquiry in Bob workspace', async () => {
    await request(app)
      .post('/api/inquiries')
      .set('Cookie', userBCookie)
      .send({
        serviceId,
        message: 'Hi Alice, let us prepare for the midterms!',
      });

    // Alice checks received
    const aliceRes = await request(app)
      .get('/api/inquiries/received')
      .set('Cookie', userACookie);

    expect(aliceRes.status).toBe(200);
    expect(aliceRes.body.data.inquiries.length).toBe(1);
    expect(aliceRes.body.data.inquiries[0].sender.username).toBe(userB.username);

    // Bob checks sent
    const bobRes = await request(app)
      .get('/api/inquiries/sent')
      .set('Cookie', userBCookie);

    expect(bobRes.status).toBe(200);
    expect(bobRes.body.data.inquiries.length).toBe(1);
    expect(bobRes.body.data.inquiries[0].recipient.username).toBe(userA.username);
  });

  it('should strictly FORBID an unrelated third-party (Charlie) from viewing the inquiry', async () => {
    const inqRes = await request(app)
      .post('/api/inquiries')
      .set('Cookie', userBCookie)
      .send({
        serviceId,
        message: 'Confidential project details for Alice.',
      });

    const inquiryId = inqRes.body.data.inquiry._id;

    // Charlie tries to view Bob & Alice private inquiry
    const unauthorizedView = await request(app)
      .get(`/api/inquiries/${inquiryId}`)
      .set('Cookie', userCCookie);

    expect(unauthorizedView.status).toBe(403);
    expect(unauthorizedView.body.success).toBe(false);
  });
});
