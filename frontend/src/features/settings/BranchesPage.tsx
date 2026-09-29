import React, { useState } from 'react'
import {
  GitBranch, Plus, MapPin, Phone,
  Mail, Edit2, Trash2, CheckCircle2,
  Building2
} from 'lucide-react'
import {
  useGetBranchesQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  Branch
} from '@/api/restaurantApi'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'

export const BranchesPage: React.FC = () => {
  const { data: branchesData, isLoading, refetch } = useGetBranchesQuery()
  const [createBranch, { isLoading: isCreating }] = useCreateBranchMutation()
  const [updateBranch, { isLoading: isUpdating }] = useUpdateBranchMutation()
  const [deleteBranch] = useDeleteBranchMutation()

  const branches = Array.isArray(branchesData) ? branchesData : (branchesData as any)?.data || []

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [formError, setFormError] = useState('')

  const openCreateModal = () => {
    setEditingBranch(null)
    setName('')
    setAddress('')
    setPhone('')
    setEmail('')
    setIsActive(true)
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (b: Branch) => {
    setEditingBranch(b)
    setName(b.name)
    setAddress(b.address || '')
    setPhone(b.phone || '')
    setEmail(b.email || '')
    setIsActive(b.is_active)
    setFormError('')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!name) {
      setFormError('Branch name is required')
      return
    }

    try {
      if (editingBranch) {
        await updateBranch({
          id: editingBranch.id,
          data: { name, address, phone, email, is_active: isActive },
        }).unwrap()
      } else {
        await createBranch({
          name,
          address,
          phone,
          email,
          is_active: isActive,
        }).unwrap()
      }
      setIsModalOpen(false)
      refetch()
    } catch (err: any) {
      setFormError(err?.data?.message || 'Failed to save branch')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      await deleteBranch(id)
      refetch()
    }
  }

  return (
    <div className="space-y-6 animate-entrance max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <GitBranch className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Branch & Location Network
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage multi-store dining locations, phone routing, and branch operational statuses.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4 text-white" />}
          onClick={openCreateModal}
        >
          Add New Branch
        </Button>
      </div>

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 text-center py-12 text-xs text-slate-400">
            Loading branches...
          </div>
        ) : branches.length === 0 ? (
          <div className="col-span-2 text-center py-16 text-xs text-slate-500 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700">No branch locations created yet</p>
          </div>
        ) : (
          branches.map((b: Branch) => (
            <Card
              key={b.id}
              className="flex flex-col justify-between"
              action={
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(b)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              }
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {b.name}
                  </h3>
                  {b.is_active ? (
                    <Badge variant="success" size="xs" dot>Active</Badge>
                  ) : (
                    <Badge variant="neutral" size="xs">Inactive</Badge>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  {b.address && (
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{b.address}</span>
                    </p>
                  )}
                  {b.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{b.phone}</span>
                    </p>
                  )}
                  {b.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{b.email}</span>
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create / Edit Branch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBranch ? `Edit Branch: ${editingBranch.name}` : 'Register New Location'}
        description="Configure branch location, contact line, and operating state."
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
              {editingBranch ? 'Save Changes' : 'Create Branch'}
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
            label="Branch Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Downtown Flagship"
            required
          />

          <Input
            label="Physical Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="456 Market St, Suite 10"
            icon={<MapPin className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-1111"
              icon={<Phone className="w-4 h-4" />}
            />
            <Input
              label="Contact Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="downtown@restaurant.com"
              icon={<Mail className="w-4 h-4" />}
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-800">
                Branch Active (Accepting POS & Delivery Orders)
              </span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  )
}
