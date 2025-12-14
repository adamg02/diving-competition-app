import { useState } from 'react'
import { storage, clearAllData } from './utils/storage'
import { populateSampleData, logAllData } from './utils/sampleData'

function App() {
  const [events, setEvents] = useState(() => storage.events.getAll())
  const [competitors, setCompetitors] = useState(() => storage.competitors.getAll())
  const [dives, setDives] = useState(() => storage.dives.getAll())
  const [scores, setScores] = useState(() => storage.scores.getAll())

  const refreshData = () => {
    setEvents(storage.events.getAll())
    setCompetitors(storage.competitors.getAll())
    setDives(storage.dives.getAll())
    setScores(storage.scores.getAll())
  }

  const handlePopulateSampleData = () => {
    populateSampleData()
    refreshData()
  }

  const handleClearAllData = () => {
    clearAllData()
    refreshData()
  }

  const handleLogData = () => {
    logAllData()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">
          Diving Competition App
        </h1>
        <p className="text-center text-gray-600 mb-8">
          React + TypeScript + Vite + Tailwind CSS
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Data Storage Demo
          </h2>
          <p className="text-gray-600 mb-4">
            This demo shows the localStorage persistence layer working with the data models.
          </p>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={handlePopulateSampleData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Populate Sample Data
            </button>
            <button
              onClick={handleClearAllData}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Clear All Data
            </button>
            <button
              onClick={handleLogData}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Log Data to Console
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Events</h3>
              <p className="text-3xl font-bold text-blue-600">{events.length}</p>
            </div>
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Competitors</h3>
              <p className="text-3xl font-bold text-green-600">{competitors.length}</p>
            </div>
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Dives</h3>
              <p className="text-3xl font-bold text-purple-600">{dives.length}</p>
            </div>
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Scores</h3>
              <p className="text-3xl font-bold text-orange-600">{scores.length}</p>
            </div>
          </div>

          {events.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-700 mb-3">Event Details</h3>
              {events.map(event => (
                <div key={event.id} className="bg-gray-50 rounded-md p-4 mb-3">
                  <h4 className="font-semibold text-lg text-gray-800">{event.name}</h4>
                  <p className="text-gray-600 text-sm">
                    {event.date} • {event.location}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Competitors: {event.competitorIds.length}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Project Status
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>React + TypeScript + Vite setup complete</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Tailwind CSS v4 configured for responsive design</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Data models created (Event, Competitor, Dive, Score)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>localStorage persistence layer implemented</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
