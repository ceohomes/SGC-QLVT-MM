import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import DataTable from './components/DataTable'
import EditModal from './components/EditModal'
import SettingsModal from './components/SettingsModal'
import StatsBar from './components/StatsBar'
import { LOCAL_STORAGE_KEY, SETTINGS_KEY, DEFAULT_PCU_DAYS } from './constants'
import { genId, calcTrangThai, calcKhoiLuongConThieu } from './utils'

// ─── XLSX export/import (lazy via CDN-style import) ──────────────────────────
async function loadXLSX() {
  // Use dynamic import - user must have xlsx in node_modules
  return import('xlsx')
}

// Recalculate statuses for all rows
function recalcAll(rows, pcuDays) {
  return rows.map(r => ({
    ...r,
    trangThai: calcTrangThai(r, pcuDays),
  }))
}

export default function App() {
  // ─── Settings ───────────────────────────────────────────────────────────────
  const [settings, setSettings] = useState(() => {
    try {
      const s = localStorage.getItem(SETTINGS_KEY)
      return s ? JSON.parse(s) : { pcuDays: DEFAULT_PCU_DAYS, currentUser: '' }
    } catch { return { pcuDays: DEFAULT_PCU_DAYS, currentUser: '' } }
  })

  const pcuDays = settings.pcuDays || DEFAULT_PCU_DAYS

  // ─── Data ────────────────────────────────────────────────────────────────────
  const [rows, setRows] = useState(() => {
    try {
      const d = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (!d) return []
      const parsed = JSON.parse(d)
      // Recalculate statuses on load
      return recalcAll(parsed, DEFAULT_PCU_DAYS)
    } catch { return [] }
  })

  // Save to localStorage whenever rows change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rows))
  }, [rows])

  // Save settings
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  // ─── UI State ────────────────────────────────────────────────────────────────
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [searchGlobal, setSearchGlobal] = useState('')
  const [sortKey, setSortKey] = useState('')
  const [sortDir, setSortDir] = useState('asc')
  const [filters, setFilters] = useState({
    maVatTu: '',
    tenVatTu: '',
    tenNCC: 'ALL',
    nhom: 'ALL',
    loaiHD: 'ALL',
    trangThai: 'ALL',
    dot: '',
  })
  const [toast, setToast] = useState(null)

  // Show toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────────
  const handleAddNew = () => {
    setEditingRow(null)
    setIsEditOpen(true)
  }

  const handleEdit = (row) => {
    setEditingRow(row)
    setIsEditOpen(true)
  }

  const handleDelete = (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa dòng này?')) return
    setRows(prev => prev.filter(r => r.id !== id))
    showToast('Đã xóa thành công')
  }

  const handleSave = (formData) => {
    if (editingRow) {
      // Edit existing
      setRows(prev => prev.map(r => {
        if (r.id !== editingRow.id) return r
        const updated = { ...r, ...formData }
        updated.trangThai = calcTrangThai(updated, pcuDays)
        return updated
      }))
      showToast('Đã cập nhật thành công')
    } else {
      // Add new
      const newRow = {
        ...formData,
        id: genId(),
        createdAt: new Date().toISOString(),
      }
      newRow.trangThai = calcTrangThai(newRow, pcuDays)
      setRows(prev => [newRow, ...prev])
      showToast('Đã thêm mới thành công')
    }
    setIsEditOpen(false)
    setEditingRow(null)
  }

  const handleRefresh = () => {
    setRows(prev => recalcAll(prev, pcuDays))
    showToast('Đã tính lại trạng thái')
  }

  // When pcuDays changes, recalc all statuses
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings)
    setRows(prev => recalcAll(prev, newSettings.pcuDays || DEFAULT_PCU_DAYS))
    showToast('Đã lưu cài đặt')
  }

  // ─── Filters & Sort ──────────────────────────────────────────────────────────
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setFilters({ maVatTu: '', tenVatTu: '', tenNCC: 'ALL', nhom: 'ALL', loaiHD: 'ALL', trangThai: 'ALL', dot: '' })
    setSearchGlobal('')
  }

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const uniqueNCC = useMemo(() => {
    const s = new Set(rows.map(r => r.tenNCC).filter(Boolean))
    return Array.from(s).sort()
  }, [rows])

  const uniqueNhom = useMemo(() => {
    const s = new Set(rows.map(r => r.nhom).filter(Boolean))
    return Array.from(s).sort()
  }, [rows])

  const filteredRows = useMemo(() => {
    let result = [...rows]

    // Global search
    if (searchGlobal.trim()) {
      const q = searchGlobal.toLowerCase()
      result = result.filter(r =>
        Object.values(r).some(v => v && String(v).toLowerCase().includes(q))
      )
    }

    // Column filters
    if (filters.maVatTu) {
      const q = filters.maVatTu.toLowerCase()
      result = result.filter(r => (r.maVatTu || '').toLowerCase().includes(q))
    }
    if (filters.tenVatTu) {
      const q = filters.tenVatTu.toLowerCase()
      result = result.filter(r => (r.tenVatTu || '').toLowerCase().includes(q))
    }
    if (filters.tenNCC && filters.tenNCC !== 'ALL') {
      result = result.filter(r => r.tenNCC === filters.tenNCC)
    }
    if (filters.nhom && filters.nhom !== 'ALL') {
      result = result.filter(r => r.nhom === filters.nhom)
    }
    if (filters.loaiHD && filters.loaiHD !== 'ALL') {
      result = result.filter(r => r.loaiHD === filters.loaiHD)
    }
    if (filters.trangThai && filters.trangThai !== 'ALL') {
      result = result.filter(r => r.trangThai === filters.trangThai)
    }
    if (filters.dot) {
      const q = filters.dot.toLowerCase()
      result = result.filter(r => (r.dot || '').toLowerCase().includes(q) || (r.dotNhapTay || '').toLowerCase().includes(q))
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const av = a[sortKey] || ''
        const bv = b[sortKey] || ''
        const cmp = String(av).localeCompare(String(bv), 'vi')
        return sortDir === 'asc' ? cmp : -cmp
      })
    }

    return result
  }, [rows, searchGlobal, filters, sortKey, sortDir])

  // ─── Import Excel ─────────────────────────────────────────────────────────────
  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const XLSX = await loadXLSX()
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      if (raw.length < 2) { showToast('File trống hoặc không đúng định dạng', 'error'); return }

      // Map header row to field keys
      const headerMap = {
        'Mã Vật tư': 'maVatTu',
        'Tên vật tư': 'tenVatTu',
        'Đvt': 'dvt',
        'Tên NCC': 'tenNCC',
        'Số Lượng Giao thực NCC': 'soLuongGiaoThuc',
        'Nhóm': 'nhom',
        'Loại HĐ': 'loaiHD',
        'Quy cách kỹ thuật': 'quyCachKyThuat',
        'Đợt': 'dot',
        'Khối lượng': 'khoiLuong',
        'Ngày gửi PCU': 'ngayGuiPCU',
        'Ngày PCU trả': 'ngayPCUTra',
        'Ngày ký HĐ': 'ngayKyHD',
        'Ngày tạm ứng': 'ngayTamUng',
        'Ngày về Dự kiến bắt đầu': 'ngayVeDuKienBatDau',
        'Ngày về Dự kiến kết thúc': 'ngayVeDuKienKetThuc',
        'Đợt (nhập tay)': 'dotNhapTay',
        'Ngày theo nhu cầu BCH': 'ngayTheoNhuCauBCH',
        'Ngày về thực tế': 'ngayVeThucTe',
        'Khối lượng (nhập tay)': 'khoiLuongNhapTay',
        'Tên chuyên viên phối hợp K.QLVT': 'tenChuyenVienKQLVT',
        'Tên CVPCU thực hiện': 'tenCVPCUThucHien',
        'Ghi chú': 'ghiChu',
      }

      const headers = raw[0].map(h => String(h).trim())
      const colMap = {}
      headers.forEach((h, i) => {
        const key = headerMap[h]
        if (key) colMap[i] = key
      })

      const newRows = raw.slice(1)
        .filter(r => r.some(v => v !== ''))
        .map(r => {
          const obj = { id: genId(), createdAt: new Date().toISOString() }
          Object.entries(colMap).forEach(([i, key]) => {
            obj[key] = String(r[i] || '').trim()
          })
          obj.trangThai = calcTrangThai(obj, pcuDays)
          return obj
        })

      setRows(prev => [...prev, ...newRows])
      showToast(`Đã import ${newRows.length} dòng thành công`)
    } catch (err) {
      console.error(err)
      showToast('Lỗi đọc file Excel', 'error')
    }
    e.target.value = ''
  }

  // ─── Export Excel ─────────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const XLSX = await loadXLSX()
      
      const headers = [
        'STT', 'Mã Vật tư', 'Tên vật tư', 'Đvt', 'Tên NCC',
        'Số Lượng Giao thực NCC', 'Nhóm', 'Loại HĐ', 'Quy cách kỹ thuật',
        'Đợt', 'Khối lượng', 'Trạng thái',
        'Ngày gửi PCU', 'Ngày PCU trả', 'Ngày ký HĐ', 'Ngày tạm ứng',
        'Ngày về Dự kiến bắt đầu', 'Ngày về Dự kiến kết thúc',
        'Đợt (nhập tay)', 'Ngày theo nhu cầu BCH', 'Ngày về thực tế',
        'Khối lượng (nhập tay)', 'Khối lượng còn thiếu',
        'Tên chuyên viên phối hợp K.QLVT', 'Tên CVPCU thực hiện', 'Ghi chú'
      ]

      const dataRows = filteredRows.map((r, idx) => [
        idx + 1,
        r.maVatTu || '',
        r.tenVatTu || '',
        r.dvt || '',
        r.tenNCC || '',
        r.soLuongGiaoThuc || '',
        r.nhom || '',
        r.loaiHD || '',
        r.quyCachKyThuat || '',
        r.dot || '',
        r.khoiLuong || '',
        r.trangThai || '',
        r.ngayGuiPCU || '',
        r.ngayPCUTra || '',
        r.ngayKyHD || '',
        r.ngayTamUng || '',
        r.ngayVeDuKienBatDau || '',
        r.ngayVeDuKienKetThuc || '',
        r.dotNhapTay || '',
        r.ngayTheoNhuCauBCH || '',
        r.ngayVeThucTe || '',
        r.khoiLuongNhapTay || '',
        calcKhoiLuongConThieu(r.khoiLuong, r.khoiLuongNhapTay),
        r.tenChuyenVienKQLVT || '',
        r.tenCVPCUThucHien || '',
        r.ghiChu || '',
      ])

      const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows])
      
      // Column widths
      ws['!cols'] = [
        { wch: 5 }, { wch: 12 }, { wch: 25 }, { wch: 8 }, { wch: 20 },
        { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 25 },
        { wch: 8 }, { wch: 12 }, { wch: 12 },
        { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 },
        { wch: 18 }, { wch: 18 },
        { wch: 12 }, { wch: 18 }, { wch: 14 },
        { wch: 15 }, { wch: 16 },
        { wch: 30 }, { wch: 20 }, { wch: 25 }
      ]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Vật tư PCU')
      XLSX.writeFile(wb, `QuanLyVatTu_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`)
      showToast('Xuất Excel thành công')
    } catch (err) {
      console.error(err)
      showToast('Lỗi xuất Excel', 'error')
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-violet-50">
      <Header
        onAddNew={handleAddNew}
        onExport={handleExport}
        onImport={handleImport}
        onOpenSettings={() => setIsSettingsOpen(true)}
        totalRows={rows.length}
        filteredRows={filteredRows.length}
        searchGlobal={searchGlobal}
        onSearchGlobal={setSearchGlobal}
        onRefresh={handleRefresh}
      />

      <StatsBar rows={rows} />

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        uniqueNCC={uniqueNCC}
        uniqueNhom={uniqueNhom}
      />

      {/* Count bar */}
      <div className="bg-white border-b border-violet-100 px-4 py-1.5 flex items-center justify-between text-xs text-slate-500">
        <span>
          Hiển thị <span className="font-bold text-violet-700">{filteredRows.length}</span> / <span className="font-bold">{rows.length}</span> dòng
        </span>
        {filteredRows.length !== rows.length && (
          <span className="text-violet-500 font-semibold">Đang lọc</span>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <DataTable
          rows={filteredRows}
          onEdit={handleEdit}
          onDelete={handleDelete}
          pcuDays={pcuDays}
          currentUser={settings.currentUser}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
        />
      </div>

      {/* Modals */}
      <EditModal
        isOpen={isEditOpen}
        initialData={editingRow}
        onClose={() => { setIsEditOpen(false); setEditingRow(null) }}
        onSave={handleSave}
        currentUser={settings.currentUser}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
      />

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border transition-all text-sm font-semibold ${
          toast.type === 'error'
            ? 'bg-rose-600 text-white border-rose-700'
            : 'bg-slate-900 text-white border-white/10'
        }`}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>
          {toast.message}
        </div>
      )}
    </div>
  )
}
