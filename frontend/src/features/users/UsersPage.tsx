import React, { useState } from 'react'
import {
  Users as UsersIcon, Plus, Search,
  Edit2, Trash2, Power, Shield,
  KeyRound, Phone, Mail, Building2,
  Sparkles, CheckCircle2
} from 'lucide-react'
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserActiveMutation,
  User
} from '@/api/usersApi'
import { useGetRolesQuery } from '@/api/rolesApi'
import { useGetBranchesQuery } from '@/api/restaurantApi'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'

export const UsersPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Form State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [pinCode, setPinCode] = useState('')
  const [roleId, setRoleId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [formError, setFormError] = useState('')

  // Queries
  const { data: usersData, isLoading, refetch } = useGetUsersQuery({
    page,
    search: search || undefined,
    role: roleFilter || undefined,
  })
  const { data: rolesData } = useGetRolesQuery()
  const { data: branchesData } = useGetBranchesQuery()

  // Mutations
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation()
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()
  const [deleteUser] = useDeleteUserMutation()
  const [toggleActive] = useToggleUserActiveMutation()

  const roles = Array.isArray(rolesData) ? rolesData : []
  const branches = Array.isArray(branchesData) ? branchesData : (branchesData as any)?.data || []
  const users = usersData?.data || []
  const pagination = usersData?.pagination

  const openCreateModal = () => {
    setEditingUser(null)
    setFullName('')
    setEmail('')
    setPhone('')
    setPassword('')
    setPinCode('')
    setRoleId(roles[0]?.id || '')
    setBranchId(branches[0]?.id || '')
    setIsActive(true)
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (u: User) => {
    setEditingUser(u)
    setFullName(u.full_name)
    setEmail(u.email)
    setPhone(u.phone || '')
    setPassword('')
    setPinCode('')
    setRoleId(u.role?.id || '')
    setBranchId(u.branch || '')
    setIsActive(u.is_active)
    setFormError('')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!fullName || !email || (!editingUser && !password)) {
      setFormError('Please fill in all required fields.')
      return
    }

    try {
      if (editingUser) {
        await updateUser({
          id: editingUser.id,
          data: {
            full_name: fullName,
            email,
            phone,
            role_id: roleId || undefined,
            branch: branchId || undefined,
            is_active: isActive,
            ...(pinCode ? { pin_code: pinCode } : {}),
          },
        }).unwrap()
      } else {
        await createUser({
          full_name: fullName,
          email,
          phone,
          password,
          role_id: roleId,
          branch: branchId || undefined,
          pin_code: pinCode || undefined,
          is_active: isActive,
        }).unwrap()
      }
      setIsModalOpen(false)
      refetch()
    } catch (err: any) {
      setFormError(err?.data?.message || 'Failed to save staff member.')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to deactivate and remove this staff member?')) {
      await deleteUser(id)
      refetch()
    }
  }

  const handleToggleActive = async (id: string) => {
    await toggleActive(id)
    refetch()
  }

  return (
    <div className="space-y-6 animate-entrance">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <UsersIcon className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Staff & User Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage restaurant employees, assign operational roles, and set fast PIN access codes for POS tablets.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4 text-white" />}
          onClick={openCreateModal}
        >
          Add Staff Member
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3.5">
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Search by staff name, email, or phone number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.75rem' }}
              className="w-full pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
          <div className="w-full sm:w-60">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 outline-none focus:border-indigo-600 focus:bg-white cursor-pointer transition-all"
            >
              <option value="">All Operational Roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="data-table-container shadow-xs">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee Details</th>
              <th>System Role</th>
              <th>Branch Location</th>
              <th>Contact Phone</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-xs text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Loading staff directory...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-xs text-slate-500">
                  <UsersIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">No staff members found</p>
                  <p className="text-slate-400 mt-0.5">Click "Add Staff Member" above to create an employee account.</p>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-50 to-indigo-100 border border-indigo-200 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {u.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="block font-extrabold text-xs text-slate-900">
                          {u.full_name}
                        </span>
                        <span className="block text-[11px] text-slate-400 font-mono">
                          {u.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge variant="accent" size="sm">
                      <Shield className="w-3 h-3 mr-1 shrink-0" />
                      {u.role?.name || 'Staff'}
                    </Badge>
                  </td>
                  <td className="text-xs font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {u.branch_name || 'Main Branch'}
                    </span>
                  </td>
                  <td className="text-xs font-mono text-slate-600">
                    {u.phone || '—'}
                  </td>
                  <td>
                    {u.is_active ? (
                      <Badge variant="success" size="sm" dot>Active</Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">Deactivated</Badge>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(u)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="Edit Account"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(u.id)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                          u.is_active
                            ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={u.is_active ? 'Deactivate Access' : 'Activate Access'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 text-xs text-slate-500 bg-slate-50/50">
            <span>
              Page <strong className="text-slate-900">{pagination.page}</strong> of {pagination.total_pages} ({pagination.count} staff records)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                disabled={!pagination.previous}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="xs"
                disabled={!pagination.next}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Edit Staff: ${editingUser.full_name}` : 'Register New Staff Member'}
        description="Configure account credentials, operational role permissions, and tablet PIN."
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
              {editingUser ? 'Save Changes' : 'Create Staff Member'}
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

          <Input
            label="Full Employee Name *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Sarah Jenkins"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@restaurant.com"
              required
              icon={<Mail className="w-4 h-4" />}
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              icon={<Phone className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Operational Role *"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              options={roles.map((r) => ({ label: `${r.name} (${r.permissions?.length || 'Full'} perms)`, value: r.id }))}
            />
            <Select
              label="Branch Location"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              options={branches.map((b: any) => ({ label: b.name, value: b.id }))}
            />
          </div>

          {!editingUser && (
            <Input
              label="Account Password *"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
            />
          )}

          <Input
            label="POS Speed PIN (4-6 Digits)"
            type="password"
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder={editingUser ? 'Leave blank to preserve existing PIN' : 'e.g. 1234'}
            icon={<KeyRound className="w-4 h-4" />}
            helperText="Allows quick PIN unlock on cashier and kitchen touchscreens."
          />

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-800">
                Account Active (Allowed to authenticate and take orders)
              </span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  )
}
