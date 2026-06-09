import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import toast from 'react-hot-toast'
import { ArrowLeft, MapPin, ExternalLink, Send, Upload, X, Clock, Image } from 'lucide-react'
import api from '../../api/axios'
import { StatusBadge, PriorityBadge, SkeletonCard } from '../../components/common/UI'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const NEXT_STATUSES = ['Pending','In Progress','Resolved','Rejected','Escalated']

export default function SarpanchComplaintDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [updateForm, setUpdateForm] = useState({ status: '', remark: '', resolutionNote: '' })
  const [resImages, setResImages] = useState([])
  const [resPreviews, setResPreviews] = useState([])

  const { data: complaint, isLoading } = useQuery({
    queryKey: ['sarpanch-complaint', id],
    queryFn: () => api.get(`/complaints/${id}`).then(r => r.data.complaint),
  })

  const updateMutation = useMutation({
    mutationFn: async (formData) => api.patch(`/complaints/${id}/status`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: (res) => {
      toast.success('Complaint updated successfully')
      queryClient.invalidateQueries(['sarpanch-complaint', id])
      queryClient.invalidateQueries(['sarpanch-recent'])
      queryClient.invalidateQueries(['sarpanch-stats'])
      setUpdateForm({ status: '', remark: '', resolutionNote: '' })
      setResImages([])
      setResPreviews([])
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  })

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const valid = files.filter(f => f.size <= 5 * 1024 * 1024)
    if (valid.length < files.length) toast.error('Some files exceed 5MB and were skipped')
    setResImages(prev => [...prev, ...valid].slice(0, 5))
    valid.forEach(f => {
      const reader = new FileReader()
      reader.onload = ev => setResPreviews(prev => [...prev, ev.target.result].slice(0, 5))
      reader.readAsDataURL(f)
    })
  }

  const handleUpdate = () => {
    if (!updateForm.status) return toast.error('Please select a status')
    if (updateForm.status === 'Rejected' && !updateForm.remark) return toast.error('Please provide a rejection reason')
    const formData = new FormData()
    formData.append('status', updateForm.status)
    if (updateForm.remark) formData.append('remark', updateForm.remark)
    if (updateForm.resolutionNote) formData.append('resolutionNote', updateForm.resolutionNote)
    resImages.forEach(img => formData.append('resolutionImages', img))
    updateMutation.mutate(formData)
  }

  if (isLoading) return <div className="space-y-4">{Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
  if (!complaint) return <div className="card text-center text-red-500 py-10">Complaint not found</div>

  const c = complaint

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/sarpanch/complaints" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="page-title flex-1 truncate">Complaint Detail</h1>
      </div>

      {/* Info Card */}
      <div className="card">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">#{c.complaintNumber}</span>
            <h2 className="text-xl font-bold text-gray-900 mt-2">{c.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={c.priority} />
            <StatusBadge status={c.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
          <div><span className="text-gray-400 block text-xs">Citizen</span><span className="font-medium">{c.citizen?.name}</span></div>
          <div><span className="text-gray-400 block text-xs">Mobile</span><span className="font-medium">{c.citizen?.mobile || '—'}</span></div>
          <div><span className="text-gray-400 block text-xs">Category</span><span className="font-medium">{c.category}</span></div>
          <div><span className="text-gray-400 block text-xs">Submitted</span><span className="font-medium">{new Date(c.createdAt).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</span></div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-semibold text-gray-600 mb-1">Description</p>
          <p className="text-gray-700 leading-relaxed text-sm">{c.description}</p>
        </div>

        {c.address && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4 flex-shrink-0" /><span>{c.address}</span>
          </div>
        )}
      </div>

      {/* Complaint Images */}
      {c.images?.length > 0 && (
        <div className="card">
          <h3 className="section-title mb-3 flex items-center gap-2"><Image className="w-4 h-4" /> Complaint Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {c.images.map((img, i) => (
              <a key={i} href={img.url} target="_blank" rel="noopener noreferrer"
                className="aspect-square rounded-xl overflow-hidden border border-gray-100 hover:opacity-90 transition-opacity">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Map */}
      {c.latitude && c.longitude && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-title flex items-center gap-2"><MapPin className="w-4 h-4" /> Complaint Location</h3>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}`}
              target="_blank" rel="noopener noreferrer"
              className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:underline">
              <ExternalLink className="w-3.5 h-3.5" /> Navigate
            </a>
          </div>
          <div className="h-56 rounded-xl overflow-hidden">
            <MapContainer center={[c.latitude, c.longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
              <Marker position={[c.latitude, c.longitude]}>
                <Popup><strong>{c.title}</strong><br />{c.citizen?.name}<br />{c.category}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}

      {/* Update Status */}
      {!['Resolved', 'Rejected'].includes(c.status) && (
        <div className="card border-2 border-blue-100">
          <h3 className="section-title mb-4 flex items-center gap-2"><Send className="w-4 h-4" /> Update Complaint Status</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Status *</label>
              <select className="input" value={updateForm.status} onChange={e => setUpdateForm({...updateForm, status: e.target.value})}>
                <option value="">Select new status...</option>
                {NEXT_STATUSES.filter(s => s !== c.status).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Remark {updateForm.status === 'Rejected' ? '*' : ''}
              </label>
              <textarea className="input resize-none h-24" placeholder="Add your remark or reason..."
                value={updateForm.remark} onChange={e => setUpdateForm({...updateForm, remark: e.target.value})} />
            </div>

            {updateForm.status === 'Resolved' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Resolution Note</label>
                <textarea className="input resize-none h-20" placeholder="Describe how the issue was resolved..."
                  value={updateForm.resolutionNote} onChange={e => setUpdateForm({...updateForm, resolutionNote: e.target.value})} />
              </div>
            )}

            {updateForm.status === 'Resolved' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Proof Images (optional)</label>
                <div className="flex flex-wrap gap-3">
                  {resPreviews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => {
                        setResImages(p => p.filter((_, j) => j !== i))
                        setResPreviews(p => p.filter((_, j) => j !== i))
                      }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {resImages.length < 5 && (
                    <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-[10px] text-gray-400 mt-1">Add</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                    </label>
                  )}
                </div>
              </div>
            )}

            <button onClick={handleUpdate} disabled={updateMutation.isPending || !updateForm.status}
              className="btn-primary flex items-center gap-2">
              {updateMutation.isPending ? 'Updating...' : <><Send className="w-4 h-4" /> Update Status</>}
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="card">
        <h3 className="section-title mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Activity Timeline</h3>
        <div className="space-y-0">
          {c.updates?.slice().reverse().map((update, i) => (
            <div key={i} className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0 mt-1.5 z-10" />
                {i < c.updates.length - 1 && <div className="w-0.5 bg-gray-200 flex-1 my-1" />}
              </div>
              <div className="pb-5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={update.status} />
                  <span className="text-xs text-gray-400">{new Date(update.createdAt).toLocaleString('en-IN')}</span>
                  {update.updatedBy && <span className="text-xs text-gray-500">by {update.updatedBy.name} ({update.updatedBy.role})</span>}
                </div>
                {update.remark && <p className="text-sm text-gray-600 mt-1 bg-gray-50 rounded-lg px-3 py-2">{update.remark}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
