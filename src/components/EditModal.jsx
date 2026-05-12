import React, { useState, useEffect, useRef, useMemo } from 'react'
import { X, Save, AlertCircle, Package, Search, ChevronDown, Briefcase, Building2, Hammer, Wrench, Construction, ClipboardList } from 'lucide-react'
import { NHOM_VAT_TU, LOAI_HOP_DONG, CATALOG_VATTU_KEY, TABLES, PALETTE } from '../constants'
import { todayStr, isValidDate } from '../utils'
import { getSupabase } from '../lib/supabase'

const FIELD_GROUPS = [
  {
    title: 'Thông tin Nhà cung cấp & Hợp đồng',
    color: 'royal',
    fields: [
      { key: 'tenNcc', label: 'Tên nhà cung cấp', type: 'text', placeholder: 'Tên nhà cung cấp...' },
      { key: 'loaiHd', label: 'Loại hợp đồng', type: 'select', options: LOAI_HOP_DONG, required: true },
      { key: 'dot', label: 'Đợt', type: 'text', placeholder: 'VD: Đợt 1...' },
    ]
  },
  {
    title: 'Thông tin PCU',
    color: 'blue',
    fields: [
      { key: 'ngayGuiPcu', label: 'Ngày gửi PCU (Nhập tay)', type: 'date-text', placeholder: 'dd/mm/yyyy' },
      { key: 'ngayPcuTra', label: 'Ngày PCU trả (Nhập tay)', type: 'date-text', placeholder: 'dd/mm/yyyy' },
      { key: 'ngayKyHd', label: 'Ngày ký hợp đồng', type: 'date-text', placeholder: 'dd/mm/yyyy' },
      { key: 'ngayTamUng', label: 'Ngày tạm ứng', type: 'date-text', placeholder: 'dd/mm/yyyy' },
    ]
  },
  {
    title: 'Kế hoạch về hàng',
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
function SearchDropdown({ value, onChange, options, placeholder, field, error, existingCodes = new Set(), dropdownClassName }) {
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
    const isExisting = item.ma_vattu_sap && existingCodes.has(item.ma_vattu_sap)
    if (isExisting) return
    
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
        <div className={`absolute z-50 mt-1 bg-white border border-royal-200 rounded-xl shadow-2xl max-h-[550px] overflow-y-auto ${dropdownClassName || 'w-full'}`}>
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400 text-center">Không tìm thấy kết quả</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((item, idx) => {
                const isExisting = item.ma_vattu_sap && existingCodes.has(item.ma_vattu_sap)
                return (
                  <button
                    key={item.id || idx}
                    type="button"
                    onClick={() => handleSelect(item)}
                    disabled={isExisting}
                    className={`w-full text-left px-4 py-3 transition-all relative group/item
                      ${isExisting ? 'bg-slate-50/50 cursor-not-allowed opacity-75' : 'hover:bg-royal-50/80 active:bg-royal-100'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col shrink-0 w-28">
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded border text-center
                          ${isExisting 
                            ? 'text-slate-400 bg-slate-100 border-slate-200 line-through' 
                            : 'text-royal-600 bg-royal-50 border-royal-100 group-hover/item:border-royal-200'}
                        `}>
                          {item.ma_vattu_sap || '—'}
                        </span>
                        {item.dvt && (
                          <span className="text-[10px] text-slate-400 mt-1 ml-1">ĐVT: {item.dvt}</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm block leading-snug whitespace-normal break-words ${
                          isExisting ? 'text-rose-400 line-through italic' : 'text-slate-700 font-medium'
                        }`}>
                          {item.ten_vattu}
                        </span>
                        {item.ten_nhom_vattu && (
                          <span className="text-[10px] text-slate-400 block mt-0.5 whitespace-normal">{item.ten_nhom_vattu}</span>
                        )}
                      </div>

                      {isExisting && (
                        <div className="shrink-0 flex items-center gap-1.5 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                          <AlertCircle className="w-3 h-3 text-rose-500" />
                          <span className="text-[9px] font-black uppercase text-rose-600 tracking-tighter">
                            Đã thêm
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const COLOR_MAP = {
  navy:    { header: 'bg-royal-600',   border: 'border-royal-200',   label: 'text-royal-900' },
  navy2:   { header: 'bg-royal-500',   border: 'border-royal-200',   label: 'text-royal-900' },
  indigo:  { header: 'bg-indigo-600',  border: 'border-indigo-200',  label: 'text-indigo-900' },
  blue:    { header: 'bg-royal-500',   border: 'border-royal-200',   label: 'text-royal-900' },
  emerald: { header: 'bg-emerald-600', border: 'border-emerald-200', label: 'text-emerald-900' },
  teal:    { header: 'bg-teal-600',    border: 'border-teal-200',    label: 'text-teal-900' },
  royal:   { header: 'bg-royal-600',   border: 'border-royal-200',   label: 'text-royal-900' },
}

function InputField({ field, value, onChange, error, displayValue, vattuOptions, onVattuSelect, existingCodes }) {
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
        existingCodes={existingCodes}
        dropdownClassName={field.dropdownClassName}
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
          onClick={(e) => {
            if (!field.readOnly && e.target.showPicker) {
              try { e.target.showPicker() } catch (_) {}
            }
          }}
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

export default function EditModal({ isOpen, initialData, onClose, onSave, currentUser, projects = [], existingRows = [] }) {
  const [formData, setFormData]   = useState({})
  const [errors,   setErrors]     = useState({})
  const [vattuList, setVattuList] = useState([])

  // Mã vật tư đã tồn tại trong dự án đang chọn
  const existingCodesInProject = React.useMemo(() => {
    let pid = formData.projectId || initialData?.projectId;
    if (!pid || pid === 'ALL' || !existingRows) return new Set();
    
    // Chuẩn hóa pid: Nếu đang là ID dự án con, chuyển về ID khối cha để đồng nhất với database
    const proj = projects.find(p => p.id === pid);
    if (proj && proj.khoiId) {
      pid = proj.khoiId;
    }
    
    // Tìm các dòng chính (không có parentId) thuộc project này
    // Quan trọng: Nếu đang EDIT, loại bỏ dòng hiện tại khỏi danh sách kiểm tra trùng
    const isEdit = !!initialData?.id;
    const currentId = initialData?.id;

    const codes = existingRows
      .filter(r => r.projectId === pid && !r.parentId && (!isEdit || r.id !== currentId))
      .map(r => r.maVattu)
      .filter(Boolean);
      
    return new Set(codes);
  }, [formData.projectId, initialData?.projectId, existingRows, initialData?.id, projects]);

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
      title: 'Thông tin vật tư',
      color: 'navy',
      fields: [
        ...(projectField ? [projectField] : []),
        { key: 'maVattu',           label: 'Mã vật tư',                 type: 'vattu-search', placeholder: 'VD: VT001 — nhập để tìm kiếm', span: 1, required: true, dropdownClassName: 'w-[290%] shadow-2xl' },
        { key: 'tenVattu',          label: 'Tên vật tư',                 type: 'vattu-search', placeholder: 'Nhập tên vật tư để tìm kiếm...', span: 2, required: true, dropdownClassName: 'w-[145%] right-0 shadow-2xl' },
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
      } else if (formData.maVattu && existingCodesInProject.has(formData.maVattu)) {
        // CHẶN: Nếu mã vật tư đã tồn tại trong project này (và không phải chính nó đang edit)
        newErrors.maVattu = 'Vật tư này đã được thêm trong dự án này rồi'
        newErrors.tenVattu = 'Vui lòng chọn vật tư khác'
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden border border-royal-200">

        {/* Header */}
        <div className="bg-gradient-to-r from-royal-700 to-royal-500 px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <ClipboardList className="w-9 h-9 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-white font-black text-xl">Chi tiết công việc</h2>
              <p className="text-royal-200 text-xs mt-0.5">Điền đầy đủ thông tin, các trường * là bắt buộc</p>
            </div>
            {/* Thông tin dự án đã chọn — Thiết kế lại sạch sẽ & chuyên nghiệp hơn */}
            {projectDisplayName && (
              <div 
                className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl py-1.5 px-3 border border-white/20 shadow-xl group/badge animate-in fade-in slide-in-from-top-2 duration-700 h-12"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 text-white font-black text-[11px] shadow-lg relative overflow-hidden border border-white/30"
                  style={{ backgroundColor: selectedProject?.paletteIdx !== undefined ? PALETTE[selectedProject.paletteIdx]?.badge : '#4f46e5' }}
                >
                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 -translate-x-full group-hover/badge:translate-x-full transition-transform duration-1000" />
                  
                  {selectedProject?.khoiVietTat ? (
                    <span className="leading-none uppercase text-center w-full px-1 break-words font-roboto">{selectedProject.khoiVietTat}</span>
                  ) : (
                    <Briefcase className="w-5 h-5 text-white/90" />
                  )}
                </div>
                <div className="flex flex-col min-w-0 pr-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-black text-royal-100 uppercase tracking-widest whitespace-nowrap font-roboto">Dự án hiện hành</span>
                  </div>
                  <div className="font-bold text-[14px] text-white leading-none truncate max-w-[280px] font-roboto">
                    {projectDisplayName}
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-all shrink-0 ml-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {dynamicFieldGroups.map(group => {
            const colors = COLOR_MAP[group.color]
            return (
              <div key={group.title} className={`rounded-xl border ${colors.border} shadow-sm transition-all relative z-10 hover:z-20`}>
                <div className={`${colors.header} px-5 py-3 text-white font-bold text-base flex items-center gap-2 rounded-t-xl`}>
                  <Wrench className="w-5 h-5 opacity-90" />
                  {group.title}
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                  {group.fields.map(field => {
                    let colClass = ''
                    if (field.fullWidth) colClass = 'col-span-3'
                    else if (field.span === 2) colClass = 'col-span-2'
                    else if (field.span === 1) colClass = 'col-span-1'
                    else colClass = 'col-span-1' // default
                    return (
                    <div key={field.key} className={colClass}>
                        <label className={`block text-[15px] font-bold ${colors.label} mb-1.5 font-roboto`}>
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
                        existingCodes={existingCodesInProject}
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
