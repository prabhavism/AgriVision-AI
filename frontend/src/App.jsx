import { useState } from 'react'
import RecommendPage from './components/RecommendPage'
import YieldPage from './components/YieldPage'

function App() {
  const [activeTab, setActiveTab] = useState('recommend')

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-emerald-700 text-white py-6 px-4 shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold">AgriVision AI</h1>
          <p className="text-emerald-100 mt-1">Crop recommendation and yield prediction</p>
        </div>
      </header>

      <nav className="max-w-4xl mx-auto px-4 mt-6">
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('recommend')}
            className={`px-5 py-3 font-medium rounded-t-lg transition ${
              activeTab === 'recommend'
                ? 'bg-white text-emerald-700 border-b-2 border-emerald-700'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Crop Recommendation
          </button>
          <button
            onClick={() => setActiveTab('yield')}
            className={`px-5 py-3 font-medium rounded-t-lg transition ${
              activeTab === 'yield'
                ? 'bg-white text-emerald-700 border-b-2 border-emerald-700'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Yield Prediction
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === 'recommend' ? <RecommendPage /> : <YieldPage />}
      </main>
    </div>
  )
}

export default App