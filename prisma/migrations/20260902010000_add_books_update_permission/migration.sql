-- Add the permission required by PATCH /books/:id.
INSERT INTO "permissions" ("id", "code", "description") VALUES
  ('permission-books-update', 'books:update', 'Update books')
ON CONFLICT ("code") DO NOTHING;

-- The initial librarian role can update books.
INSERT INTO "role_permissions" ("roleId", "permissionId")
SELECT r."id", p."id"
FROM "roles" r
JOIN "permissions" p ON p."code" = 'books:update'
WHERE r."name" = 'LIBRARIAN'
ON CONFLICT ("roleId", "permissionId") DO NOTHING;
