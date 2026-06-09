import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import api from '../../api/axios'
import { MapPin, Upload, X, Loader, Navigation } from 'lucide-react'
import { PageHeader } from '../../components/common/UI'

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const CATEGORIES = ['Water Supply','Electricity','Drainage','Road Damage','Garbage','Street Light','Public Property','Education','Health','Other']
const PRIORITIES = ['Low','Medium','High','Urgent']

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function NewComplaint() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: '', priority: 'Medium', address: '' })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [lat, setLat] = useState(null)
  const [lng, setLng] = useState(null)
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]) // India center

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (images.length + files.length > 5) return toast.error('Maximum 5 images allowed')

    const valid = files.filter(f => {
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} exceeds 5MB limit`); return false }
      if (!['image/jpeg','image/jpg','image/png','image/webp'].includes(f.type)) {
        toast.error(`${f.name}: only JPG, PNG, WEBP allowed`); return false
      }
      return true
    })

    setImages(prev => [...prev, ...valid])
    valid.forEach(f => {
      const reader = new FileReader()
      reader.onload = (ev) => setPreviews(prev => [...prev, ev.target.result])
      reader.readAsDataURL(f)
    })
  }

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
    setPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported by your browser')
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setLat(latitude)
        setLng(longitude)
        setMapCenter([latitude, longitude])
        setGeoLoading(false)
        toast.success('Location fetched!')
      },
      (err) => {
        setGeoLoading(false)
        toast.error('Could not get location. Please click on the map.')
      },
      { timeout: 10000 }
    )
  }

  const handleMapClick = useCallback((newLat, newLng) => {
    setLat(newLat)
    setLng(newLng)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.category) return toast.error('Please select a category')
    if (form.description.length < 20) return toast.error('Description must be at least 20 characters')
    setLoading(true)

    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => formData.append(k, v))
      images.forEach(img => formData.append('images', img))
      if (lat) formData.append('latitude', lat)
      if (lng) formData.append('longitude', lng)

      const { data } = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success(`Complaint #${data.complaint.complaintNumber} submitted successfully!`)
      navigate(`/citizen/complaints/${data.complaint._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      <PageHeader title="Submit New Complaint" description="Report a public issue to your Sarpanch" />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="card space-y-4">
          <h3 className="section-title border-b pb-3">Complaint Details</h3>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Complaint Title *</label>
            <input className="input" placeholder="Brief title describing the issue"
              value={form.title} onChange={e => setForm({...form, title: e.target.value})} required maxLength={200} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
              <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Description * <span className="text-gray-400 font-normal">({form.description.length}/2000, min 20)</span>
            </label>
            <textarea className="input resize-none h-32" placeholder="Describe the issue in detail. Include what, where, and how long it has been present..."
              value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              required minLength={20} maxLength={2000} />
          </div>
        </div>

        {/* Images */}
        <div className="card space-y-4">
          <h3 className="section-title border-b pb-3">Attach Images <span className="text-gray-400 font-normal text-sm">(optional, max 5)</span></h3>

          <div className="flex flex-wrap gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {images.length < 5 && (
              <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">Add image</span>
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-400">JPG, PNG, WEBP · Max 5MB each · Up to 5 images</p>
        </div>

        {/* Location */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="section-title">Location <span className="text-gray-400 font-normal text-sm">(optional)</span></h3>
            <button type="button" onClick={getCurrentLocation} disabled={geoLoading}
              className="btn-secondary text-sm flex items-center gap-2 py-2">
              {geoLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              {geoLoading ? 'Fetching...' : 'Use My Location'}
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Specific Address</label>
            <input className="input" placeholder="Near landmark, street, etc."
              value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          </div>

          {lat && lng && (
            <div className="bg-primary-50 rounded-xl px-3 py-2 text-sm text-primary-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              Location set: {lat.toFixed(6)}, {lng.toFixed(6)}
            </div>
          )}

          <div className="h-64 rounded-xl overflow-hidden border border-gray-200">
            <MapContainer center={mapCenter} zoom={lat ? 15 : 5} style={{ height: '100%', width: '100%' }} key={mapCenter.toString()}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
              <MapClickHandler onLocationSelect={handleMapClick} />
              {lat && lng && <Marker position={[lat, lng]} />}
            </MapContainer>
          </div>
          <p className="text-xs text-gray-400">Click on the map to set or adjust the complaint location</p>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary px-8">
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  )
}
