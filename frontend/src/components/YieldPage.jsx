import { useState } from 'react'
import { getYieldPrediction } from '../api/client'

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Orissa', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
]
const CROPS = ['rice', 'maize', 'chickpea', 'cotton']
const SEASONS = ['Kharif', 'Rabi']

function YieldPage() {
  const [form, setForm] = useState({
    state_name: 'Chhattisgarh',
    crop: 'rice',
    season: 'Kharif',
    area_ha: '',
    latitude: '',
    longitude: ''
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const payload = {
        ...form,
        area_ha: parseFloat(form.area_ha),
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude)
      }
      const data = await getYieldPrediction(payload)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Farm Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">State</label>
            <select
              name="state_name"
              value={form.state_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Crop</label>
            <select
              name="crop"
              value={form.crop}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CROPS.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Season</label>
            <select
              name="season"
              value={form.season}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Area (hectares)</label>
            <input
              type="number"
              step="any"
              name="area_ha"
              value={form.area_ha}
              onChange={handleChange}
              placeholder="e.g. 5000"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="e.g. 21.19"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="e.g. 81.40"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 text-white py-3 rounded-lg font-medium hover:bg-emerald-800 transition disabled:opacity-50"
          >
            {loading ? 'Fetching live weather & predicting...' : 'Predict Yield'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Prediction</h2>
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}
        {!result && !error && (
          <p className="text-slate-400">Fill in the form and submit to see a yield prediction.</p>
        )}
        {result && (
          <div className="space-y-4">
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="text-sm text-emerald-700">Predicted Yield</p>
              <p className="text-3xl font-bold text-emerald-900">
                {result.predicted_yield_kg_per_ha.toFixed(0)} <span className="text-lg font-normal">kg/ha</span>
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Key Factors</p>
              <div className="space-y-2">
                {result.top_features.map((f) => (
                  <div key={f.feature} className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 w-28 truncate">{f.feature.replace(/state_name_|crop_|season_/g, '')}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full ${f.shap_value > 0 ? 'bg-emerald-500' : 'bg-red-400'}`}
                        style={{ width: `${Math.min((Math.abs(f.shap_value) / 700) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm text-slate-500 italic">{result.explanation_text}</p>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm font-medium text-slate-600 mb-2">
                Weather used ({result.weather_used.data_year})
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                <div>Temperature: {result.weather_used.temperature_c}°C</div>
                <div>Humidity: {result.weather_used.humidity_pct}%</div>
                <div>Rainfall: {result.weather_used.rainfall_mm.toFixed(0)}mm</div>
                <div>Wind: {result.weather_used.wind_speed_m_s} m/s</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default YieldPage