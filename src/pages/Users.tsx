import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { UserListItem } from '../types/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  InitialsAvatar,
} from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState, TableSkeleton } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { Search } from 'lucide-react';

export const Users: React.FC = () => {
  const { error: toastError } = useToast();

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'student' | 'professor' | ''>('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getUsers({
        role: roleFilter ? roleFilter : null,
        q: searchQuery || null,
        limit: 10,
        offset,
      });
      setUsers(res.items);
      setTotal(res.total);
    } catch {
      toastError('Error al consultar usuarios');
    } finally {
      setIsLoading(false);
    }
  }, [roleFilter, searchQuery, offset, toastError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        subtitle="Padrón general de cuentas del sistema"
      />

      {/* Barra de herramientas: Buscador y Filtro Rol */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
        <div className="sm:col-span-2">
          <Input
            type="text"
            placeholder="Buscar por nombre, legajo o correo"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setOffset(0);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div>
          <Select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as any);
              setOffset(0);
            }}
          >
            <option value="">Todos los roles</option>
            <option value="student">Alumno</option>
            <option value="professor">Profesor</option>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : users.length === 0 ? (
        <EmptyState message="No se encontraron usuarios para los filtros seleccionados." />
      ) : (
        <>
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Apellido y nombre</TableHead>
                <TableHead>Correo electrónico</TableHead>
                <TableHead>Legajo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Año de ingreso</TableHead>
              </tr>
            </TableHeader>
            <tbody>
              {users.map((u) => (
                <TableRow key={u.id_user}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <InitialsAvatar
                        name={`${u.last_name} ${u.first_name}`}
                        size="sm"
                      />
                      <span className="font-medium text-[#0F1F3D]">
                        {u.last_name}, {u.first_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#51607A]">{u.email}</TableCell>
                  <TableCell className="font-mono text-[#51607A]">
                    {u.legajo}
                  </TableCell>
                  <TableCell>
                    {u.is_super_admin ? (
                      <Badge variant="superadmin">Super administrador</Badge>
                    ) : u.role === 'professor' ? (
                      <Badge variant="professor">Profesor</Badge>
                    ) : (
                      <Badge variant="student">Alumno</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-[#51607A]">
                    {u.role === 'student' ? u.enrollment_year || '—' : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>

          <Pagination
            total={total}
            limit={10}
            offset={offset}
            onChangeOffset={setOffset}
          />
        </>
      )}
    </div>
  );
};
