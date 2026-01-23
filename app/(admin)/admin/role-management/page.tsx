'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { useDepartments } from '@/src/features/management/hooks/useDepartments';
import { useDepartmentUsers } from '@/src/features/management/hooks/useDepartmentUsers';
import { useRoles } from '@/src/features/management/hooks/useRoles';
import { useAssignRole } from '@/src/features/management/hooks/useAssignRole';
import { useRemoveRole } from '@/src/features/management/hooks/useRemoveRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { DataTable } from '@/src/components/ui/data-table';
import { UserDto } from '@/src/types';

export default function RoleManagementPage() {
  const { user } = useAuth();

  const { data: departments, isLoading: loadingDepartments } = useDepartments(user?.isSuperAdmin ?? false);
  const { data: roles, isLoading: loadingRoles } = useRoles();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();

  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(
    user?.isSuperAdmin ? null : (user?.departmentId || null)
  );

  const { data: users, isLoading: loadingUsers } = useDepartmentUsers(
    selectedDepartment || undefined
  );

  useEffect(() => {
    if (user?.isSuperAdmin && !selectedDepartment && departments && departments.length > 0) {
      setSelectedDepartment(departments[0].id);
    }
  }, [departments, selectedDepartment, user?.isSuperAdmin]);

  const handleAssignRole = useCallback(
    async (userId: number, roleId: number) => {
      await assignRole.mutateAsync({ userId, roleId });
    },
    [assignRole]
  );

  const handleRemoveRole = useCallback(
    async (userId: number, roleId: number) => {
      await removeRole.mutateAsync({ userId, roleId });
    },
    [removeRole]
  );

  const isInitialLoading = user?.isSuperAdmin
    ? (loadingDepartments || loadingRoles)
    : loadingRoles;

  const tableUsers = useMemo(
    () => (users ?? []).filter((u) => u.id.toString() !== user?.userId),
    [users, user?.userId]
  );

  const availableRoleOptions = useMemo(
    () =>
      (roles ?? [])
        .filter((role) => role.name.toLowerCase() !== 'admin')
        .map((role) => ({ label: role.name, value: role.id })),
    [roles]
  );

  const columns: ColumnDef<UserDto>[] = useMemo(
    () => [
      {
        accessorKey: 'username',
        header: 'Kullanıcı Adı',
        filterFn: 'includesString',
        cell: ({ row }) => (
          <div className="font-medium text-slate-900">{row.original.username}</div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'E-posta',
        cell: ({ row }) => <span className="text-slate-700">{row.original.email}</span>,
      },
      {
        id: 'roles',
        header: 'Roller',
        accessorFn: (row) => row.roles,
        filterFn: (row, _id, value) => {
          if (!value) return true;
          return (row.original.roles ?? []).includes(value as string);
        },
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {row.original.roles && row.original.roles.length > 0 ? (
              row.original.roles.map((roleName) => {
                const roleObj = roles?.find((r) => r.name === roleName);
                const isAdminRole = roleName.toLowerCase() === 'admin';
                return (
                  <span
                    key={`${row.original.id}-${roleName}`}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold"
                  >
                    {roleName}
                    {roleObj && !isAdminRole && (
                      <button
                        onClick={() => handleRemoveRole(row.original.id, roleObj.id)}
                        disabled={removeRole.isPending}
                        className="hover:text-red-600"
                        title="Rolü kaldır"
                        type="button"
                      >
                        ✕
                      </button>
                    )}
                    {isAdminRole && <span className="text-[10px] text-blue-500">🔒</span>}
                  </span>
                );
              })
            ) : (
              <span className="text-sm text-slate-400 italic">Rol yok</span>
            )}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'İşlemler',
        cell: ({ row }) => (
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleAssignRole(row.original.id, parseInt(e.target.value));
                e.target.value = '';
              }
            }}
            disabled={assignRole.isPending}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            defaultValue=""
          >
            <option value="">+ Rol Ekle</option>
            {availableRoleOptions
              .filter((role) => !row.original.roles?.includes(role.label))
              .map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
          </select>
        ),
      },
    ],
    [assignRole.isPending, availableRoleOptions, handleAssignRole, handleRemoveRole, removeRole.isPending, roles]
  );

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-sm text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Rol Yönetimi</h1>
          <p className="text-slate-600 mt-1">
            Kullanıcılara rol atayın ve yetkilendirin
          </p>
        </div>

        {}
        {user?.isSuperAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Departman Seçimi</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                id="departmentSelect"
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={selectedDepartment ?? ''}
                onChange={(e) => setSelectedDepartment(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">Departman seçin</option>
                {departments?.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        )}

        {}
        {selectedDepartment && (
          <Card>
            <CardHeader>
              <CardTitle>
                {user?.isSuperAdmin
                  ? `Kullanıcılar - ${departments?.find((d) => d.id === selectedDepartment)?.name || 'Departman'}`
                  : 'Departman Kullanıcıları'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="text-center py-8">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                  <p className="mt-2 text-sm text-slate-600">Kullanıcılar yükleniyor...</p>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={tableUsers}
                  searchKey="username"
                  filterableColumns={[
                    {
                      id: 'roles',
                      title: 'Rol',
                      options: availableRoleOptions.map((opt) => ({ label: opt.label, value: opt.label })),
                    },
                  ]}
                  emptyMessage="Bu departmanda kullanıcı bulunamadı"
                  enableColumnVisibility={false}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
  );
}
