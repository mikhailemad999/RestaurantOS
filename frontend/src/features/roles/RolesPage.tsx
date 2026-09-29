import React, { useState, useEffect } from 'react'
import {
  ShieldCheck, Plus, Lock, Users,
  Edit2, Trash2, Check, Shield,
  Layers, ChevronRight, CheckCircle2,
  Sparkles
} from 'lucide-react'
import {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  Role,
  Permission
} from '@/api/rolesApi'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'

export const RolesPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  // Form State
  const [roleName, setRoleName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [formError, setFormError] = useState('')

  // Queries
  const { data: rolesData, isLoading: isRolesLoading, refetch } = useGetRolesQuery()
  const { data: permsData, isLoading: isPermsLoading } = useGetPermissionsQuery()

  // Mutations
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation()
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation()
  const [deleteRole] = useDeleteRoleMutation()

  const roles: Role[] = Array.isArray(rolesData) ? rolesData : []
  const permissionsList = permsData?.data?.permissions || []
  const groupedPermissions = permsData?.data?.grouped || {}

  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0])
    }
  }, [roles, selectedRole])

  const openCreateModal = () => {
    setEditingRole(null)
    setRoleName('')
    setDescription('')
    setSelectedPermissions([])
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (role: Role) => {
    setEditingRole(role)
    setRoleName(role.name)
    setDescription(role.description || '')
    setSelectedPermissions(role.permissions?.map((p) => p.id) || [])
    setFormError('')
    setIsModalOpen(true)
  }

  const handleTogglePermission = (permId: string) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter((id) => id !== permId))
    } else {
      setSelectedPermissions([...selectedPermissions, permId])
    }
  }

  const handleToggleModule = (modulePerms: Permission[]) => {
    const modulePermIds = modulePerms.map((p) => p.id)
    const allSelected = modulePermIds.every((id) => selectedPermissions.includes(id))

    if (allSelected) {
      setSelectedPermissions(selectedPermissions.filter((id) => !modulePermIds.includes(id)))
    } else {
      const merged = Array.from(new Set([...selectedPermissions, ...modulePermIds]))
      setSelectedPermissions(merged)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!roleName) {
      setFormError('Role name is required')
      return
    }

    try {
      if (editingRole) {
        await updateRole({
          id: editingRole.id,
          data: {
            name: roleName,
            description,
            permission_ids: selectedPermissions,
          },
        }).unwrap()
      } else {
        await createRole({
          name: roleName,
          description,
          permission_ids: selectedPermissions,
        }).unwrap()
      }
      setIsModalOpen(false)
      refetch()
    } catch (err: any) {
      setFormError(err?.data?.message || 'Failed to save role')
    }
  }

  const handleDeleteRole = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this custom role?')) {
      try {
        await deleteRole(id).unwrap()
        setSelectedRole(null)
        refetch()
      } catch (err: any) {
        alert(err?.data?.message || 'Cannot delete role')
      }
    }
  }

  return (
    <div className="space-y-6 animate-entrance">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Roles & Access Policies
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enforce strict role-based access control across all 70 system actions, POS commands, and sensitive financials.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4 text-white" />}
          onClick={openCreateModal}
        >
          Create Custom Role
        </Button>
      </div>

      {/* Two Column Grid: Roles List + Matrix Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Role Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Configured Roles ({roles.length})
            </span>
          </div>

          <div className="space-y-2">
            {roles.map((role) => {
              const isSelected = selectedRole?.id === role.id
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`
                    p-4 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between
                    ${isSelected
                      ? 'bg-indigo-50/60 border-indigo-500 shadow-xs ring-1 ring-indigo-500'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                          {role.name}
                        </span>
                        {role.is_system ? (
                          <Badge variant="neutral" size="xs">System Default</Badge>
                        ) : (
                          <Badge variant="accent" size="xs">Custom</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {role.description || 'Predefined system security policy.'}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-300'}`} />
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {role.user_count || 0} Staff Active
                    </span>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {role.name === 'Owner' ? 'Full Superuser' : `${role.permissions?.length || 0} Actions`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Permission Matrix Viewer (8 cols) */}
        <div className="lg:col-span-8">
          {selectedRole ? (
            <Card
              title={`${selectedRole.name} Access Matrix`}
              subtitle={selectedRole.description || 'Verified permissions breakdown'}
              icon={<Shield className="w-4 h-4" />}
              action={
                !selectedRole.is_system ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="xs"
                      icon={<Edit2 className="w-3.5 h-3.5" />}
                      onClick={() => openEditModal(selectedRole)}
                    >
                      Edit Policy
                    </Button>
                    <Button
                      variant="danger"
                      size="xs"
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => handleDeleteRole(selectedRole.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ) : (
                  <Badge variant="neutral" size="xs">
                    <Lock className="w-3 h-3 mr-1" /> Protected Immutable Role
                  </Badge>
                )
              }
            >
              {selectedRole.name === 'Owner' ? (
                <div className="p-8 text-center bg-gradient-to-b from-indigo-50/70 to-indigo-50/20 rounded-2xl border border-indigo-100">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-500/20">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    Full Root / Business Owner Privileges
                  </h4>
                  <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                    The Owner role bypasses all authorization checkpoints and possesses unrestricted administrative access to restaurant finances, staff accounts, POS transactions, discount authorisations, and database configuration.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([module, rawPerms]) => {
                    const perms = (rawPerms || []) as Permission[]
                    const grantedCount = perms.filter((p: Permission) =>
                      selectedRole.permissions?.some((rp: Permission) => rp.codename === p.codename)
                    ).length

                    return (
                      <div key={module} className="border-b border-slate-100 pb-5 last:border-b-0">
                        <div className="flex items-center justify-between mb-2.5">
                          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-indigo-600" />
                            {module}
                          </h4>
                          <span className="text-[11px] font-mono font-bold text-slate-400">
                            {grantedCount} / {perms.length} enabled
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {perms.map((perm) => {
                            const isGranted = selectedRole.permissions?.some(
                              (rp) => rp.codename === perm.codename
                            )
                            return (
                              <div
                                key={perm.id}
                                className={`
                                  p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors
                                  ${isGranted
                                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 font-bold'
                                    : 'bg-slate-50/70 border-slate-200/60 text-slate-400 opacity-60'
                                  }
                                `}
                              >
                                <span className="truncate pr-2">{perm.name}</span>
                                {isGranted ? (
                                  <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                    <Check className="w-3.5 h-3.5" />
                                  </div>
                                ) : (
                                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                                    Deny
                                  </span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <div className="text-center py-16 text-xs text-slate-400">
                Select a role from the list to view its permission matrix.
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Role Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRole ? `Edit Role: ${editingRole.name}` : 'Create Custom Operational Role'}
        description="Craft a fine-grained role with custom action privileges."
        maxWidth="2xl"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isCreating || isUpdating}
              onClick={handleSubmit}
            >
              {editingRole ? 'Save Custom Role' : 'Create Role'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Role Title *"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Floor Captain"
              required
            />
            <Input
              label="Role Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Floor orders & table transfers"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Permissions Matrix ({selectedPermissions.length} selected)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPermissions(permissionsList.map((p) => p.id))}
                  className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-xs text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => setSelectedPermissions([])}
                  className="text-xs font-bold text-slate-400 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {Object.entries(groupedPermissions).map(([module, rawPerms]) => {
                const perms = (rawPerms || []) as Permission[]
                const modulePermIds = perms.map((p: Permission) => p.id)
                const allSelected = modulePermIds.every((id: string) => selectedPermissions.includes(id))

                return (
                  <div key={module} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                        {module}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleModule(perms)}
                        className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        {allSelected ? 'Deselect Category' : 'Select Category'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {perms.map((perm) => {
                        const isChecked = selectedPermissions.includes(perm.id)
                        return (
                          <label
                            key={perm.id}
                            className={`
                              flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all
                              ${isChecked
                                ? 'bg-white border-indigo-500 text-indigo-900 font-bold shadow-2xs'
                                : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                              }
                            `}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePermission(perm.id)}
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            />
                            <span className="truncate">{perm.name}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
