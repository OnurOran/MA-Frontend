export const PERMISSIONS = {
  MANAGE_USERS: 'ManageUsers',
  MANAGE_DEPARTMENT: 'ManageDepartment',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export function hasPermission(
  userPermissions: string[] | undefined,
  permission: Permission
): boolean {
  if (!userPermissions) return false;
  return userPermissions.includes(permission);
}

export function hasAnyPermission(
  userPermissions: string[] | undefined,
  permissions: Permission[]
): boolean {
  if (!userPermissions) return false;
  return permissions.some((p) => userPermissions.includes(p));
}

export function hasAllPermissions(
  userPermissions: string[] | undefined,
  permissions: Permission[]
): boolean {
  if (!userPermissions) return false;
  return permissions.every((p) => userPermissions.includes(p));
}

export function isSuperAdmin(user: { isSuperAdmin?: boolean; permissions?: string[] }): boolean {
  return user.isSuperAdmin === true || hasPermission(user.permissions, PERMISSIONS.MANAGE_USERS);
}

export function isManager(user: { isSuperAdmin?: boolean; permissions?: string[] }): boolean {
  return !isSuperAdmin(user) && hasPermission(user.permissions, PERMISSIONS.MANAGE_DEPARTMENT);
}
