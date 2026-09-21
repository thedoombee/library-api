function hasPermission(user, permission) {
  return user?.permissions?.includes(permission) ?? false;
}

module.exports = { hasPermission };