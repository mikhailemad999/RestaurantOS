import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  ShieldCheck, Plus, KeyRound, UserCheck, Mail, Phone, 
  DollarSign, Check, X, Shield, Lock, Trash2
} from 'lucide-react';

export default function StaffPage() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'WAITER',
    pin_code: '1234',
    email: '',
    phone: '',
    hourly_rate: 18.00,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await api.getStaff();
      setStaffList(data);
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await api.createStaff(newStaff);
      setIsCreateModalOpen(false);
      setNewStaff({ name: '', role: 'WAITER', pin_code: '1234', email: '', phone: '', hourly_rate: 18.00, avatar_url: '' });
      loadStaff();
    } catch (err) {
      alert(`Error adding staff member: ${err.message}`);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-[#554300]/40 border-[#d4af37] text-[#d4af37]';
      case 'MANAGER': return 'bg-purple-900/40 border-purple-400 text-purple-300';
      case 'CASHIER': return 'bg-blue-900/40 border-blue-400 text-blue-300';
      case 'WAITER': return 'bg-[#005236]/40 border-[#4edea3] text-[#4edea3]';
      case 'CHEF': return 'bg-amber-900/40 border-amber-500 text-amber-300';
      case 'DRIVER': return 'bg-cyan-900/40 border-cyan-400 text-cyan-300';
      default: return 'bg-[#20201f] text-white';
    }
  };

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Header */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
            Staff Roster & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-[#99907c] font-mono">Terminal 4-digit PINs, access permissions & hourly payroll</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-bold text-xs rounded-lg flex items-center gap-2 shadow-gold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Roster Table */}
      <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#20201f] text-[#99907c] uppercase text-[10px] tracking-wider border-b border-[#2a2a2a]">
              <tr>
                <th className="p-3.5">Employee Name</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Terminal PIN</th>
                <th className="p-3.5">Contact Email</th>
                <th className="p-3.5">Phone</th>
                <th className="p-3.5">Hourly Rate</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-[#99907c] font-sans">
                    Loading staff directory from MySQL...
                  </td>
                </tr>
              ) : (
                staffList.map(staff => (
                  <tr key={staff.id} className="hover:bg-[#20201f] transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img 
                        src={staff.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                        alt={staff.name} 
                        className="w-8 h-8 rounded-full object-cover border border-[#353535]"
                      />
                      <span className="font-bold text-white font-sans">{staff.name}</span>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadge(staff.role)}`}>
                        {staff.role}
                      </span>
                    </td>

                    <td className="p-3.5 text-[#d4af37] font-bold">
                      •••• ({staff.pin_code})
                    </td>

                    <td className="p-3.5 text-[#d0c5af]">{staff.email || 'N/A'}</td>
                    <td className="p-3.5 text-[#99907c]">{staff.phone || 'N/A'}</td>
                    <td className="p-3.5 font-bold text-white">${parseFloat(staff.hourly_rate).toFixed(2)}/hr</td>

                    <td className="p-3.5 text-center">
                      <span className="bg-[#005236]/40 text-[#4edea3] border border-[#4edea3]/30 px-2 py-0.5 rounded text-[10px] font-bold">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Granular RBAC Permissions Matrix */}
      <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#d4af37]" />
            Role Permission Matrix (Enforced System-Wide)
          </h3>
          <span className="text-[10px] font-mono text-[#4edea3]">● Active Security Policy</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 bg-[#131313] border border-[#2a2a2a] rounded-xl space-y-2">
            <span className="font-bold text-[#d4af37] block">Admin & General Manager</span>
            <ul className="space-y-1 text-[#d0c5af] text-[11px]">
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#4edea3]" /> Full POS Order & Payment Control</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#4edea3]" /> Financial Reports & BI Access</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#4edea3]" /> Menu Pricing & Margin Editor</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#4edea3]" /> Staff PIN & Role Reassignment</li>
            </ul>
          </div>

          <div className="p-3.5 bg-[#131313] border border-[#2a2a2a] rounded-xl space-y-2">
            <span className="font-bold text-[#4edea3] block">Cashier & Floor Waiter</span>
            <ul className="space-y-1 text-[#d0c5af] text-[11px]">
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#4edea3]" /> Create / Fire POS & Table Orders</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#4edea3]" /> Accept Card, Cash & Points Tender</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#4edea3]" /> Update Floor Seating Status</li>
              <li className="flex items-center gap-1.5"><X className="w-3.5 h-3.5 text-[#ff949c]" /> Financial Accounting Blocked</li>
            </ul>
          </div>

          <div className="p-3.5 bg-[#131313] border border-[#2a2a2a] rounded-xl space-y-2">
            <span className="font-bold text-amber-400 block">Kitchen Chef & Courier</span>
            <ul className="space-y-1 text-[#d0c5af] text-[11px]">
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#4edea3]" /> KDS Station Bumping & Recalls</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#4edea3]" /> 86 Out of Stock Quick Toggles</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#4edea3]" /> Logistics Route Verification</li>
              <li className="flex items-center gap-1.5"><X className="w-3.5 h-3.5 text-[#ff949c]" /> Cash Drawer Access Blocked</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CREATE STAFF MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#d4af37] rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-lg font-bold text-white">Add Staff Member</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#99907c] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="e.g. Rachel Adams"
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Role *</label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none font-mono"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="CASHIER">CASHIER</option>
                    <option value="WAITER">WAITER</option>
                    <option value="CHEF">CHEF</option>
                    <option value="DRIVER">DRIVER</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">4-Digit PIN *</label>
                  <input
                    type="text"
                    maxLength="6"
                    required
                    value={newStaff.pin_code}
                    onChange={(e) => setNewStaff({ ...newStaff, pin_code: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none font-mono text-center font-bold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Email</label>
                  <input
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    placeholder="staff@restaurantos.io"
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={newStaff.hourly_rate}
                    onChange={(e) => setNewStaff({ ...newStaff, hourly_rate: Number(e.target.value) })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#2a2a2a] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-[#20201f] text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d4af37] text-black font-bold rounded shadow-gold uppercase font-mono"
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
