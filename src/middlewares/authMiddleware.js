const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../config/database');
const { UnauthorizedError, ForbiddenError } = require('../errors');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or malformed Authorization header'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        userRoles: {
          select: {
            role: {
              select: {
                permissions: { select: { permission: { select: { code: true } } } },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return next(new UnauthorizedError('User no longer exists'));
    }

    req.user = {
      id: user.id,
      permissions: user.userRoles.flatMap(({ role }) =>
        role.permissions.map(({ permission }) => permission.code)
      ),
    };
    next();
  } catch (err) {
    return next(new UnauthorizedError('Invalid or expired token'));
  }
}

function requirePermission(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }
    const hasAllPermissions = requiredPermissions.every((permission) =>
      req.user.permissions.includes(permission)
    );
    if (!hasAllPermissions) {
      return next(new ForbiddenError('You do not have the required permission'));
    }
    next();
  };
}

function hasPermission(user, permission) {
  return user.permissions.includes(permission);
}

module.exports = { authenticate, requirePermission, hasPermission };
