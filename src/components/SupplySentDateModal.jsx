import React, { useState, useMemo } from 'react'
import { X, Calendar, Search, CheckCircle2, ClipboardList } from 'lucide-react'
import { TRANG_THAI } from '../constants'
import { todayStr, isValidDate, formatNum, formatDate } from '../utils'

export default function SupplySentDateModal({ isOpen, onClose, rows, onUpdate, projectName, projectAbbr = '' }) {
  const [supplyDate, setSupplyDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDot, setSelectedDot] = useState('')

  // Filter items in "Chưa gửi cung ứng" state and plan mode
  const filteredRows = useMemo(() => {
    return rows.filter(r => 
      r.parentId && 
      (r.subMode === 'kehoach' || !r.subMode) && 
      r.trangThai === TRANG_THAI.CHUA_GUI_PCU
    )
  }, [rows])

  // Get unique dot choices from the eligible rows
  const dotChoices = useMemo(() => {
    const dots = filteredRows.map(r => r.dot).filter(Boolean)
    return Array.from(new Set(dots)).sort()
  }, [filteredRows])

  const targetItems = useMemo(() => {
    return filteredRows.filter(r => {
      const q = searchTerm.toLowerCase()
      const matchesSearch = (r.maVattu || '').toLowerCase().includes(q) || (r.tenVattu || '').toLowerCase().includes(q)
      const matchesDot = !selectedDot || r.dot === selectedDot
      return matchesSearch && matchesDot
    })
  }, [filteredRows, searchTerm, selectedDot])

  const toggleSelect = (id) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === targetItems.length && targetItems.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(targetItems.map(r => r.id)))
    }
  }

  const handleApply = () => {
    if (!supplyDate) {
      alert('Vui lòng chọn ngày')
      return
    }
    const [y, m, d] = supplyDate.split('-')
    const formattedDate = `${d}/${m}/${y}`
    
    if (selectedIds.size === 0) {
      alert('Vui lòng chọn ít nhất một dòng')
      return
    }
    onUpdate(Array.from(selectedIds), formattedDate)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300 font-roboto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-amber-200">
        
        {/* Header */}
        <div className="bg-amber-600 px-0 py-0 flex items-center justify-between shrink-0 shadow-lg relative z-10 border-b border-white/10">
          <div className="flex items-center gap-3 pl-6 py-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-black text-[18px] tracking-widest leading-none">NHẬP NGÀY GỬI CUNG ỨNG</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-0 h-full">
            {/* Project Badge - Full height feel */}
            {projectName && (
              <div className="flex items-center gap-4 bg-white/10 h-full px-6 border-l border-white/10 backdrop-blur-md">
                <div className="w-10 h-10 bg-rose-500 text-white text-[14px] font-black rounded-xl border-2 border-rose-400/50 shadow-lg flex items-center justify-center shrink-0 uppercase tracking-tighter">
                  {projectAbbr || 'SGC'}
                </div>
                <div className="flex flex-col">
                  <span className="text-white/70 text-[12px] font-black uppercase tracking-[0.15em] leading-none mb-1.5">Dự án hiện hành</span>
                  <span className="text-white text-[18px] font-black leading-none tracking-tight">{projectName}</span>
                </div>
              </div>
            )}
            
            <button onClick={onClose} className="w-16 h-full flex items-center justify-center hover:bg-black/10 text-white/70 hover:text-white transition-all border-l border-white/10">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between gap-6 shrink-0 shadow-sm relative z-10">
          <div className="flex items-center gap-6 flex-1">
            <div className="flex items-center gap-3">
              <label className="text-[14px] font-black text-amber-700 tracking-widest shrink-0">Ngày gửi:</label>
              <div className="relative w-48">
                <input
                  type="date"
                  value={supplyDate}
                  onChange={e => setSupplyDate(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border-2 border-amber-100 rounded-xl text-[14px] font-black text-slate-800 focus:bg-white focus:border-amber-500 outline-none transition-all"
                />
                <Calendar className="w-5 h-5 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <select
                value={selectedDot}
                onChange={e => setSelectedDot(e.target.value)}
                className="h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold outline-none focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-50 transition-all cursor-pointer min-w-[140px]"
              >
                <option value="">Tất cả đợt</option>
                {dotChoices.map(dot => (
                  <option key={dot} value={dot}>{dot}</option>
                ))}
              </select>
            </div>

            <div className="relative w-80">
              <input
                type="text"
                placeholder="Tìm mã/tên vật tư..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold outline-none focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-50 transition-all"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
               <span className="text-[14px] font-black text-slate-400 tracking-widest">
                 Đã chọn: <span className="text-amber-600 font-black">{selectedIds.size}</span> / {targetItems.length}
               </span>
               <div className="w-px h-4 bg-slate-200" />
               <button 
                 onClick={toggleSelectAll}
                 className="text-[14px] font-black text-royal-600 hover:text-amber-600 tracking-widest transition-colors"
               >
                 {selectedIds.size === targetItems.length && targetItems.length > 0 ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
               </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto bg-slate-50/50">
          {targetItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 grayscale opacity-40">
               <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                 <ClipboardList className="w-10 h-10 text-slate-400" />
               </div>
               <p className="text-[12px] font-black tracking-[0.2em] text-slate-500">Không có dữ liệu chờ gửi</p>
            </div>
          ) : (
            <div className="p-8">
              <div className="bg-white border-2 border-slate-400 rounded-xl overflow-hidden shadow-md">
                <table className="w-full text-[14px] text-left border-collapse">
                  <thead>
                    <tr className="text-[14px] font-black text-slate-500 bg-slate-100/80">
                      <th className="w-16 px-4 py-4 text-center border-b border-r border-slate-400">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-slate-400 text-amber-600 focus:ring-amber-500"
                          checked={selectedIds.size === targetItems.length && targetItems.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="w-48 px-6 py-4 border-b border-r border-slate-400">Mã vật tư</th>
                      <th className="px-6 py-4 border-b border-r border-slate-400">Tên vật tư</th>
                      <th className="px-6 py-4 border-b border-r border-slate-400 text-center">Đvt</th>
                      <th className="w-32 px-6 py-4 border-b border-r border-slate-400 text-center">Khối lượng</th>
                      <th className="w-56 px-6 py-4 border-b border-slate-400 text-center">Đợt kế hoạch</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {targetItems.map((item, idx) => (
                      <tr 
                        key={item.id} 
                        className={`group transition-all cursor-pointer ${selectedIds.has(item.id) ? 'bg-amber-50/70' : 'hover:bg-slate-50'}`}
                        onClick={() => toggleSelect(item.id)}
                      >
                        <td className="px-4 py-3.5 text-center border-b border-r border-slate-400" onClick={e => e.stopPropagation()}>
                          <div className={`w-6 h-6 mx-auto rounded flex items-center justify-center border-2 transition-all ${selectedIds.has(item.id) ? 'bg-amber-600 border-amber-600' : 'bg-white border-slate-400 group-hover:border-amber-300'}`}>
                            {selectedIds.has(item.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 font-black text-royal-600 border-b border-r border-slate-400 text-[14px]">{item.maVattu}</td>
                        <td className="px-6 py-3.5 font-bold text-slate-700 border-b border-r border-slate-400 text-[14px]">
                          <div className="line-clamp-1">{item.tenVattu}</div>
                        </td>
                        <td className="px-6 py-3.5 text-center text-slate-500 font-black border-b border-r border-slate-400 text-[14px]">{item.dvt}</td>
                        <td className="px-6 py-3.5 text-center text-royal-600 font-bold border-b border-r border-slate-400 text-[14px]">{formatNum(item.khoiLuong)}</td>
                        <td className="px-6 py-3.5 text-center border-b border-slate-400">
                          <span className="px-3 py-1 bg-royal-50 text-royal-600 rounded-lg text-[14px] font-black uppercase tracking-tighter border border-royal-100 group-hover:bg-amber-100 group-hover:text-amber-700 group-hover:border-amber-200 transition-colors">
                            {item.dot}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-0 py-0 bg-white border-t border-slate-200 flex items-stretch shrink-0 relative z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] h-20">
          <button
            onClick={handleApply}
            disabled={selectedIds.size === 0}
            className={`flex-1 flex items-center justify-center gap-4 text-[18px] font-black tracking-[0.2em] uppercase transition-all active:scale-95 ${
              selectedIds.size > 0 
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]' 
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className={`w-6 h-6 ${selectedIds.size > 0 ? 'animate-bounce' : ''}`} />
            CẬP NHẬT {selectedIds.size} DÒNG ĐÃ CHỌN
          </button>
          
          <button 
            onClick={onClose} 
            className="w-40 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold text-[14px] tracking-widest border-l border-slate-200 uppercase transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
