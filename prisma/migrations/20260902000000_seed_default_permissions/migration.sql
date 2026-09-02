-- Configure the initial authorization policy without deleting application data.
INSERT INTO "permissions" ("id", "code", "description") VALUES
  ('permission-authors-create', 'authors:create', 'Create authors'),
  ('permission-authors-update', 'authors:update', 'Update authors'),
  ('permission-authors-delete', 'authors:delete', 'Delete authors'),
  ('permission-books-create', 'books:create', 'Create books'),
  ('permission-books-delete', 'books:delete', 'Delete books'),
  ('permission-loans-create', 'loans:create', 'Create a loan'),
  ('permission-loans-read-own', 'loans:read:own', 'Read own loans'),
  ('permission-loans-return-own', 'loans:return:own', 'Return own loans'),
  ('permission-loans-read-any', 'loans:read:any', 'Read every loan'),
  ('permission-loans-return-any', 'loans:return:any', 'Return any loan')
ON CONFLICT ("code") DO NOTHING;

-- Every member can manage only their own loans.
INSERT INTO "role_permissions" ("roleId", "permissionId")
SELECT r."id", p."id"
FROM "roles" r
JOIN "permissions" p ON p."code" IN (
  'loans:create',
  'loans:read:own',
  'loans:return:own'
)
WHERE r."name" = 'MEMBER'
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- Librarians have the complete initial policy.
INSERT INTO "role_permissions" ("roleId", "permissionId")
SELECT r."id", p."id"
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r."name" = 'LIBRARIAN'
  AND p."code" IN (
    'authors:create',
    'authors:update',
    'authors:delete',
    'books:create',
    'books:delete',
    'loans:create',
    'loans:read:own',
    'loans:return:own',
    'loans:read:any',
    'loans:return:any'
  )
ON CONFLICT ("roleId", "permissionId") DO NOTHING;
