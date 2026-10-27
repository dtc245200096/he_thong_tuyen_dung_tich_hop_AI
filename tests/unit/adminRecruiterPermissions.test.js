import test from 'node:test';
import assert from 'node:assert/strict';
import { requireRoles } from '../../src/middleware/auth.js';

test('UNIT TEST: Phân quyền RBAC - ADMIN sở hữu toàn bộ quyền của RECRUITER', async (t) => {
  await t.test('1. requireRoles("RECRUITER") cho phép người dùng có vai trò ADMIN truy cập', () => {
    const middleware = requireRoles('RECRUITER');
    const req = { user: { id: 'admin-id', vai_tro: 'ADMIN' } };
    let nextCalled = false;
    const res = {
      status: () => res,
      json: () => res
    };
    const next = () => { nextCalled = true; };

    middleware(req, res, next);
    assert.equal(nextCalled, true, 'Admin phải được phép truy cập vào chức năng của Recruiter.');
  });

  await t.test('2. requireRoles("RECRUITER") cho phép RECRUITER truy cập bình thường', () => {
    const middleware = requireRoles('RECRUITER');
    const req = { user: { id: 'recruiter-id', vai_tro: 'RECRUITER' } };
    let nextCalled = false;
    const res = {
      status: () => res,
      json: () => res
    };
    const next = () => { nextCalled = true; };

    middleware(req, res, next);
    assert.equal(nextCalled, true, 'Recruiter phải được phép truy cập vào chức năng của Recruiter.');
  });

  await t.test('3. requireRoles("RECRUITER") chặn CANDIDATE (403 Forbidden)', () => {
    const middleware = requireRoles('RECRUITER');
    const req = { user: { id: 'cand-id', vai_tro: 'CANDIDATE' } };
    let nextCalled = false;
    let statusCode = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => data
    };
    const next = () => { nextCalled = true; };

    middleware(req, res, next);
    assert.equal(nextCalled, false, 'Candidate không được phép truy cập vào chức năng của Recruiter.');
    assert.equal(statusCode, 403, 'Mã phản hồi phải là 403 Forbidden.');
  });

  await t.test('4. requireRoles("ADMIN") cho phép ADMIN truy cập', () => {
    const middleware = requireRoles('ADMIN');
    const req = { user: { id: 'admin-id', vai_tro: 'ADMIN' } };
    let nextCalled = false;
    const res = {
      status: () => res,
      json: () => res
    };
    const next = () => { nextCalled = true; };

    middleware(req, res, next);
    assert.equal(nextCalled, true, 'Admin được phép truy cập chức năng Admin.');
  });

  await t.test('5. requireRoles("ADMIN") từ chối RECRUITER và CANDIDATE (403 Forbidden)', () => {
    const middleware = requireRoles('ADMIN');
    let recruiterBlocked = false;
    let candidateBlocked = false;

    middleware(
      { user: { id: 'rec-id', vai_tro: 'RECRUITER' } },
      { status: (code) => { if (code === 403) recruiterBlocked = true; return { json: () => {} }; } },
      () => {}
    );

    middleware(
      { user: { id: 'can-id', vai_tro: 'CANDIDATE' } },
      { status: (code) => { if (code === 403) candidateBlocked = true; return { json: () => {} }; } },
      () => {}
    );

    assert.equal(recruiterBlocked, true, 'Recruiter không có quyền Admin.');
    assert.equal(candidateBlocked, true, 'Candidate không có quyền Admin.');
  });
});
