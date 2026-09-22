const request = require('supertest');
const app = require('../../src/app');
const { resetTestDatabase, seedTestData } = require('../helpers/db');

describe('Loans routes', () => {
  let member, librarian, book, memberToken, otherMemberToken, librarianToken;

  beforeEach(async () => {
    await resetTestDatabase();
    ({ member, librarian, book, memberToken, otherMemberToken, librarianToken } = await seedTestData());
  });

  it('POST /loans returns 201 and decrements availableCopies', async () => {
    const res = await request(app)
      .post('/loans')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ bookId: book.id });

    expect(res.status).toBe(201);

    const updatedBookRes = await request(app).get(`/books/${book.id}`);
    expect(updatedBookRes.body.availableCopies).toBe(0);
  });

  it('POST /loans returns 409 when no copies are available', async () => {
    await request(app).post('/loans').set('Authorization', `Bearer ${memberToken}`).send({ bookId: book.id });
    const secondAttempt = await request(app)
      .post('/loans')
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({ bookId: book.id });

    expect(secondAttempt.status).toBe(409);
  });

  it('POST /loans returns 401 without a token', async () => {
    const res = await request(app).post('/loans').send({ bookId: book.id });
    expect(res.status).toBe(401);
  });

  it('PATCH /loans/:id/return allows a librarian to return a loan they do not own', async () => {
    const createRes = await request(app)
      .post('/loans')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ bookId: book.id });

    const returnRes = await request(app)
      .patch(`/loans/${createRes.body.id}/return`)
      .set('Authorization', `Bearer ${librarianToken}`);

    expect(returnRes.status).toBe(200);
  });

  it('PATCH /loans/:id/return returns 403 when another member returns someone else\'s loan', async () => {
    const createRes = await request(app)
      .post('/loans')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ bookId: book.id });

    const returnRes = await request(app)
      .patch(`/loans/${createRes.body.id}/return`)
      .set('Authorization', `Bearer ${otherMemberToken}`);

    expect(returnRes.status).toBe(403);
  });
});
