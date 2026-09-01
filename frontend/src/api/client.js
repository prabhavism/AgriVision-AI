import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000'

export async function getRecommendation(data) {
  const response = await axios.post(`${API_BASE}/recommend`, data)
  return response.data
}

export async function getYieldPrediction(data) {
  const response = await axios.post(`${API_BASE}/predict-yield`, data)
  return response.data
}