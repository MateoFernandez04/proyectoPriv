import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import {
  ProjectPublic,
  SectionYearPublic,
  SectionPublic,
  ProjectPrivacy,
} from '../types/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState, TableSkeleton } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { Plus, MoreVertical, Eye, AlertCircle } from 'lucide-react';

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [projects, setProjects] = useState<ProjectPublic[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [sectionYears, setSectionYears] = useState<SectionYearPublic[]>([]);
  const [sections, setSections] = useState<SectionPublic[]>([]);
  const [filterSY, setFilterSY] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterSection, setFilterSection] = useState<string>('');
  const [filterPrivacy, setFilterPrivacy] = useState<ProjectPrivacy | ''>('');

  // Diálogo Crear Equipos de Trabajo
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createCourseId, setCreateCourseId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [groupNumber, setGroupNumber] = useState<number | ''>('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Menú contextual
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Cargar metadatos para filtros
  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        const [syRes, sRes] = await Promise.all([
          api.getSectionYears({ limit: 100 }),
          api.getSections({ limit: 100 }),
        ]);
        setSectionYears(syRes.items);
        setSections(sRes.items);
      } catch {
        // Ignorar
      }
    };
    loadFiltersData();
  }, []);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getProjects({
        id_section_year: filterSY ? Number(filterSY) : null,
        year: filterYear ? Number(filterYear) : null,
        id_section: filterSection ? Number(filterSection) : null,
        privacy: filterPrivacy ? filterPrivacy : null,
        limit: 10,
        offset,
      });
      setProjects(res.items);
      setTotal(res.total);
    } catch {
      toastError('Error al cargar equipos de trabajo');
    } finally {
      setIsLoading(false);
    }
  }, [filterSY, filterYear, filterSection, filterPrivacy, offset, toastError]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Comprobar si el usuario puede crear equipos de trabajo (super admin o profesor asignado)
  const canCreate = user?.is_super_admin || user?.role === 'professor';

  // Cursos disponibles para crear (si es profesor regular, solo donde esté asignado)
  const availableCoursesForCreate = sectionYears.filter((sy) => {
    if (user?.is_super_admin) return true;
    if (user?.role === 'professor') {
      return (sy.assigned_professors || []).some(
        (p) => p.id_professor === user.id_user
      );
    }
    return false;
  });

  const handleOpenCreate = () => {
    setCreateCourseId(availableCoursesForCreate[0]?.id_section_year || '');
    setQuantity(1);
    setGroupNumber('');
    setModalError(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!createCourseId) {
      setModalError('Seleccione un curso lectivo');
      return;
    }

    if (quantity < 1 || quantity > 50) {
      setModalError('Ingrese un número entre 1 y 50');
      return;
    }

    setIsCreating(true);
    try {
      if (quantity === 1) {
        await api.createProject({
          id_section_year: Number(createCourseId),
          group_number: groupNumber ? Number(groupNumber) : null,
        });
        success('Equipo de trabajo creado');
      } else {
        await api.createProjectsBulk({
          id_section_year: Number(createCourseId),
          quantity,
        });
        success(`${quantity} equipos de trabajo creados`);
      }
      setIsCreateModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      if (err.status === 409 || err.message?.includes('existe')) {
        setModalError('Ya existe ese número de equipo en el curso lectivo');
      } else if (err.status === 422) {
        setModalError('Ingrese un número entre 1 y 50');
      } else {
        setModalError(err.message || 'Error al crear equipo');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const renderPrivacyBadge = (privacy: ProjectPrivacy) => {
    const labels = {
      public: 'Público',
      protected: 'Protegido',
      private: 'Privado',
    };
    return <Badge variant={privacy}>{labels[privacy]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipos de trabajo"
        action={
          canCreate ? (
            <Button variant="primary" onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-1.5" />
              Crear equipos de trabajo
            </Button>
          ) : null
        }
      />

      {/* Barra de herramientas: Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Select
            value={filterSY}
            onChange={(e) => {
              setFilterSY(e.target.value);
              setOffset(0);
            }}
          >
            <option value="">Todos los cursos lectivos</option>
            {sectionYears.map((sy) => (
              <option key={sy.id_section_year} value={sy.id_section_year}>
                {sy.section_name} - {sy.year}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Select
            value={filterYear}
            onChange={(e) => {
              setFilterYear(e.target.value);
              setOffset(0);
            }}
          >
            <option value="">Todos los años</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </Select>
        </div>

        <div>
          <Select
            value={filterSection}
            onChange={(e) => {
              setFilterSection(e.target.value);
              setOffset(0);
            }}
          >
            <option value="">Todas las comisiones</option>
            {sections.map((s) => (
              <option key={s.id_section} value={s.id_section}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Select
            value={filterPrivacy}
            onChange={(e) => {
              setFilterPrivacy(e.target.value as any);
              setOffset(0);
            }}
          >
            <option value="">Todas las privacidades</option>
            <option value="public">Público</option>
            <option value="protected">Protegido</option>
            <option value="private">Privado</option>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} cols={6} />
      ) : projects.length === 0 ? (
        <EmptyState message="No se encontraron equipos de trabajo para los criterios seleccionados." />
      ) : (
        <>
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Equipo</TableHead>
                <TableHead>Comisión</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Nombre del proyecto</TableHead>
                <TableHead>Privacidad</TableHead>
                <TableHead className="w-20 text-right">Acciones</TableHead>
              </tr>
            </TableHeader>
            <tbody>
              {projects.map((proj) => (
                <TableRow
                  key={proj.id_project}
                  onClick={() => navigate(`/equipos/${proj.id_project}`)}
                >
                  <TableCell className="font-semibold text-[#0B2A66]">
                    Equipo {proj.group_number}
                  </TableCell>
                  <TableCell className="font-medium text-[#0F1F3D]">
                    {proj.section_name}
                  </TableCell>
                  <TableCell className="font-mono text-[#51607A]">
                    {proj.year}
                  </TableCell>
                  <TableCell>
                    {proj.name ? (
                      <span className="font-medium text-[#0F1F3D]">
                        {proj.name}
                      </span>
                    ) : (
                      <span className="text-[#94A3B8] italic">
                        Sin nombre
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{renderPrivacyBadge(proj.privacy)}</TableCell>
                  <TableCell
                    className="text-right relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === proj.id_project ? null : proj.id_project
                        )
                      }
                      className="p-1 rounded text-[#51607A] hover:text-[#0F1F3D] hover:bg-[#EFF6FF] cursor-pointer"
                      aria-label="Opciones del equipo"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuId === proj.id_project && (
                      <div className="absolute right-4 top-10 w-36 bg-white border border-[#D6E4F7] rounded-lg shadow-lg py-1 z-20 text-left">
                        <button
                          type="button"
                          onClick={() => navigate(`/equipos/${proj.id_project}`)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#0F1F3D] hover:bg-[#EFF6FF] cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#1D4ED8]" />
                          <span>Ver detalle</span>
                        </button>
                      </div>
                    )}
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

      {/* Diálogo Crear Equipos de Trabajo */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear equipos de trabajo"
      >
        {modalError && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-lg bg-[#FEE2E2] border border-[#FCA5A5] text-[#B91C1C] text-sm flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{modalError}</span>
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <Select
              label="Curso lectivo"
              requiredAsterisk
              value={createCourseId}
              onChange={(e) => setCreateCourseId(Number(e.target.value))}
              disabled={isCreating}
              required
            >
              <option value="" disabled>Seleccione un curso lectivo</option>
              {availableCoursesForCreate.map((sy) => (
                <option key={sy.id_section_year} value={sy.id_section_year}>
                  {sy.section_name} ({sy.year})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Input
              label="Cantidad de equipos"
              requiredAsterisk
              type="number"
              min={1}
              max={50}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              disabled={isCreating}
              helperText="De 1 a 50 equipos consecutivos"
              required
            />
          </div>

          {quantity === 1 && (
            <div>
              <Input
                label="Número de equipo"
                type="number"
                min={1}
                placeholder="Automático (siguiente disponible)"
                value={groupNumber}
                onChange={(e) => setGroupNumber(e.target.value ? Number(e.target.value) : '')}
                disabled={isCreating}
                helperText="Si no lo indica, se asigna el siguiente libre"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-[#D6E4F7]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isCreating}
            >
              Crear
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
