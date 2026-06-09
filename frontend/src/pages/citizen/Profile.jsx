import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import { User, Camera, Save, Lock, Eye, EyeOff } from 'lucide-react'
import { PageHeader, SkeletonCard } from '../../components/common/UI'

export default function CitizenProfile() {
  const { user, setUser } = useAuthStore()
  const queryClient = useQueryClient()
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', mobile: user?.mobile || '', address: user?.address || '' })
  const [profileFile, setProfileFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [showPw, setShowPw] = useState({})

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB')
    setProfileFile(file)
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('mobile', form.mobile)
      formData.append('address', form.address)
      if (profileFile) formData.append('profilePicture', profileFile)

      const { data } = await api.put('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setUser(data.user)
      setEditMode(false)
      setProfileFile(null)
      setPreview(null)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match')
    if (pwForm.newPassword.length < 6) return toast.error('Minimum 6 characters required')
    setPwLoading(true)
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Password changed successfully')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 animate-fade-in overflow-x-hidden">
      <PageHeader title="My Profile" description="Manage your account information" />

      {/* Profile Card */}
      <div className="card overflow-hidden">
        {/* Avatar + name + edit button row — stacks on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0 self-start">
            <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center overflow-hidden">
              {preview || user?.profilePicture
                ? <img src={preview || user.profilePicture} alt="" className="w-full h-full object-cover" />
                : <span className="text-primary-600 font-bold text-2xl">{user?.name?.[0]?.toUpperCase()}</span>
              }
            </div>
            {editMode && (
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                <Camera className="w-3.5 h-3.5 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>

          {/* Name / email / tags + Edit button */}
          <div className="flex flex-1 flex-col sm:flex-row sm:items-start gap-3 min-w-0">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">{user?.name}</h2>
              <p className="text-gray-500 text-sm truncate">{user?.email}</p>
              <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-gray-400">
                <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium capitalize">{user?.role}</span>
                {user?.village?.name && <span className="bg-gray-100 px-2 py-0.5 rounded-full">{user.village.name}</span>}
                {user?.district?.name && <span className="bg-gray-100 px-2 py-0.5 rounded-full">{user.district.name}</span>}
                {user?.state?.name && <span className="bg-gray-100 px-2 py-0.5 rounded-full">{user.state.name}</span>}
              </div>
            </div>

            {/* Edit / Save button — full width on mobile */}
            <div className="flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={() => editMode ? handleSave() : setEditMode(true)}
                disabled={saving}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 ${editMode ? 'btn-primary' : 'btn-secondary'}`}
              >
                {editMode
                  ? (saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save</>)
                  : <><User className="w-4 h-4" /> Edit Profile</>
                }
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              {editMode
                ? <input className="input w-full" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                : <p className="text-gray-800 py-2.5 px-4 bg-gray-50 rounded-xl text-sm break-words">{user?.name}</p>
              }
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <p className="text-gray-500 py-2.5 px-4 bg-gray-50 rounded-xl text-sm break-words">
                {user?.email} <span className="text-xs">(cannot change)</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
              {editMode
                ? <input className="input w-full" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} placeholder="10-digit mobile" />
                : <p className="text-gray-800 py-2.5 px-4 bg-gray-50 rounded-xl text-sm">{user?.mobile || '—'}</p>
              }
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Member Since</label>
              <p className="text-gray-800 py-2.5 px-4 bg-gray-50 rounded-xl text-sm">
                {new Date(user?.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
            {editMode
              ? <textarea className="input resize-none h-20 w-full" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Your full address" />
              : <p className="text-gray-800 py-2.5 px-4 bg-gray-50 rounded-xl text-sm min-h-[60px] break-words">{user?.address || '—'}</p>
            }
          </div>

          {editMode && (
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-1">
              <button
                onClick={() => { setEditMode(false); setPreview(null); setProfileFile(null) }}
                className="btn-secondary w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary w-full sm:w-auto"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Change Password */}
      <div className="card overflow-hidden">
        <h3 className="section-title flex items-center gap-2 mb-5"><Lock className="w-5 h-5" /> Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {[
            { key: 'currentPassword', label: 'Current Password' },
            { key: 'newPassword', label: 'New Password' },
            { key: 'confirmPassword', label: 'Confirm New Password' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
              <div className="relative">
                <input
                  type={showPw[key] ? 'text' : 'password'}
                  className="input pr-10 w-full"
                  value={pwForm[key]}
                  onChange={e => setPwForm({...pwForm, [key]: e.target.value})}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPw(s => ({...s, [key]: !s[key]}))}
                >
                  {showPw[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          <button type="submit" disabled={pwLoading} className="btn-primary w-full sm:w-auto">
            {pwLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
