import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Ticket,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  User,
  Stethoscope
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { storageService } from '../services/storageService';
import { TokenQueueItem } from '../types';

export const DoctorOpdListPage: React.FC = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<TokenQueueItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'emergency' | 'waiting' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setQueue(storageService.getQueue());
  }, []);

  const filteredQueue = queue.filter((item) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'emergency'
        ? item.priority === 'emergency'
        : filter === 'waiting'
        ? item.status === 'waiting'
        : item.status === 'completed';

    const matchesSearch =
      item.tokenNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleCallPatient = (tokenNo: string) => {
    storageService.setActiveToken(tokenNo);
    navigate('/doctor-dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col select-none">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-kiosk flex items-center gap-2.5">
              <ClipboardList className="w-8 h-8 text-primary-600" />
              <span>Doctor OPD Queue Roster</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Live priority patient queue for Room 104 • General Medicine & AYUSH
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/doctor-dashboard')}
            className="kiosk-btn px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-md shadow-emerald-600/30"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Open Active Consultation Desk</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`kiosk-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Patients ({queue.length})
            </button>

            <button
              type="button"
              onClick={() => setFilter('emergency')}
              className={`kiosk-btn px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filter === 'emergency'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Critical Red-Flags ({queue.filter(q => q.priority === 'emergency').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilter('waiting')}
              className={`kiosk-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === 'waiting'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Waiting ({queue.filter(q => q.status === 'waiting').length})
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search token, name, complaint..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-primary-500"
            />
          </div>

        </div>

        {/* Patients Table / List */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {filteredQueue.map((item) => {
              const isEmergency = item.priority === 'emergency';
              return (
                <div
                  key={item.tokenNo}
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isEmergency ? 'bg-rose-50/60 hover:bg-rose-50' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg font-kiosk shrink-0 shadow-sm ${
                        isEmergency
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-primary-50 text-primary-700 border border-primary-200'
                      }`}
                    >
                      {item.tokenNo}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {item.patientName}
                        </h3>
                        <span className="text-xs text-slate-400 font-semibold">
                          ({item.age}y / {item.gender})
                        </span>
                        {isEmergency && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white">
                            EMERGENCY RED ALERT
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        <strong className="text-slate-700">Chief Complaint:</strong> {item.chiefComplaint}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-semibold">
                        <span>Room: {item.roomNo}</span>
                        <span>•</span>
                        <span>Token Time: {item.createdAt}</span>
                        <span>•</span>
                        <span>Est. Wait: ~{item.estimatedWaitMins} mins</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCallPatient(item.tokenNo)}
                      className="kiosk-btn px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
                    >
                      <span>Call Patient to Desk</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredQueue.length === 0 && (
              <div className="p-12 text-center text-slate-400 text-sm">
                No patients found matching the selected filter criteria.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
