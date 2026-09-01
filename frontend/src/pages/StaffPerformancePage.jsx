import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Users, Clock, CheckCircle, RefreshCw, UserCheck, 
  Sparkles, ShieldCheck, LogIn, LogOut
} from 'lucide-react';

export default function StaffPerformancePage() {
  const [attendance, setAttendance] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [att, stf] = await Promise.all([
        api.getAttendance(),
        api.getStaff()
      ]);
      setAttendance(att);
      setStaffList(stf);
    } catch (err) {
      console.error('Failed to load staff performance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async (staffId) => {
    try {
      await api.clockInStaff(staffId);
      loadData();
    } catch (err) {
      alert(`Error clocking in: ${err.message}`);
    }
  };

  const handleClockOut = async (attId) => {
    try {
      await api.clockOutStaff(attId);
      loadData();
    } catch (err) {
      alert(`Error clocking out: ${err.message}`);
    }
  };

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Header */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Users className="w-5 h-5 text-[#d4af37]" />
            Staff Attendance, Shift Scheduling & Performance Index
          </h1>
          <p className="text-xs text-[#99907c] font-mono">Time & attendance clock-in, overtime prevention & hospitality scorecards</p>
        </div>

        <button
          onClick={loadData}
          className="p-2 bg-[#131313] hover:bg-[#2a2a2a] border border-[#353535] rounded-lg text-[#99907c] hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Staff Clock-In Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {staffList.map(st => {
          const activeAtt = attendance.find(a => a.staff === st.id && !a.clock_out);

          return (
            <div key={st.id} className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-5 shadow-card flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={st.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={st.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-bold text-sm text-white font-sans">{st.name}</h3>
                  <span className="text-[10px] font-mono text-[#d4af37] bg-[#554300]/40 px-2 py-0.5 rounded">
                    {st.role}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#2a2a2a] flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold ${activeAtt ? 'text-[#4edea3]' : 'text-[#99907c]'}`}>
                  ● {activeAtt ? 'CLOCKED IN' : 'OFF SHIFT'}
                </span>

                {activeAtt ? (
                  <button
                    onClick={() => handleClockOut(activeAtt.id)}
                    className="px-3 py-1.5 bg-[#92002a]/40 hover:bg-[#92002a]/80 text-[#ffb4ab] border border-[#ffb4ab]/40 rounded-xl font-bold text-xs flex items-center gap-1 font-mono cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Clock Out</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleClockIn(st.id)}
                    className="px-3 py-1.5 bg-[#005236] hover:bg-[#00704a] text-[#4edea3] border border-[#4edea3]/40 rounded-xl font-bold text-xs flex items-center gap-1 font-mono cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Clock In</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
