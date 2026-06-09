import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { MapPin, Plus } from 'lucide-react'
import Select from 'react-select'
import api from '../../api/axios'
import { PageHeader, SkeletonCard } from '../../components/common/UI'

const selectStyles = {
  control: (base, state) => ({
    ...base, borderRadius: '0.75rem',
    borderColor: state.isFocused ? '#f97316' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(249,115,22,0.2)' : 'none',
    padding: '2px 4px', fontSize: '14px',
  }),
  option: (base, state) => ({
    ...base, fontSize: '14px',
    backgroundColor: state.isSelected ? '#f97316' : state.isFocused ? '#fff7ed' : 'white',
    color: state.isSelected ? 'white' : '#374151',
  }),
}

export default function AdminLocations() {
  const qc = useQueryClient()
  const [stateForm, setStateForm] = useState({ name: '', code: '' })
  const [distForm, setDistForm] = useState({ name: '', state: null })
  const [villForm, setVillForm] = useState({ name: '', state: null, district: null })
  const [districtOptions, setDistrictOptions] = useState([])
  const [villDistrictOptions, setVillDistrictOptions] = useState([])

  const { data: states } = useQuery({
    queryKey: ['states'],
    queryFn: () => api.get('/locations/states').then(r => r.data.states),
  })

  const stateOptions = states?.map(s => ({ value: s._id, label: s.name })) || []

  const addState = useMutation({
    mutationFn: () => api.post('/locations/states', stateForm),
    onSuccess: () => { toast.success('State added'); setStateForm({ name: '', code: '' }); qc.invalidateQueries(['states']) },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  })

  const addDistrict = useMutation({
    mutationFn: () => api.post('/locations/districts', { name: distForm.name, state: distForm.state?.value }),
    onSuccess: () => { toast.success('District added'); setDistForm({ name: '', state: null }) },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  })

  const addVillage = useMutation({
    mutationFn: () => api.post('/locations/villages', { name: villForm.name, state: villForm.state?.value, district: villForm.district?.value }),
    onSuccess: () => { toast.success('Village added'); setVillForm({ name: '', state: null, district: null }) },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  })

  const loadDistricts = async (stateId, setter) => {
    const { data } = await api.get(`/locations/districts/${stateId}`)
    setter(data.districts.map(d => ({ value: d._id, label: d.name })))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Location Management" description="Add states, districts, and villages" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add State */}
        <div className="card space-y-4">
          <h3 className="section-title flex items-center gap-2"><MapPin className="w-4 h-4 text-saffron-500" /> Add State</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">State Name</label>
            <input className="input text-sm" placeholder="e.g., Kerala" value={stateForm.name}
              onChange={e => setStateForm({...stateForm, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">State Code</label>
            <input className="input text-sm" placeholder="e.g., KL" value={stateForm.code}
              onChange={e => setStateForm({...stateForm, code: e.target.value.toUpperCase()})} maxLength={3} />
          </div>
          <button onClick={() => addState.mutate()} disabled={!stateForm.name || addState.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> {addState.isPending ? 'Adding...' : 'Add State'}
          </button>
        </div>

        {/* Add District */}
        <div className="card space-y-4">
          <h3 className="section-title flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500" /> Add District</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Select State</label>
            <Select options={stateOptions} value={distForm.state}
              onChange={opt => { setDistForm({...distForm, state: opt}); loadDistricts(opt.value, setDistrictOptions) }}
              styles={selectStyles} placeholder="Select state..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">District Name</label>
            <input className="input text-sm" placeholder="e.g., Thrissur" value={distForm.name}
              onChange={e => setDistForm({...distForm, name: e.target.value})} />
          </div>
          <button onClick={() => addDistrict.mutate()} disabled={!distForm.name || !distForm.state || addDistrict.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> {addDistrict.isPending ? 'Adding...' : 'Add District'}
          </button>
        </div>

        {/* Add Village */}
        <div className="card space-y-4">
          <h3 className="section-title flex items-center gap-2"><MapPin className="w-4 h-4 text-green-500" /> Add Village</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Select State</label>
            <Select options={stateOptions} value={villForm.state}
              onChange={opt => { setVillForm({...villForm, state: opt, district: null}); loadDistricts(opt.value, setVillDistrictOptions) }}
              styles={selectStyles} placeholder="Select state..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Select District</label>
            <Select options={villDistrictOptions} value={villForm.district} isDisabled={!villForm.state}
              onChange={opt => setVillForm({...villForm, district: opt})}
              styles={selectStyles} placeholder="Select district..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Village / City Name</label>
            <input className="input text-sm" placeholder="e.g., Guruvayur" value={villForm.name}
              onChange={e => setVillForm({...villForm, name: e.target.value})} />
          </div>
          <button onClick={() => addVillage.mutate()} disabled={!villForm.name || !villForm.state || !villForm.district || addVillage.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> {addVillage.isPending ? 'Adding...' : 'Add Village'}
          </button>
        </div>
      </div>

      {/* State list */}
      <div className="card">
        <h3 className="section-title mb-4">Loaded States ({states?.length || 0})</h3>
        <div className="flex flex-wrap gap-2">
          {states?.map(s => (
            <span key={s._id} className="badge bg-saffron-50 text-saffron-700 border border-saffron-200 text-xs">
              {s.code && <span className="font-mono mr-1">[{s.code}]</span>}{s.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
