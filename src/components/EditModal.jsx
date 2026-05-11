import React, { useState, useEffect, useRef, useMemo } from 'react'
import { X, Save, AlertCircle, Package, Search, ChevronDown, Briefcase, Building2 } from 'lucide-react'
import { NHOM_VAT_TU, LOAI_HOP_DONG, CATALOG_VATTU_KEY, TABLES, PALETTE } from '../constants'
import { todayStr, isValidDate } from '../utils'
import { getSupabase } from '../lib/supabase'

const FIELD_GROUPS = [
  {
    title: '🏢 Thông tin Nhà cung cấp & Hợp đồng',
    color: 'royal',
    fields: [
      { key: 'tenNcc', label: 'Tên NCC', type: 'text', placeholder: 'Tên nhà cung cấp...' },
      { key: 'loaiHd', label: 'Loại Hợp đồng', type: 'select', options: LOAI_HOP_DONG },
      { key: 'dot', label: 'Đợt', type: 'text', placeholder: 'VD: Đợt 1...' },
      { key: 'ngayKyHd', label: 'Ngày ký HĐ', type: 'date-text', placeholder: 'dd/mm/yyyy' },
      { key: 'ngayTamUng', label: 'Ngày tạm ứng', type: 'date-text', placeholder: 'dd/mm/yyyy' },
    ]
  },
  {
    title: '📋 Thông tin PCU',
    color: 'blue',
    fields: [
      { key: 'ngayGuiPcu', label: 'Ngày gửi PCU (Nhập tay)', type: 'date-text', placeholder: 'dd/mm/yyyy' },
      { key: 'ngayPcuTra', label: 'Ngày PCU trả (Nhập tay)', type: 'date-text', placeholder: 'dd/mm/yyyy' },
    ]
  },
  {
    title: '📅 Kế hoạch về hàng (Bắt buộc nhập)',
    color: 'emerald',
    required: true,
    fields: [
      { key: 'ngayVeDuKienBatDau', label: 'Ngày về Dự kiến bắt đầu', type: 'date-text', placeholder: 'dd/mm/yyyy', required: true },
      { key: 'ngayVeDuKienKetThuc', label: 'Ngày về Dự kiến kết thúc', type: 'date-text', placeholder: 'dd/mm/yyyy', required: true },
      { key: 'dotNhapTay', label: 'Đợt (nhập tay)', type: 'text', placeholder: 'Đợt...' },
      { key: 'ngayTheoNhuCauBch', label: 'Ngày theo nhu cầu BCH', type: 'date-text', placeholder: 'dd/mm/yyyy' },
    ]
  },
  {
    title: '✅ Thực tế & Kết quả',
    color: 'teal',
    fields: [
      { key: 'ngayVeThucTe', label: 'Ngày về thực tế', type: 'date-text', placeholder: 'dd/mm/yyyy' },
      { key: 'khoiLuongNhapTay', label: 'Khối lượng thực tế', type: 'text', placeholder: 'Nhập khối lượng...' },
    ]
  },
  {
    title: '👤 Phân công & Ghi chú',
    color: 'navy2',
    fields: [
      { key: 'tenChuyenVienKqlvt', label: 'Tên CV phối hợp K.QLVT', type: 'text', placeholder: 'Tên chuyên viên...' },
      { key: 'tenCvpcuThucHien', label: 'Tên CVPCU thực hiện', type: 'text', placeholder: 'Tên CVPCU...' },
      { key: 'ghiChu', label: 'Ghi chú', type: 'textarea', fullWidth: true, placeholder: 'Ghi chú thêm...' },
    ]
  },
]

// ── SearchDropdown Component ──────────────────────────────────
function SearchDropdown({ value, onChange, options, placeholder, field, error }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [displayText, setDisplayText] = useState('')
  const ref = useRef(null)

  // Sync display text when value changes externally
  useEffect(() => {
    if (value) {
      const matched = options.find(o =>
        o.ma_vattu_sap === value || o.ten_vattu === value
      )
      if (matched) {
        setDisplayText(field === 'maVattu' ? matched.ma_vattu_sap : matched.ten_vattu)
      } else {
        setDisplayText(value)
      }
    } else {
      setDisplayText('')
    }
  }, [value, options, field])

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return options.slice(0, 50)
    const q = query.toLowerCase()
    return options.filter(o =>
      (o.ma_vattu_sap || '').toLowerCase().includes(q) ||
      (o.ten_vattu || '').toLowerCase().includes(q)
    ).slice(0, 50)
  }, [query, options])

  const handleSelect = (item) => {
    onChange(item)
    setDisplayText(field === 'maVattu' ? item.ma_vattu_sap : item.ten_vattu)
    setQuery('')
    setOpen(false)
  }

  const baseInput = `w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all pr-8 ${
    error
      ? 'border-rose-400 bg-rose-50 focus:ring-2 focus:ring-rose-200'
      : 'border-royal-200 focus:border-royal-400 focus:ring-2 focus:ring-royal-100'
  }`

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          type="text"
          value={open ? query : displayText}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => { setOpen(true); setQuery('') }}
          placeholder={placeholder}
          className={baseInput}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          {open ? <Search className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </div>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-royal-200 rounded-xl shadow-2xl max-h-56 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400 text-center">Không tìm thấy kết quả</div>
          ) : filtered.map((item, idx) => (
            <button
              key={item.id || idx}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-3 py-2.5 hover:bg-royal-50 transition-colors border-b border-slate-50 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-royal-600 bg-royal-50 px-2 py-0.5 rounded-md shrink-0">
                  {item.ma_vattu_sap || '—'}
                </span>
                <span className="text-xs text-slate-700 truncate">{item.ten_vattu}</span>
              </div>
              {item.dvt && (
                <div className="text-[10px] text-slate-400 mt-0.5 ml-1">ĐVT: {item.dvt}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const COLOR_MAP = {
  navy:    { header: 'bg-royal-600',   border: 'border-royal-200',   label: 'text-royal-700' },
  navy2:   { header: 'bg-royal-500',   border: 'border-royal-200',   label: 'text-royal-700' },
  indigo:  { header: 'bg-indigo-600',  border: 'border-indigo-200',  label: 'text-indigo-700' },
  blue:    { header: 'bg-royal-500',   border: 'border-royal-200',   label: 'text-royal-700' },
  emerald: { header: 'bg-emerald-600', border: 'border-emerald-200', label: 'text-emerald-700' },
  teal:    { header: 'bg-teal-600',    border: 'border-teal-200',    label: 'text-teal-700' },
  royal:   { header: 'bg-royal-600',   border: 'border-royal-200',   label: 'text-royal-700' },
}

function InputField({ field, value, onChange, error, displayValue, vattuOptions, onVattuSelect }) {
  const baseInput = `w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all ${
    error
      ? 'border-rose-400 bg-rose-50 focus:ring-2 focus:ring-rose-200'
      : field.readOnly 
        ? 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed font-medium'
        : 'border-royal-200 focus:border-royal-400 focus:ring-2 focus:ring-royal-100'
  }`

  // Readonly — hiển thị tên dự án đã chọn từ màn hình chính, không cho sửa
  if (field.type === 'readonly') {
    return (
      <div className="w-full px-3 py-2 border border-royal-200 rounded-lg text-sm bg-royal-50 text-royal-800 font-semibold select-none flex items-center gap-2">
        <span className="text-royal-400">📁</span>
        <span className="flex-1 truncate">{displayValue || '—'}</span>
        <span className="text-[10px] text-royal-400 font-normal italic whitespace-nowrap">Đã chọn từ màn hình chính</span>
      </div>
    )
  }

  // Vattu search dropdown
  if (field.type === 'vattu-search') {
    return (
      <SearchDropdown
        value={value}
        onChange={onVattuSelect}
        options={vattuOptions || []}
        placeholder={field.placeholder}
        field={field.key}
        error={error}
      />
    )
  }

  if (field.type === 'select') {
    return (
      <select
        disabled={field.readOnly}
        value={value || ''}
        onChange={e => onChange(field.key, e.target.value)}
        className={baseInput}
      >
        <option value="">-- Chọn --</option>
        {field.options.map(o => {
          const val   = typeof o === 'object' ? o.value : o
          const label = typeof o === 'object' ? o.label : o
          return <option key={val} value={val}>{label}</option>
        })}
      </select>
    )
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        readOnly={field.readOnly}
        value={value || ''}
        onChange={e => onChange(field.key, e.target.value)}
        placeholder={field.placeholder}
        rows={3}
        className={`${baseInput} resize-none`}
      />
    )
  }

  if (field.type === 'date-text') {
    const toInputVal = (v) => {
      if (!v || !v.trim()) return ''
      const parts = v.trim().split('/')
      if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`
      return ''
    }
    const fromInputVal = (v) => {
      if (!v) return ''
      const parts = v.split('-')
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
      return ''
    }
    return (
      <div className="relative">
        <input
          type="date"
          readOnly={field.readOnly}
          value={toInputVal(value)}
          onChange={e => onChange(field.key, fromInputVal(e.target.value))}
          className={`${baseInput} pr-2 cursor-pointer`}
        />
      </div>
    )
  }

  return (
    <input
      type="text"
      readOnly={field.readOnly}
      value={value || ''}
      onChange={e => onChange(field.key, e.target.value)}
      placeholder={field.placeholder}
      className={baseInput}
    />
  )
}

export default function EditModal({ isOpen, initialData, onClose, onSave, currentUser, projects = [] }) {
  const [formData, setFormData]   = useState({})
  const [errors,   setErrors]     = useState({})
  const [vattuList, setVattuList] = useState([])

  // Load danh sách vật tư từ Supabase hoặc localStorage
  useEffect(() => {
    async function loadVattu() {
      const supabase = getSupabase()
      if (supabase) {
        try {
          const { data } = await supabase.from(TABLES.DM_VATTU).select('*')
          if (data) { setVattuList(data); return }
        } catch (_) {}
      }
      const local = localStorage.getItem(CATALOG_VATTU_KEY)
      if (local) {
        try { setVattuList(JSON.parse(local)) } catch (_) {}
      }
    }
    if (isOpen) loadVattu()
  }, [isOpen])

  // Tên hiển thị cho trường readonly "Dự án"
  const selectedProject = React.useMemo(() => {
    const pid = formData?.projectId || initialData?.projectId
    if (!pid) return null
    return projects.find(pr => pr.id === pid)
  }, [formData?.projectId, initialData?.projectId, projects])

  const projectDisplayName = React.useMemo(() => {
    if (!selectedProject) return formData?.projectId || initialData?.projectId || ''
    const vt = selectedProject.khoiVietTat || selectedProject.vietTat
    return vt 
      ? `${vt}. ${selectedProject.ten}` 
      : selectedProject.ten
  }, [selectedProject, formData?.projectId, initialData?.projectId])

  const dynamicFieldGroups = React.useMemo(() => {
    const isEdit = !!initialData?.id
    const isSubRow = !!(initialData?.parentId)
    
    // Nếu mở modal với projectId đã set (chọn từ header) → hiển thị readonly
    const hasProject = !!(initialData?.projectId)
    const projectField = hasProject
      ? null  // Đã hiển thị ở header, không cần trong body
      : {
          key: 'projectId',
          label: 'Dự án',
          type: 'select',
          options: projects.map(p => ({
            label: p.khoiVietTat ? `${p.khoiVietTat}. ${p.ten}` : p.ten,
            value: p.id
          })),
          fullWidth: true
        }

    const materialGroup = {
      title: '📦 Thông tin vật tư',
      color: 'navy',
      fields: [
        ...(projectField ? [projectField] : []),
        { key: 'maVattu',           label: 'Mã Vật tư',                 type: 'vattu-search', placeholder: 'VD: VT001 — nhập để tìm kiếm', span: 1, required: true },
        { key: 'tenVattu',          label: 'Tên vật tư',                 type: 'vattu-search', placeholder: 'Nhập tên vật tư để tìm kiếm...', span: 2, required: true },
        { key: 'dvt',               label: 'Đơn vị tính',               type: 'text',     placeholder: 'VD: Cái, Kg, m...',   span: 1, readOnly: true },
        { key: 'nhom',              label: 'Nhóm',                       type: 'text',     placeholder: 'Chưa xác định nhóm...', span: 2, readOnly: true },
        { key: 'quyCachKyThuat',    label: 'Quy cách kỹ thuật',         type: 'textarea', fullWidth: true,                    placeholder: 'Mô tả quy cách kỹ thuật...', readOnly: true },
      ]
    }

    // Nếu là dòng phụ (hoặc đang edit dòng phụ)
    if (isSubRow) {
      return FIELD_GROUPS
    }

    // Nếu là dòng chính (hoặc đang thêm dòng chính mới)
    return [materialGroup]
  }, [projects, initialData?.projectId, initialData?.id, initialData?.parentId])

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || { tenChuyenVienKqlvt: currentUser || '' })
      setErrors({})
    }
  }, [isOpen, initialData, currentUser])

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape' && isOpen) onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }))
  }

  // Khi chọn vật tư từ dropdown, tự điền các trường liên quan
  const handleVattuSelect = (item) => {
    setFormData(prev => ({
      ...prev,
      maVattu: item.ma_vattu_sap || '',
      tenVattu: item.ten_vattu || '',
      dvt: item.dvt || '',
      nhom: item.ten_nhom_vattu || '',
      quyCachKyThuat: item.thong_so_ky_thuat || '',
    }))
    // Clear errors for these fields immediately
    setErrors(prev => {
      const next = { ...prev }
      delete next.maVattu
      delete next.tenVattu
      return next
    })
  }

  const validate = () => {
    const isEdit = !!initialData?.id
    const isSubRow = !!(initialData?.parentId || formData?.parentId)
    const newErrors = {}

    // Chỉ validate các trường ngày nếu là dòng phụ
    if (isSubRow) {
      if (!formData.ngayVeDuKienBatDau || !formData.ngayVeDuKienBatDau.trim())
        newErrors.ngayVeDuKienBatDau = 'Vui lòng chọn ngày'
      if (!formData.ngayVeDuKienKetThuc || !formData.ngayVeDuKienKetThuc.trim())
        newErrors.ngayVeDuKienKetThuc = 'Vui lòng chọn ngày'
    } else {
      // Khi dòng chính, validate Mã vật tư và Tên vật tư
      if (!formData.maVattu) newErrors.maVattu = 'Bắt buộc'
      if (!formData.tenVattu) newErrors.tenVattu = 'Bắt buộc'
      const pid = formData.projectId || initialData?.projectId
      if (!pid || pid === 'ALL') {
        newErrors.projectId = 'Vui lòng chọn một dự án cụ thể'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave(formData)
  }

  if (!isOpen) return null

  const isEdit = !!initialData?.id

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-backdrop bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-royal-200">

        {/* Header */}
        <div className="bg-gradient-to-r from-royal-700 to-royal-500 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-white font-black text-lg">{isEdit ? 'Chỉnh sửa Vật tư' : 'Thêm mới Vật tư'}</h2>
              <p className="text-royal-200 text-xs">Điền đầy đủ thông tin, các trường * là bắt buộc</p>
            </div>
            {/* Thông tin dự án đã chọn — bage với màu nền đậm theo yêu cầu */}
            {projectDisplayName && (
              <div 
                className="flex items-center gap-3.5 border rounded-2xl px-5 py-2.5 shrink-0 max-w-[420px] shadow-[0_12px_24px_rgba(0,0,0,0.12)] hover:shadow-xl transition-all group/project animate-in fade-in slide-in-from-right-6 duration-700 overflow-hidden relative"
                style={{ 
                  backgroundColor: selectedProject?.paletteIdx !== undefined ? PALETTE[selectedProject.paletteIdx]?.bg : 'rgba(255,255,255,1)',
                  borderColor: selectedProject?.paletteIdx !== undefined ? PALETTE[selectedProject.paletteIdx]?.border : 'rgba(255,255,255,0.5)'
                }}
              >
                {/* Lớp phủ màu đặc (solid) của palette badge để làm nền đậm hơn đáng kể như yêu cầu */}
                <div 
                  className="absolute inset-0 opacity-40 pointer-events-none" 
                  style={{ backgroundColor: selectedProject?.paletteIdx !== undefined ? PALETTE[selectedProject.paletteIdx]?.badge : 'transparent' }} 
                />
                
                <div 
                  className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-lg border-2 group-hover/project:scale-110 group-hover/project:rotate-3 transition-all duration-500 overflow-hidden relative z-10"
                  style={{ borderColor: selectedProject?.paletteIdx !== undefined ? PALETTE[selectedProject.paletteIdx]?.badge : 'white' }}
                >
                  {selectedProject?.khoiVietTat ? (
                    <div className="flex flex-col items-center justify-center">
                      <span 
                        className="text-[11px] font-black leading-none"
                        style={{ color: selectedProject?.paletteIdx !== undefined ? PALETTE[selectedProject.paletteIdx]?.badge : '#1e3a8a' }}
                      >
                        {selectedProject.khoiVietTat}
                      </span>
                      <div 
                        className="w-4 h-0.5 rounded-full mt-1" 
                        style={{ backgroundColor: selectedProject?.paletteIdx !== undefined ? PALETTE[selectedProject.paletteIdx]?.badge : '#60a5fa' }}
                      />
                    </div>
                  ) : (
                    <Briefcase className="w-6 h-6 text-royal-600" />
                  )}
                </div>
                <div className="min-w-0 z-10">
                  <div 
                    className="text-[10px] font-black uppercase tracking-[0.3em] leading-none mb-2 opacity-80"
                    style={{ color: selectedProject?.paletteIdx !== undefined ? PALETTE[selectedProject.paletteIdx]?.badge : '#475569' }}
                  >
                    Dự án đang chọn
                  </div>
                  <div 
                    className="font-black text-[15px] truncate leading-tight transition-transform"
                    style={{ color: selectedProject?.paletteIdx !== undefined ? PALETTE[selectedProject.paletteIdx]?.badge : '#1e293b' }}
                  >
                    {projectDisplayName}
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-all shrink-0 ml-3"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {dynamicFieldGroups.map(group => {
            const colors = COLOR_MAP[group.color]
            return (
              <div key={group.title} className={`rounded-xl border ${colors.border} overflow-hidden`}>
                <div className={`${colors.header} px-4 py-2.5 text-white font-bold text-sm`}>
                  {group.title}
                </div>
                <div className="p-4 grid grid-cols-3 gap-4">
                  {group.fields.map(field => {
                    let colClass = ''
                    if (field.fullWidth) colClass = 'col-span-3'
                    else if (field.span === 2) colClass = 'col-span-2'
                    else if (field.span === 1) colClass = 'col-span-1'
                    else colClass = 'col-span-1' // default
                    return (
                    <div key={field.key} className={colClass}>
                      <label className={`block text-xs font-bold ${colors.label} mb-1`}>
                        {field.label}
                        {field.required && <span className="text-rose-500 ml-1">*</span>}
                      </label>
                      <InputField
                        field={field}
                        value={formData[field.key]}
                        onChange={handleChange}
                        error={errors[field.key]}
                        displayValue={field.type === 'readonly' ? projectDisplayName : undefined}
                        vattuOptions={vattuList}
                        onVattuSelect={handleVattuSelect}
                      />
                      {errors[field.key] && (
                        <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors[field.key]}
                        </p>
                      )}
                    </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-royal-100 bg-royal-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 h-10 border border-slate-300 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-100 transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 h-10 bg-gradient-to-r from-royal-600 to-royal-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-royal-600/30 hover:shadow-royal-600/50 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            {isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
          </button>
        </div>
      </div>
    </div>
  )
}
