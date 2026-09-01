import { useState } from 'react'
import { getRecommendation } from '../api/client'

function RecommendPage() {
  const [form, setForm] = useState({
    n: '', p: '', k: '', temperature: '', humidity: '', ph: '', rainfall: ''
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
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, parseFloat(v)])
      )
      const data = await getRecommendation(payload)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: 'n', label: 'Nitrogen (N)', placeholder: 'e.g. 90' },
    { name: 'p', label: 'Phosphorus (P)', placeholder: 'e.g. 42' },
    { name: 'k', label: 'Potassium (K)', placeholder: 'e.g. 43' },
    { name: 'temperature', label: 'Temperature (°C)', placeholder: 'e.g. 20.9' },
    { name: 'humidity', label: 'Humidity (%)', placeholder: 'e.g. 82' },
    { name: 'ph', label: 'Soil pH', placeholder: 'e.g. 6.5' },
    { name: 'rainfall', label: 'Rainfall (mm)', placeholder: 'e.g. 200' },
  ]

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Soil & Climate Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-slate-600 mb-1">{f.label}</label>
              <input
                type="number"
                step="any"
                name={f.name}
                value={form[f.name]}
                onChange={handleChange}
                placeholder={f.placeholder}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 text-white py-3 rounded-lg font-medium hover:bg-emerald-800 transition disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Get Recommendation'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Recommendation</h2>
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}
        {!result && !error && (
          <p className="text-slate-400">Fill in the form and submit to see a recommendation.</p>
        )}
        {result && (
          <div className="space-y-4">
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="text-sm text-emerald-700">Recommended Crop</p>
              <p className="text-3xl font-bold text-emerald-900 capitalize">{result.predicted_crop}</p>
              <p className="text-sm text-emerald-600 mt-1">{(result.confidence * 100).toFixed(1)}% confidence</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Key Factors</p>
              <div className="space-y-2">
                {result.top_features.map((f) => (
                  <div key={f.feature} className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 w-24 capitalize">{f.feature}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full ${f.shap_value > 0 ? 'bg-emerald-500' : 'bg-red-400'}`}
                        style={{ width: `${Math.min(Math.abs(f.shap_value) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm text-slate-500 italic">{result.explanation_text}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecommendPage