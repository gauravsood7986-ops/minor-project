import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { User } from '../src/models/User.js';

describe('Auth API Integration Tests', () => {
  const testUser = {
    name: 'Alex Johnson',
    email: 'alex.johnson@campus.edu',
    username: 'alexj',
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
    college: 'State University',
  };

  it('should register a new user successfully and hash password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.user.password).toBeUndefined();

    // Verify user in database has hashed password
    const savedUser = await User.findOne({ email: testUser.email.toLowerCase() }).select('+password');
    expect(savedUser).not.toBeNull();
    expect(savedUser.password).not.toBe(testUser.password);
    expect(savedUser.password.startsWith('$2')).toBe(true);
  });

  it('should reject registration with duplicate email', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const duplicateUser = {
      ...testUser,
      username: 'differentuser',
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(duplicateUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration with mismatched passwords', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        ...testUser,
        confirmPassword: 'MismatchPassword123!',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should authenticate valid login and set session cookie', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.includes('campusgig_session'))).toBe(true);
  });

  it('should reject invalid password without user enumeration', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('should restore session with /api/auth/me when authenticated', async () => {
    const regRes = await request(app).post('/api/auth/register').send(testUser);
    const cookie = regRes.headers['set-cookie'];

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.email).toBe(testUser.email.toLowerCase());
  });

  it('should reject /api/auth/me when unauthenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should clear cookie on logout', async () => {
    const regRes = await request(app).post('/api/auth/register').send(testUser);
    const cookie = regRes.headers['set-cookie'];

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookie);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);
  });
});
