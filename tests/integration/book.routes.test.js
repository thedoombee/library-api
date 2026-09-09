describe('Books routes — authorization', () => {
  it('POST /books returns 403 for a MEMBER', async () => {
    const res = await request(app)
      .post('/books')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ title: 'New Book', isbn: '000-0000000000', publishedYear: 2020, authorIds: [author.id] });

    expect(res.status).toBe(403);
  });

  it('POST /books returns 201 for a LIBRARIAN', async () => {
    const res = await request(app)
      .post('/books')
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({ title: 'New Book', isbn: '000-0000000000', publishedYear: 2020, authorIds: [author.id] });

    expect(res.status).toBe(201);
  });
});