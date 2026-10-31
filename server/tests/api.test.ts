import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import { memoryStore } from '../src/db';

describe('LEETQUEST Express API', () => {
  const testUserId = 'test-user-123';

  beforeEach(() => {
    // Reset in-memory store
    memoryStore.profiles.clear();
    memoryStore.problems = [];
    memoryStore.missions = [];
    memoryStore.xpEvents.clear();
  });

  it('GET /healthz returns ok status and timestamp', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  it('POST /api/problems validates input and rejects duplicate titles', async () => {
    // 1. Valid problem
    const validProblem = {
      title: 'Two Sum',
      difficulty: 'Easy',
      topic: 'Arrays',
      url: 'https://leetcode.com/problems/two-sum/',
      solvedDate: '2026-05-01',
      notes: 'Hash map approach',
    };

    const res1 = await request(app)
      .post('/api/problems')
      .set('x-test-user-id', testUserId)
      .send(validProblem);

    expect(res1.status).toBe(201);
    expect(res1.body.title).toBe('Two Sum');
    expect(res1.body.id).toBeDefined();

    // 2. Duplicate title (case-insensitive)
    const duplicateProblem = {
      ...validProblem,
      title: 'two sum',
    };

    const res2 = await request(app)
      .post('/api/problems')
      .set('x-test-user-id', testUserId)
      .send(duplicateProblem);

    expect(res2.status).toBe(409);
    expect(res2.body.error).toContain('already exists');

    // 3. Invalid payload (bad topic)
    const invalidProblem = {
      ...validProblem,
      title: 'Valid Title',
      topic: 'NonExistentTopic',
    };

    const res3 = await request(app)
      .post('/api/problems')
      .set('x-test-user-id', testUserId)
      .send(invalidProblem);

    expect(res3.status).toBe(400);
    expect(res3.body.error).toBe('Validation failed');
  });

  it('GET /api/stats computes statistics accurately', async () => {
    // Add 1 Easy Array and 1 Hard DP
    await request(app)
      .post('/api/problems')
      .set('x-test-user-id', testUserId)
      .send({
        title: 'Two Sum',
        difficulty: 'Easy',
        topic: 'Arrays',
        solvedDate: '2026-05-01',
      });

    await request(app)
      .post('/api/problems')
      .set('x-test-user-id', testUserId)
      .send({
        title: 'Edit Distance',
        difficulty: 'Hard',
        topic: 'DP',
        solvedDate: '2026-05-01',
      });

    const res = await request(app)
      .get('/api/stats')
      .set('x-test-user-id', testUserId);

    expect(res.status).toBe(200);
    expect(res.body.totalSolved).toBe(2);
    expect(res.body.easyCount).toBe(1);
    expect(res.body.hardCount).toBe(1);
    // Hard has weight 3, Easy has weight 1 -> DP should be strongest topic
    expect(res.body.strongestTopic).toBe('DP');
  });

  it('Mission workflow: generate, solve after creation, complete, verify exactly once reward', async () => {
    // 1. Generate mission
    const genRes = await request(app)
      .post('/api/missions/generate')
      .set('x-test-user-id', testUserId);

    expect(genRes.status).toBe(201);
    const mission = genRes.body;
    expect(mission.id).toBeDefined();
    expect(mission.status).toBe('active');

    // 2. Attempt complete before solving requirements -> must fail
    const prematureRes = await request(app)
      .post(`/api/missions/${mission.id}/complete`)
      .set('x-test-user-id', testUserId);

    expect(prematureRes.status).toBe(400);
    expect(prematureRes.body.error).toContain('requirements not met');

    // 3. Solve matching problems (server created_at strictly after mission)
    for (let i = 0; i < mission.targetCount; i++) {
      const probRes = await request(app)
        .post('/api/problems')
        .set('x-test-user-id', testUserId)
        .send({
          title: `Mission Solver Problem ${i}`,
          difficulty: 'Medium',
          topic: mission.topic,
          solvedDate: '2026-05-01',
        });
      expect(probRes.status).toBe(201);
    }

    // 4. Complete mission -> succeeds and awards XP
    const completeRes = await request(app)
      .post(`/api/missions/${mission.id}/complete`)
      .set('x-test-user-id', testUserId);

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.success).toBe(true);
    expect(completeRes.body.xpAwarded).toBe(mission.xpReward);
    expect(completeRes.body.profile.xp).toBe(mission.xpReward);

    // 5. Duplicate call -> awards nothing!
    const dupRes = await request(app)
      .post(`/api/missions/${mission.id}/complete`)
      .set('x-test-user-id', testUserId);

    expect(dupRes.status).toBe(400);
    expect(dupRes.body.xpAwarded).toBe(0);
  });
});
