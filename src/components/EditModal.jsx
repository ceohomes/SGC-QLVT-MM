import React, { useState, useEffect } from 'react'
import { X, Save, AlertCircle, Calendar, Package } from 'lucide-react'
import { NHOM_VAT_TU, LOAI_HOP_DONG } from '../constants'
import { todayStr, isValidDate } from '../utils'

const FIELD_GROUPS = [
  {
    title: '📦 Thông tin Vật tư',
    color: 'navy',
    fields: [
      { key: 'maVattu', label: 'Mã Vật tư', type: 'text', placeholder: 'VD: VT001' },
      { key: 'tenVattu', label: 'Tên vật tư', type: 'text', placeholder: 'Nhập tên vật tư...', fullWidth: true },
      { key: 'dvt', label: 'Đơn vị tính', type: 'text', placeholder: 'VD: Cái, Kg, m...' },
      { key: 'soLuongGiaoThuc', label: 'Số Lượng Giao thực NCC', type: 'text', placeholder: 'Nhập số lượng...' },
      { key: 'khoiLuong', label: 'Khối lượng', type: 'text', placeholder: 'Nhập khối lượng...' },
      { key: 'nhom', label: 'Nhóm', type: 'select', options: NHOM_VAT_TU },
      { key: 'quyCachKyThuat', label: 'Quy cách kỹ thuật', type: 'textarea', fullWidth: true, placeholder: 'Mô tả quy cách kỹ thuật...' },
    ]
  },
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
      { key: 'ngayVeDuKienBatDau', label: 'Ngày về Dự kiến bắt đầu *', type: 'date-text', placeholder: 'dd/mm/yyyy', required: true },
      { key: 'ngayVeDuKienKetThuc', label: 'Ngày về Dự kiến kết thúc *', type: 'date-text', placeholder: 'dd/mm/yyyy', required: true },
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

const COLOR_MAP = {
  navy: { header: 'bg-royal-600', border: 'border-royal-200', label: 'text-royal-700' },
  navy2: { header: 'bg-royal-500', border: 'border-royal-200', label: 'text-royal-700' },
  indigo: { header: 'bg-indigo-600', border: 'border-indigo-200', label: 'text-indigo-700' },
  blue: { header: 'bg-royal-500', border: 'border-royal-200', label: 'text-royal-700' },
  emerald: { header: 'bg-emerald-600', border: 'border-emerald-200', label: 'text-emerald-700' },
  teal: { header: 'bg-teal-600', border: 'border-teal-200', label: 'text-teal-700' },
  royal: { header: 'bg-royal-600', border: 'border-royal-200', label: 'text-royal-700' },
}

function InputField({ field, value, onChange, error }) {
  const baseInput = `w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all ${
    error ? 'border-rose-400 bg-rose-50 focus:ring-2 focus:ring-rose-200' : 'border-royal-200 focus:border-royal-400 focus:ring-2 focus:ring-royal-100'
  }`

  if (field.type === 'select') {
    return (
      <select
        value={value || ''}
        onChange={e => onChange(field.key, e.target.value)}
        className={baseInput}
      >
        <option value="">-- Chọn --</option>
        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        value={value || ''}
        onChange={e => onChange(field.key, e.target.value)}
        placeholder={field.placeholder}
        rows={3}
        className={`${baseInput} resize-none`}
      />
    )
  }

  if (field.type === 'date-text') {
    return (
      <div className="relative">
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(field.key, e.target.value)}
          placeholder={field.placeholder || 'dd/mm/yyyy'}
          className={`${baseInput} pr-9`}
          maxLength={10}
        />
        <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    )
  }

  return (
    <input
      type="text"
      value={value || ''}
      onChange={e => onChange(field.key, e.target.value)}
      placeholder={field.placeholder}
      className={baseInput}
    />
  )
}

export default function EditModal({ isOpen, initialData, onClose, onSave, currentUser }) {
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {
        tenChuyenVienKqlvt: currentUser || '',
      })
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
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.ngayVeDuKienBatDau || !isValidDate(formData.ngayVeDuKienBatDau)) {
      newErrors.ngayVeDuKienBatDau = 'Bắt buộc nhập (dd/mm/yyyy)'
    }
    if (!formData.ngayVeDuKienKetThuc || !isValidDate(formData.ngayVeDuKienKetThuc)) {
      newErrors.ngayVeDuKienKetThuc = 'Bắt buộc nhập (dd/mm/yyyy)'
    }
    // Validate date formats
    const dateFields = ['ngayGuiPcu', 'ngayPcuTra', 'ngayKyHd', 'ngayTamUng', 'ngayVeThucTe', 'ngayTheoNhuCauBch', 'dotNhapTay']
    dateFields.forEach(f => {
      if (formData[f] && formData[f].trim() && !isValidDate(formData[f])) {
        // Don't block, just warn
      }
    })
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
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-black text-lg">{isEdit ? 'Chỉnh sửa Vật tư' : 'Thêm mới Vật tư'}</h2>
              <p className="text-royal-200 text-xs">Điền đầy đủ thông tin, các trường * là bắt buộc</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body - scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {FIELD_GROUPS.map(group => {
            const colors = COLOR_MAP[group.color]
            return (
              <div key={group.title} className={`rounded-xl border ${colors.border} overflow-hidden`}>
                <div className={`${colors.header} px-4 py-2.5 text-white font-bold text-sm`}>
                  {group.title}
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.fields.map(field => (
                    <div key={field.key} className={field.fullWidth ? 'md:col-span-2 lg:col-span-3' : ''}>
                      <label className={`block text-xs font-bold ${colors.label} mb-1`}>
                        {field.label}
                        {field.required && <span className="text-rose-500 ml-1">*</span>}
                      </label>
                      <InputField
                        field={field}
                        value={formData[field.key]}
                        onChange={handleChange}
                        error={errors[field.key]}
                      />
                      {errors[field.key] && (
                        <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors[field.key]}
                        </p>
                      )}
                    </div>
                  ))}
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
