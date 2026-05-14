import React, { useState, useEffect, useRef, useMemo } from 'react'
import { X, Save, AlertCircle, Package, Search, ChevronDown, Briefcase, Building2, Hammer, Wrench, Construction, ClipboardList, Plus, Trash2 } from 'lucide-react'
import { NHOM_VAT_TU, LOAI_HOP_DONG, CATALOG_VATTU_KEY, CATALOG_NCC_KEY, TABLES, PALETTE } from '../constants'
import { todayStr, isValidDate } from '../utils'
import { getSupabase } from '../lib/supabase'

const FIELD_GROUPS = [
  {
    title: '📋 Kế hoạch',
    color: 'blue',
    fields: [
      { key: 'tenNcc',               label: 'Tên nhà cung cấp',           type: 'ncc-search', placeholder: 'Chọn nhà cung cấp...', fullWidth: true, required: true },
      { key: 'loaiHd',               label: 'Loại hợp đồng',              type: 'select', options: LOAI_HOP_DONG, required: true },
      { key: 'dot',                  label: 'Đợt',                        type: 'text', placeholder: 'Tự động...', readOnly: true },
      { key: 'khoiLuong',            label: 'Khối lượng',                 type: 'text', placeholder: 'VD: 100...', required: true },
      { key: 'tenCvpcuThucHien',     label: 'Cán bộ phụ trách',           type: 'text', placeholder: 'Tên CB phụ trách...' },
      { key: 'ngayGuiPcu',           label: 'Ngày gửi PCU',               type: 'date-text', placeholder: 'dd/mm/yyyy' },
      { key: 'ngayPcuTra',           label: 'Ngày PCU trả',               type: 'date-text', placeholder: 'dd/mm/yyyy' },
      { key: 'ngayKyHd',             label: 'Ngày ký hợp đồng',           type: 'date-text', placeholder: 'dd/mm/yyyy' },
      { key: 'ngayTamUng',           label: 'Ngày tạm ứng',               type: 'date-text', placeholder: 'dd/mm/yyyy' },
      { key: 'ngayVeDuKienBatDau',   label: 'Ngày về dự kiến (Bắt đầu)',   type: 'date-text', placeholder: 'dd/mm/yyyy' },
      { key: 'ngayVeDuKienKetThuc',  label: 'Ngày về dự kiến (Kết thúc)',  type: 'date-text', placeholder: 'dd/mm/yyyy' },
      { key: 'ghiChu',               label: 'Ghi chú',                    type: 'textarea', fullWidth: true, placeholder: 'Ghi chú thêm...' },
    ]
  },
  {
    title: '✅ Thực tế',
    color: 'emerald',
    fields: [
      { key: 'tenNccThucTe',         label: 'Tên nhà cung cấp',           type: 'ncc-search', placeholder: 'Chọn nhà cung cấp...', fullWidth: true, required: true },
      { key: 'dotNhapTay',           label: 'Đợt',                        type: 'text', placeholder: 'Tự động...', readOnly: true },
      { key: 'ngayTheoNhuCauBch',    label: 'Ngày BCH yêu cầu',            type: 'date-text', placeholder: 'dd/mm/yyyy' },
      { key: 'ngayVeThucTe',         label: 'Ngày về thực tế',            type: 'date-text', placeholder: 'dd/mm/yyyy', required: true },
      { key: 'khoiLuongNhapTay',     label: 'Khối lượng',                  type: 'text', placeholder: 'Nhập khối lượng...' },
      { key: 'ghiChu',               label: 'Ghi chú',                    type: 'textarea', fullWidth: true, placeholder: 'Ghi chú thêm...' },
    ]
  },
  {
    title: '👤 Phân công & Ghi chú',
    color: 'navy2',
    fields: [
      { key: 'tenChuyenVienKqlvt', label: 'Chuyên viên P. QLVT', type: 'hidden' },
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

// ── NccDropdown Component ─────────────────────────────────────
function NccDropdown({ value, onChange, nccOptions, placeholder, error, isActual }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return nccOptions.slice(0, 50)
    const q = query.toLowerCase()
    return nccOptions.filter(o =>
      (o.nha_cung_cap || '').toLowerCase().includes(q) ||
      (o.ma_so_thue || '').toLowerCase().includes(q) ||
      (o.ma_vendor_sap || '').toLowerCase().includes(q)
    ).slice(0, 50)
  }, [query, nccOptions])

  const handleSelect = (item) => {
    onChange(item.nha_cung_cap || '')
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
          value={open ? query : value || ''}
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
        <div className="absolute z-50 mt-1 bg-white border border-royal-200 rounded-xl shadow-2xl max-h-[350px] overflow-y-auto w-full">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400 text-center">
              {isActual && nccOptions.length === 0 
                ? 'Vui lòng thêm Kế hoạch cho vật tư này trước' 
                : 'Không tìm thấy nhà cung cấp'}
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((item, idx) => (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-4 py-3 hover:bg-royal-50/80 active:bg-royal-100 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-semibold text-slate-800 whitespace-normal break-words">{item.nha_cung_cap}</span>
                      <div className="flex gap-3 mt-0.5">
                        {item.ma_vendor_sap && (
                          <span className="text-[10px] text-royal-600 font-bold bg-royal-50 px-1.5 py-0.5 rounded border border-royal-100">SAP: {item.ma_vendor_sap}</span>
                        )}
                        {item.ma_so_thue && (
                          <span className="text-[10px] text-slate-400">MST: {item.ma_so_thue}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
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

function AutoResizingTextarea({ value, onChange, placeholder, className, readOnly }) {
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [value])

  return (
    <textarea
      ref={textareaRef}
      readOnly={readOnly}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${className} overflow-hidden`}
      style={{ minHeight: '80px' }}
    />
  )
}

function InputField({ field, value, onChange, error, displayValue, vattuOptions, onVattuSelect, existingCodes, nccOptions, isActual }) {
  const baseInput = `w-full px-3 py-2.5 border rounded-xl text-sm outline-none transition-all shadow-sm ${
    error
      ? 'border-rose-400 bg-rose-50 focus:ring-4 focus:ring-rose-100'
      : field.readOnly 
        ? 'border-slate-100 bg-slate-50/80 text-slate-500 cursor-not-allowed font-medium'
        : 'border-slate-200 focus:border-royal-400 focus:ring-4 focus:ring-royal-50 bg-white hover:border-slate-300'
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

  // NCC search dropdown
  if (field.type === 'ncc-search') {
    return (
      <NccDropdown
        value={value}
        onChange={(val) => onChange(field.key, val)}
        nccOptions={nccOptions || []}
        placeholder={field.placeholder}
        error={error}
        isActual={isActual}
      />
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
      <AutoResizingTextarea
        readOnly={field.readOnly}
        value={value}
        onChange={val => onChange(field.key, val)}
        placeholder={field.placeholder}
        className={baseInput}
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

export default function EditModal({ isOpen, initialData, onClose, onSave, currentUser, projects = [], existingRows = [], onAddSubRow, onDelete }) {
  const [formData, setFormData]   = useState({})
  const [errors,   setErrors]     = useState({})
  const [vattuList, setVattuList] = useState([])
  const [nccList, setNccList]     = useState([])

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
          const [vattuRes, nccRes] = await Promise.all([
            supabase.from(TABLES.DM_VATTU).select('*'),
            supabase.from(TABLES.DM_NCC).select('*'),
          ])
          if (vattuRes.data) { setVattuList(vattuRes.data) }
          if (nccRes.data) { setNccList(nccRes.data); return }
        } catch (_) {}
      }
      const local = localStorage.getItem(CATALOG_VATTU_KEY)
      if (local) {
        try { setVattuList(JSON.parse(local)) } catch (_) {}
      }
      const localNcc = localStorage.getItem(CATALOG_NCC_KEY)
      if (localNcc) {
        try { setNccList(JSON.parse(localNcc)) } catch (_) {}
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

  // Viết tắt khối để hiển thị trong badge - lấy từ selectedProject hoặc parse từ duAn string
  const badgeVietTat = React.useMemo(() => {
    // Priority 1: Parse từ duAn string dạng "SLHT. HLX" → "SLHT"
    const rawDuAn = initialData?.duAn || formData?.duAn || ''
    const dotIdx = rawDuAn.indexOf('.')
    if (dotIdx > 0 && dotIdx <= 6) return rawDuAn.substring(0, dotIdx).trim()

    // Priority 2: Từ project object
    if (selectedProject?.khoiVietTat) return selectedProject.khoiVietTat
    if (selectedProject?.vietTat) return selectedProject.vietTat
    
    return null
  }, [selectedProject, initialData?.duAn, formData?.duAn])

  // Màu badge từ selectedProject hoặc fallback
  const badgeColor = React.useMemo(() => {
    if (selectedProject?.paletteIdx !== undefined) return PALETTE[selectedProject.paletteIdx]?.badge
    return '#4f46e5'
  }, [selectedProject])

  const projectDisplayName = React.useMemo(() => {
    const rawDuAn = initialData?.duAn || formData?.duAn || ''
    // Nếu có format "SLHT. HLX" thì lấy phần sau dấu chấm
    if (rawDuAn.includes('. ')) {
      return rawDuAn.split('. ').slice(1).join('. ')
    }

    if (!selectedProject) {
      return rawDuAn || formData?.projectId || initialData?.projectId || ''
    }
    return selectedProject.ten
  }, [selectedProject, formData?.projectId, initialData?.projectId, initialData?.duAn, formData?.duAn])

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
        { key: 'maVattu',           label: 'Mã vật tư',                 type: 'vattu-search', placeholder: 'VD: VT001 — nhập để tìm kiếm', span: 1, required: true, dropdownClassName: 'w-[290%] shadow-2xl' },
        { key: 'tenVattu',          label: 'Tên vật tư',                 type: 'vattu-search', placeholder: 'Nhập tên vật tư để tìm kiếm...', span: 2, required: true, dropdownClassName: 'w-[145%] right-0 shadow-2xl' },
        { key: 'dvt',               label: 'Đơn vị tính',               type: 'text',     placeholder: 'VD: Cái, Kg, m...',   span: 1, readOnly: true },
        { key: 'nhom',              label: 'Nhóm',                       type: 'text',     placeholder: 'Chưa xác định nhóm...', span: 2, readOnly: true },
        { key: 'quyCachKyThuat',    label: 'Quy cách kỹ thuật',         type: 'textarea', fullWidth: true,                    placeholder: 'Mô tả quy cách kỹ thuật...' },
      ]
    }

    const phancong = FIELD_GROUPS.find(g => g.title.includes('Phân công'))
    
    // Nếu là dòng phụ (hoặc đang edit dòng phụ)
    if (isSubRow) {
      const mode = initialData?.subMode || 'kehoach'
      if (mode === 'thucte') {
        const thucteGroup = FIELD_GROUPS.find(g => g.title.includes('Thực tế'))
        return { material: materialGroup, main: [thucteGroup, phancong].filter(Boolean) }
      }
      const kehoachGroup = FIELD_GROUPS.find(g => g.title.includes('Kế hoạch'))
      return { material: materialGroup, main: [kehoachGroup, phancong].filter(Boolean) }
    }

    // Nếu là dòng chính
    return { material: materialGroup, main: [] }
  }, [projects, initialData?.projectId, initialData?.id, initialData?.parentId])

  // Danh sách NCC đã lọc cho mục Thực tế: Chỉ hiện các NCC đã được chọn ở các dòng Kế hoạch tương ứng
  const actualNccOptions = React.useMemo(() => {
    const parentId = initialData?.parentId || formData?.parentId
    if (!parentId) return nccList
    
    // Lấy tất cả tên NCC từ các dòng Kế hoạch (parentId trùng và có tenNcc)
    const planNccNames = existingRows
      .filter(r => r.parentId === parentId && r.tenNcc)
      .map(r => r.tenNcc)
    
    const uniqueNames = new Set(planNccNames)
    if (uniqueNames.size === 0) return []
    
    return nccList.filter(ncc => uniqueNames.has(ncc.nha_cung_cap))
  }, [nccList, existingRows, initialData?.parentId, formData?.parentId])

  // Render Group helper
  const renderGroup = (group, gIdx) => {
    const colors = COLOR_MAP[group.color]
    const visibleFields = group.fields.filter(f => f.type !== 'hidden')
    if (visibleFields.length === 0) return null

    const isKeHoach = group.title.includes('Kế hoạch')
    const gridCols = isKeHoach ? 'grid-cols-4' : 'grid-cols-3'

    const renderField = (field, fIdx) => {
      if (field.type === 'hidden') return null
      let colClass = ''
      if (field.fullWidth) colClass = 'col-span-full'
      else if (field.span === 2) colClass = 'col-span-2'
      else colClass = 'col-span-1'

      return (
        <div key={`${gIdx}-${field.key}-${fIdx}`} className={colClass}>
          <label className={`block text-[11px] font-black ${colors.label} mb-1.5 font-sans uppercase tracking-wider`}>
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
            nccOptions={group.title.includes('Thực tế') ? actualNccOptions : nccList}
            isActual={group.title.includes('Thực tế')}
          />
          {errors[field.key] && (
            <p className="mt-1 text-[10px] font-bold text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors[field.key]}
            </p>
          )}
        </div>
      )
    }

    if (isKeHoach) {
      const topFields = group.fields.filter(f => f.key === 'tenNcc')
      const infoFields = group.fields.filter(f => ['loaiHd', 'dot', 'khoiLuong', 'tenCvpcuThucHien'].includes(f.key))
      const dateFields = group.fields.filter(f => ['ngayGuiPcu', 'ngayPcuTra', 'ngayKyHd'].includes(f.key))
      const extraDateFields = group.fields.filter(f => ['ngayTamUng', 'ngayVeDuKienBatDau', 'ngayVeDuKienKetThuc'].includes(f.key))
      const noteFields = group.fields.filter(f => f.key === 'ghiChu')

      return (
        <div key={group.title} className="rounded-2xl border border-royal-100 shadow-sm bg-white overflow-hidden transition-all hover:shadow-md">
           <div className="bg-royal-600 px-5 py-2.5 flex items-center gap-2.5">
             <ClipboardList className="w-4 h-4 text-white" />
             <h3 className="text-white font-black text-xs uppercase tracking-[0.15em]">{group.title}</h3>
           </div>
          <div className="p-6 space-y-8">
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-6">
                {topFields.map((f, i) => renderField(f, i))}
              </div>
              <div className="grid grid-cols-4 gap-6">
                {infoFields.map((f, i) => renderField(f, i))}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <div className="mb-5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-royal-500" />
                <h3 className="text-royal-800 font-black text-sm uppercase tracking-widest font-sans flex items-center gap-2">
                  | Lộ trình & Hồ sơ
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {dateFields.map((f, i) => renderField(f, i))}
                {extraDateFields.map((f, i) => renderField(f, i))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="grid grid-cols-4 gap-6">
                {noteFields.map((f, i) => renderField(f, i))}
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div key={group.title} className="rounded-2xl border border-royal-100 shadow-sm bg-white overflow-hidden transition-all hover:shadow-md">
        <div className="bg-royal-600 px-5 py-2.5 flex items-center gap-2.5">
           {group.title.includes('Thông tin vật tư') ? <Package className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-white" />}
           <h3 className="text-white font-black text-xs uppercase tracking-[0.15em]">{group.title}</h3>
        </div>
        <div className="p-6">
          <div className={`grid ${gridCols} gap-6`}>
            {group.fields.map((field, fIdx) => renderField(field, fIdx))}
          </div>
        </div>
      </div>
    )

  }

  useEffect(() => {
    if (isOpen) {
      const base = initialData || {}
      
      // Tự động tính số Đợt nếu là thêm mới dòng phụ
      let dotValue = base.dot
      let dotNhapTayValue = base.dotNhapTay

      if (!base.id && base.parentId) {
        const subMode = base.subMode || 'kehoach'
        const existingSubRows = existingRows.filter(r => 
          r.parentId === base.parentId && 
          (subMode === 'thucte' ? r.subMode === 'thucte' : (r.subMode === 'kehoach' || !r.subMode))
        )
        const nextNum = existingSubRows.length + 1
        const formattedNum = nextNum < 10 ? `0${nextNum}` : `${nextNum}`
        
        if (subMode === 'thucte') {
          dotNhapTayValue = formattedNum
        } else {
          dotValue = formattedNum
        }
      }

      setFormData({
        ...base,
        dot: dotValue,
        dotNhapTay: dotNhapTayValue,
        tenChuyenVienKqlvt: currentUser || base.tenChuyenVienKqlvt || ''
      })
      setErrors({})
    }
  }, [isOpen, initialData, currentUser, existingRows])

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape' && isOpen) onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  const handleChange = (key, value) => {
    let finalValue = value;

    // Tự động định dạng số hàng nghìn bằng dấu chấm và xử lý số thập phân cho các ô Khối lượng
    if ((key === 'khoiLuong' || key === 'khoiLuongNhapTay') && typeof value === 'string') {
      // 1. Lưu lại ký tự cuối để biết người dùng vừa gõ gì (dấu phẩy hoặc dấu chấm)
      const lastChar = value.slice(-1);
      const isDecimalIntent = lastChar === ',' || lastChar === '.';
      
      // 2. Loại bỏ các dấu chấm hiện có (có thể là dấu phân cách hàng nghìn cũ)
      let numericalValue = value.replace(/\./g, '');
      
      // Nếu vừa gõ dấu chấm ở cuối -> coi như gõ dấu phẩy (thập phân)
      if (lastChar === '.') {
        numericalValue = numericalValue + ',';
      }

      // 3. Tách phần nguyên và phần thập phân
      const parts = numericalValue.split(',');
      let integerPart = parts[0].replace(/\D/g, ''); 
      let decimalPart = parts.length > 1 ? parts[1].replace(/\D/g, '') : null;

      // 4. Định dạng phần nguyên (hàng nghìn)
      if (integerPart !== '') {
        const formattedInteger = new Intl.NumberFormat('de-DE').format(parseInt(integerPart, 10));
        
        if (decimalPart !== null) {
          // Có phần thập phân
          finalValue = `${formattedInteger},${decimalPart}`;
        } else if (isDecimalIntent) {
          // Vừa gõ dấu ngăn cách
          finalValue = `${formattedInteger},`;
        } else {
          finalValue = formattedInteger;
        }
      } else if (decimalPart !== null || isDecimalIntent) {
        // Trường hợp gõ ",5" hoặc ","
        finalValue = `0,${decimalPart || ''}`;
      } else {
        finalValue = '';
      }
    }
    else if ((key === 'dot' || key === 'dotNhapTay') && typeof value === 'string') {
      // Nếu nhập 1 ký tự từ 1-9 -> tự thêm 0 phía trước
      if (/^[1-9]$/.test(value)) {
        finalValue = '0' + value;
      }
      // Nếu đang là 0x (vd 01) mà nhập thêm 1 số (vd 2) thành 012 -> chuyển thành 12
      else if (/^0[0-9]{2}$/.test(value)) {
        finalValue = value.substring(1);
      }
    }

    // Tự động nhảy số đợt đối với dòng phụ thêm mới (đã được tính ở useEffect, chỉ giữ lại logic NCC)
    if ((key === 'tenNcc' || key === 'tenNccThucTe') && !formData.id && (initialData?.parentId || formData?.parentId)) {
      setFormData(prev => ({ 
        ...prev, 
        [key]: value
      }))
      if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }))
      return
    }

    setFormData(prev => ({ ...prev, [key]: finalValue }))
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
      // Chỉ tự động điền quy cách nếu hiện tại đang trống để không ghi đè dữ liệu nhập tay
      quyCachKyThuat: prev.quyCachKyThuat || item.thong_so_ky_thuat || '',
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

    // Bắt buộc nhập Tên NCC và Loại hợp đồng ở mục Nhập kế hoạch (dòng phụ)
    if (isSubRow) {
      if (formData.subMode === 'kehoach' || !formData.subMode) {
        if (!formData.tenNcc) newErrors.tenNcc = 'Bắt buộc'
        if (!formData.loaiHd) newErrors.loaiHd = 'Bắt buộc'
        if (!formData.khoiLuong) newErrors.khoiLuong = 'Bắt buộc'
      } else if (formData.subMode === 'thucte') {
        const kl = formData.khoiLuongNhapTay?.toString().trim()
        if (kl && kl !== '') {
          if (!formData.tenNccThucTe) newErrors.tenNccThucTe = 'Vui lòng nhập Tên NCC khi có Khối lượng'
          if (!formData.ngayVeThucTe) newErrors.ngayVeThucTe = 'Vui lòng nhập Ngày về TT khi có Khối lượng'
        }
      }
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

  const [showConfirm, setShowConfirm] = useState(false)

  const handleSave = () => {
    if (!validate()) return

    // Kiểm tra nếu là dòng chính và thông tin vật tư thay đổi
    const isMainRow = !initialData?.parentId
    const isEdit = !!initialData?.id
    const maVattuChanged = isEdit && initialData?.maVattu && formData.maVattu !== initialData.maVattu
    const tenVattuChanged = isEdit && initialData?.tenVattu && formData.tenVattu !== initialData.tenVattu
    
    if (isMainRow && isEdit && (maVattuChanged || tenVattuChanged)) {
      setShowConfirm(true)
      return
    }

    onSave(formData)
  }

  const confirmSave = () => {
    setShowConfirm(false)
    onSave(formData)
  }

  if (!isOpen) return null

  const isEdit = !!initialData?.id

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-backdrop bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden border border-royal-200">

        {/* Header */}
        <div className="bg-royal-600 px-8 py-5 flex items-center justify-between shrink-0 shadow-lg z-10">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/20">
              <ClipboardList className="w-7 h-7 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-white font-black text-xl uppercase tracking-wider flex items-center gap-3">
                {initialData?.subMode === 'thucte' ? '✅ Nhập Thực tế' : initialData?.parentId ? 'Nhập Kế hoạch' : 'Chi tiết công việc'}
              </h2>
              <p className="text-royal-200 text-[11px] font-medium mt-0.5 tracking-wide italic">Điền đầy đủ thông tin, các trường * là bắt buộc</p>
            </div>


            {/* Thêm nút Kế hoạch / Thực tế nếu là dòng chính */}
            {!initialData?.parentId && initialData?.id && (
              <div className="flex items-center gap-2 mr-4">
                <button
                  onClick={() => onAddSubRow(initialData, 'thucte')}
                  className="flex items-center gap-2 px-3 h-9 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm Thực tế
                </button>
              </div>
            )}

            {/* Thông tin dự án đã chọn — Thiết kế lại sạch sẽ & chuyên nghiệp hơn */}
            {projectDisplayName && (
              <div 
                className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl py-1.5 px-3 border border-white/20 shadow-xl group/badge animate-in fade-in slide-in-from-top-2 duration-700 h-12"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 text-white font-black text-[11px] shadow-lg relative overflow-hidden border border-white/30"
                  style={{ backgroundColor: badgeColor }}
                >
                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 -translate-x-full group-hover/badge:translate-x-full transition-transform duration-1000" />
                  
                  {badgeVietTat ? (
                    <span className="leading-none uppercase text-center w-full px-1 break-words font-roboto">{badgeVietTat}</span>
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
        <div className="flex-1 overflow-y-auto p-8">
          {(!initialData?.parentId) ? (
            /* Layout cho dòng chính: 1 cột duy nhất */
            <div className="space-y-6">
              {renderGroup(dynamicFieldGroups.material, 0)}
            </div>
          ) : (
            /* Layout cho dòng phụ: Một cột xếp chồng theo yêu cầu người dùng */
            <div className="space-y-8 max-w-4xl mx-auto">
               {/* Phần 1: Thông tin vật tư (Ưu tiên nằm trên) */}
               {renderGroup({
                 ...dynamicFieldGroups.material,
                 fields: dynamicFieldGroups.material.fields.map(f => ({
                   ...f,
                   readOnly: true // Người dùng không được sửa thông tin vật tư ở view Nhập kế hoạch/Thực tế
                 }))
               }, 0)}

               {/* Phần 2: Thông tin Kế hoạch/Thực tế (Nằm dưới) */}
               <div className="space-y-8">
                 {dynamicFieldGroups.main.map((group, gIdx) => renderGroup(group, gIdx + 1))}
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-royal-100 bg-royal-50 flex items-center justify-between">
          <div>
            {isEdit && (
              <button
                onClick={() => onDelete(initialData.id)}
                className="flex items-center gap-2 px-5 h-10 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold text-sm hover:bg-rose-100 transition-all active:scale-95 shadow-sm font-roboto"
              >
                <Trash2 className="w-4 h-4" />
                Xóa dòng này
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 h-10 border border-slate-300 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-100 transition-all font-roboto"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 h-10 bg-gradient-to-r from-royal-600 to-royal-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-royal-600/30 hover:shadow-royal-600/50 transition-all active:scale-95 font-roboto"
            >
              <Save className="w-4 h-4" />
              {isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
            </button>
          </div>
        </div>

        {/* Confirmation Overlay */}
        {showConfirm && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-md overflow-hidden border border-amber-200 animate-in zoom-in-95 duration-300">
              <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-black text-amber-950 uppercase tracking-tight text-sm">Xác nhận thay đổi vật tư</h3>
                  <p className="text-[10px] text-amber-700 font-bold">Dành cho dòng chính</p>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  Bạn đang thay đổi thông tin <span className="font-black text-amber-600 uppercase">Vật tư</span> của dòng chính. Điều này có thể ảnh hưởng đến các dữ liệu liên quan.
                </p>
                
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Cũ</span>
                      <div className="text-[11px] font-bold text-slate-400 line-through truncate">{initialData.maVattu}</div>
                      <div className="text-[11px] font-bold text-slate-400 line-through truncate">{initialData.tenVattu}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-black text-amber-600 tracking-widest">Mới</span>
                      <div className="text-[11px] font-black text-slate-800 truncate">{formData.maVattu}</div>
                      <div className="text-[11px] font-black text-slate-800 truncate">{formData.tenVattu}</div>
                    </div>
                  </div>
                </div>
                
                <p className="text-[12px] text-slate-500 italic text-center">Bạn có chắc chắn muốn cập nhật không?</p>
              </div>
              
              <div className="p-4 bg-slate-50 flex items-center gap-3">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 h-11 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all text-sm font-roboto"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={confirmSave}
                  className="flex-[1.5] h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 font-roboto"
                >
                  <Save className="w-4 h-4" />
                  Xác nhận lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
