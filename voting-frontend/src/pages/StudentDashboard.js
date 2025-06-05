"use client"
import "./StudentDashboard.css"
import { useState, useEffect, useRef } from "react"
import {
  Bell,
  Scale,
  Home,
  User,
  CheckCircle,
  BarChart3,
  Newspaper,
  Users,
  UserCheck,
  Clock,
  Info,
  AlertCircle,
} from "lucide-react"
import api from "../api"
import { useAuth } from "../AuthContext"

export default function StudentDashboard() {
  const { user, setUser } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedCandidates, setSelectedCandidates] = useState({
    president: "",
    vp: "",
    secretary: "",
    treasurer: "",
  })
  const [showModal, setShowModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [candidatePlatforms, setCandidatePlatforms] = useState({})
  const [candidates, setCandidates] = useState([])
  const [results, setResults] = useState([])
  const [news, setNews] = useState([])
  const [votingHistory, setVotingHistory] = useState([])
  const [electionStats, setElectionStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const chartRef = useRef(null)
  const presidentChartRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const candidateResponse = await api.get("/api/election/candidates")
        setCandidates(candidateResponse.data)
        const resultResponse = await api.get("/api/vote/results")
        setResults(resultResponse.data)
        const newsResponse = await api.get("/api/election/news")
        setNews(newsResponse.data)
        const historyResponse = await api.get("/api/auth/voting-history")
        setVotingHistory(historyResponse.data)
        const statsResponse = await api.get("/api/election/stats")
        setElectionStats(statsResponse.data)
      } catch (err) {
        setError("Failed to load data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (user) fetchData()
  }, [user])

  useEffect(() => {
    if (chartRef.current && results.length) {
      const ctx = chartRef.current.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        results.forEach((candidate, index) => {
          const x = 50 + index * 150
          ctx.fillStyle = candidate.color || "#3B82F6"
          ctx.fillRect(x, 50, 100, candidate.votes / 10)
          ctx.fillStyle = "#374151"
          ctx.font = "14px Inter"
          ctx.fillText(candidate.name, x, 170)
        })
      }
    }

    if (presidentChartRef.current && results.length) {
      const ctx = presidentChartRef.current.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        const presidentResults = results.filter((r) => r.position === "president")
        presidentResults.forEach((candidate, index) => {
          const x = 50 + index * 150
          ctx.fillStyle = candidate.color || "#3B82F6"
          ctx.fillRect(x, 50, 100, candidate.votes / 10)
          ctx.fillStyle = "#374151"
          ctx.font = "12px Inter"
          ctx.fillText(`${candidate.name} (${candidate.percentage}%)`, x, 170)
        })
      }
    }
  }, [results, activeTab])

  const handleCandidateSelect = (position, candidateId) => {
    setSelectedCandidates((prev) => ({
      ...prev,
      [position]: candidateId,
    }))
  }

  const handleSubmitVote = async () => {
    try {
      const electionId = electionStats?.electionId
      for (const [position, candidateId] of Object.entries(selectedCandidates)) {
        if (candidateId) {
          await api.post("/api/vote/submit", {
            candidateId,
            electionId,
          })
        }
      }
      setShowModal(true)
    } catch (err) {
      setError("Failed to submit vote. Please try again.")
    }
  }

  const confirmVote = async () => {
    try {
      const electionId = electionStats?.electionId
      for (const [position, candidateId] of Object.entries(selectedCandidates)) {
        if (candidateId) {
          await api.post("/api/vote/confirm", {
            candidateId,
            electionId,
          })
        }
      }
      setShowModal(false)
      setShowSuccess(true)
    } catch (err) {
      setError("Failed to confirm vote. Please try again.")
    }
  }

  const toggleCandidateInfo = (candidateId) => {
    setCandidatePlatforms((prev) => ({
      ...prev,
      [candidateId]: !prev[candidateId],
    }))
  }

  const getCandidateName = (id) => {
    const candidate = candidates.find((c) => c._id === id)
    return candidate ? candidate.name : "Not selected"
  }

  const Header = () => (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Scale className="h-8 w-8" />
          <h1 className="text-xl font-bold">College Election Portal</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="p-1 rounded-full hover:bg-blue-500 focus:outline-none">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold">
              {user?.name ? user.name.split(" ").map(n => n[0]).join("") : "JS"}
            </div>
            <span className="hidden md:inline">{user?.name || "Loading..."}</span>
          </div>
        </div>
      </div>
    </header>
  )

  const Sidebar = () => {
    const navItems = [
      { id: "dashboard", icon: Home, label: "Dashboard" },
      { id: "profile", icon: User, label: "Profile" },
      { id: "vote", icon: CheckCircle, label: "Vote" },
      { id: "results", icon: BarChart3, label: "Results" },
      { id: "news", icon: Newspaper, label: "News" },
    ]

    return (
      <aside className="w-16 md:w-64 bg-gray-800 text-white">
        <nav className="p-2 md:p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center p-2 rounded-lg text-left ${
                      activeTab === item.id ? "bg-gray-700" : "hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="h-6 w-6 md:mr-3" />
                    <span className="hidden md:inline">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    )
  }

  const StatsCard = ({ title, value, icon: Icon, color, progress, multiProgress, countdown }) => {
    const colorClasses = {
      blue: {
        border: "border-blue-500",
        bg: "bg-blue-100",
        text: "text-blue-500",
        progress: "bg-blue-600",
        accent: "text-blue-600",
      },
      green: {
        border: "border-green-500",
        bg: "bg-green-100",
        text: "text-green-500",
        progress: "bg-green-600",
        accent: "text-green-600",
      },
      purple: {
        border: "border-purple-500",
        bg: "bg-purple-100",
        text: "text-purple-500",
        progress: "bg-purple-600",
        accent: "text-purple-600",
      },
      amber: {
        border: "border-amber-500",
        bg: "bg-amber-100",
        text: "text-amber-500",
        progress: "bg-amber-600",
        accent: "text-amber-600",
      },
    }

    const colors = colorClasses[color]

    return (
      <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${colors.border}`}>
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${colors.bg} ${colors.text} mr-4`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
          </div>
        </div>
        {progress && (
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{progress.label}</span>
              <span className={`text-sm font-medium ${colors.accent}`}>{progress.text || `${progress.value}%`}</span>
            </div>
            {multiProgress ? (
              <div className="flex space-x-1 mt-1">
                <span className={`${colors.progress} h-2 rounded-full flex-1`}></span>
                <span className="bg-purple-400 h-2 rounded-full flex-1"></span>
                <span className="bg-purple-300 h-2 rounded-full flex-1"></span>
                <span className="bg-purple-200 h-2 rounded-full flex-1"></span>
              </div>
            ) : (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className={`${colors.progress} h-2 rounded-full`} style={{ width: `${progress.value}%` }}></div>
              </div>
            )}
          </div>
        )}
        {countdown && <div className="text-center mt-1 text-sm font-medium text-gray-600">{countdown}</div>}
      </div>
    )
  }

  const Dashboard = () => (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-gray-600">Welcome back, {user?.name || "User"}! Here's your election overview.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Voters"
              value={electionStats?.totalVoters || "N/A"}
              icon={Users}
              color="blue"
              progress={{ label: "Voter Turnout", value: electionStats?.turnout || 0 }}
            />
            <StatsCard
              title="Votes Cast"
              value={electionStats?.votesCast || "N/A"}
              icon={CheckCircle}
              color="green"
              progress={{ label: "Time Remaining", value: electionStats?.timeRemainingPercent || 0, text: electionStats?.timeRemainingText || "N/A" }}
            />
            <StatsCard
              title="Candidates"
              value={electionStats?.candidateCount || "N/A"}
              icon={UserCheck}
              color="purple"
              progress={{ label: "Positions", value: 100, text: electionStats?.positionCount || "N/A" }}
              multiProgress={true}
            />
            <StatsCard
              title="Election Status"
              value={electionStats?.status || "N/A"}
              icon={Clock}
              color="amber"
              progress={{ label: "End Date", value: 0, text: electionStats?.endDate || "N/A" }}
              countdown={electionStats?.countdown || "N/A"}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Results Overview</h3>
              <div className="h-64">
                <canvas ref={chartRef} className="w-full h-full"></canvas>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Winning Probabilities</h3>
              <div className="space-y-4">
                {results.map((candidate) => (
                  <div key={candidate._id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{candidate.name}</span>
                      <span className="text-sm font-medium text-gray-700">{candidate.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${candidate.color || "bg-blue-600"} h-2 rounded-full`}
                        style={{ width: `${candidate.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Latest Election News</h3>
              <button
                onClick={() => setActiveTab("news")}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {news.slice(0, 3).map((item, index) => (
                <div key={index} className="p-4 border rounded-lg hover:border-blue-300">
                  <div className="flex justify-between">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${item.typeColor}`}>{item.type}</span>
                    <span className="text-xs text-gray-500">{item.date}</span>
                  </div>
                  <h4 className="font-medium text-gray-800 mt-2">{item.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )

  const Profile = () => (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>
            <p className="text-gray-600">Manage your voter information and preferences.</p>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <div className="flex flex-col md:flex-row items-center">
                <div className="h-24 w-24 rounded-full bg-white text-blue-600 flex items-center justify-center text-3xl font-bold mb-4 md:mb-0 md:mr-6">
                  {user?.name ? user.name.split(" ").map(n => n[0]).join("") : "JS"}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{user?.name || "N/A"}</h3>
                  <p className="text-blue-100">Student ID: {user?.studentId || "N/A"}</p>
                  <div className="flex items-center mt-2">
                    <span className="bg-green-500 rounded-full h-3 w-3 mr-2"></span>
                    <span className="text-sm">Verified Voter</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Personal Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={user?.name || ""}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input
                        type="text"
                        value={user?.department || ""}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
                      <input
                        type="text"
                        value={user?.yearOfStudy || ""}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Voting Status</h4>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                    <div className="flex items-center mb-4">
                      <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-4">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800">Eligible to Vote</h5>
                        <p className="text-sm text-gray-600">
                          You are registered and eligible to vote in the current election.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-4">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800">
                          Vote Status: {user?.hasVoted ? "Voted" : "Not Yet Voted"}
                        </h5>
                        <p className="text-sm text-gray-600">
                          {user?.hasVoted
                            ? "You have cast your vote in the current election."
                            : "You have not cast your vote in the current election yet."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <h4 className="text-lg font-medium text-gray-800 mb-4">Preferences</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Email Notifications</span>
                      <input
                        type="checkbox"
                        checked={user?.preferences?.emailNotifications || false}
                        onChange={async () => {
                          try {
                            await api.put("/api/auth/preferences", {
                              ...user.preferences,
                              emailNotifications: !user.preferences?.emailNotifications,
                            })
                            setUser({
                              ...user,
                              preferences: {
                                ...user.preferences,
                                emailNotifications: !user.preferences?.emailNotifications,
                              },
                            })
                          } catch (err) {
                            setError("Failed to update preferences.")
                          }
                        }}
                        className="rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">SMS Alerts</span>
                      <input
                        type="checkbox"
                        checked={user?.preferences?.smsAlerts || false}
                        onChange={async () => {
                          try {
                            await api.put("/api/auth/preferences", {
                              ...user.preferences,
                              smsAlerts: !user.preferences?.smsAlerts,
                            })
                            setUser({
                              ...user,
                              preferences: { ...user.preferences, smsAlerts: !user.preferences?.smsAlerts },
                            })
                          } catch (err) {
                            setError("Failed to update preferences.")
                          }
                        }}
                        className="rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Result Notifications</span>
                      <input
                        type="checkbox"
                        checked={user?.preferences?.resultNotifications || false}
                        onChange={async () => {
                          try {
                            await api.put("/api/auth/preferences", {
                              ...user.preferences,
                              resultNotifications: !user.preferences?.resultNotifications,
                            })
                            setUser({
                              ...user,
                              preferences: {
                                ...user.preferences,
                                resultNotifications: !user.preferences?.resultNotifications,
                              },
                            })
                          } catch (err) {
                            setError("Failed to update preferences.")
                          }
                        }}
                        className="rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t pt-6">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Voting History</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Election
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {votingHistory.map((record, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{record.election}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.statusColor}`}
                            >
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={async () => {
                    try {
                      await api.put("/api/auth/profile", user)
                    } catch (err) {
                      setError("Failed to update profile.")
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )

  // eslint-disable-next-line no-unused-vars
  const CandidateCard = ({ candidate, position }) => (
    <div className="border rounded-lg overflow-hidden hover:border-blue-500">
      <div className="p-4">
        <div className="flex items-center mb-4">
          <div
            className={`h-12 w-12 rounded-full ${candidate.color || "bg-blue-100 text-blue-600"} flex items-center justify-center font-bold text-lg mr-4`}
          >
            {candidate.initials || candidate.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <h4 className="font-medium text-gray-800">{candidate.name}</h4>
            <p className="text-sm text-gray-500">{candidate.department}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">"{candidate.slogan}"</p>
        <div className="flex justify-between items-center">
          <button
            onClick={() => toggleCandidateInfo(candidate._id)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View Platform
          </button>
          <div className="flex items-center">
            <input
              type="radio"
              id={`vote-${candidate._id}`}
              name={position}
              checked={selectedCandidates[position] === candidate._id}
              onChange={() => handleCandidateSelect(position, candidate._id)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor={`vote-${candidate._id}`} className="ml-2 text-sm text-gray-700">
              Select
            </label>
          </div>
        </div>
        {candidatePlatforms[candidate._id] && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
            <ul className="list-disc pl-5 space-y-1">
              {candidate.platform.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )

  const Vote = () => (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Cast Your Vote</h2>
            <p className="text-gray-600">Select your preferred candidates for each position.</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-4">
                <Info className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Important Information</h3>
                <p className="text-sm text-gray-600">You can only vote once. Your vote is confidential and secure.</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Voting closes in {electionStats?.countdown || "N/A"}</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Make sure to cast your vote before {electionStats?.endDate || "N/A"}.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">Student Body President</h3>
              <p className="text-blue-100 text-sm">Select one candidate</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {candidates
                  .filter((c) => c.position === "president")
                  .map((candidate) => (
                    <CandidateCard key={candidate._id} candidate={candidate} position="president" />
                  ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmitVote}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Submit Your Vote
            </button>
          </div>
        </>
      )}
    </div>
  )

  const Results = () => (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Election Results</h2>
            <p className="text-gray-600">Current standings and statistics for the ongoing election.</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Election in Progress</h3>
                  <p className="text-sm text-gray-600">Results are being updated in real-time as votes are counted.</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Votes Cast</p>
                  <p className="text-xl font-bold text-gray-800">{electionStats?.votesCast || "N/A"}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Participation</p>
                  <p className="text-xl font-bold text-blue-600">{electionStats?.turnout || "N/A"}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Time Left</p>
                  <p className="text-xl font-bold text-amber-600">{electionStats?.countdown || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Presidential Race</h3>
              </div>
              <div className="p-6">
                <div className="h-64 mb-6">
                  <canvas ref={presidentChartRef} className="w-full h-full"></canvas>
                </div>
                <div className="space-y-4">
                  {results
                    .filter((r) => r.position === "president")
                    .map((candidate) => (
                      <div key={candidate._id}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{candidate.name}</span>
                          <span className="text-sm font-medium text-gray-700">{candidate.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${candidate.color || "bg-blue-600"} h-2 rounded-full`}
                            style={{ width: `${candidate.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-teal-700 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Vice Presidential Race</h3>
              </div>
              <div className="p-6">
                <div className="h-64 mb-6 flex items-center justify-center text-gray-500">
                  <p>Chart placeholder for VP results</p>
                </div>
                <div className="space-y-4">
                  {results
                    .filter((r) => r.position === "vicePresident")
                    .map((candidate) => (
                      <div key={candidate._id}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{candidate.name}</span>
                          <span className="text-sm font-medium text-gray-700">{candidate.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${candidate.color || "bg-green-600"} h-2 rounded-full`}
                            style={{ width: `${candidate.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )

  const News = () => (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Election News</h2>
            <p className="text-gray-600">Stay updated with the latest election announcements and updates.</p>
          </div>

          <div className="space-y-6">
            {news.map((item, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg shadow overflow-hidden ${
                  item.featured ? "border-l-4 border-blue-500" : ""
                }`}
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${item.typeColor}`}>{item.type}</span>
                      {item.featured && (
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-600 text-white">
                          Featured
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{item.date}</span>
                  </div>

                  <h3 className={`font-semibold text-gray-800 mb-3 ${item.featured ? "text-xl" : "text-lg"}`}>
                    {item.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">{item.content}</p>

                  {item.featured && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Read More →</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={async () => {
                try {
                  const moreNews = await api.get("/api/election/news/more")
                  setNews([...news, ...moreNews.data])
                } catch (err) {
                  setError("Failed to load more news.")
                }
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Load More News
            </button>
          </div>
        </>
      )}
    </div>
  )

  const VoteModal = () => {
    if (!showModal) return null

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Confirm Your Vote</h3>
            <p className="text-gray-600 mt-2">
              You are about to cast your vote for the Student Council Election. This action cannot be undone.
            </p>
          </div>
          <div className="space-y-4 mb-6">
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700">
                President: <span className="text-blue-600">{getCandidateName(selectedCandidates.president)}</span>
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700">
                Vice President: <span className="text-blue-600">{getCandidateName(selectedCandidates.vp)}</span>
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700">
                Secretary: <span className="text-blue-600">{getCandidateName(selectedCandidates.secretary)}</span>
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700">
                Treasurer: <span className="text-blue-600">{getCandidateName(selectedCandidates.treasurer)}</span>
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={confirmVote}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Confirm Vote
            </button>
          </div>
        </div>
      </div>
    )
  }

  const SuccessModal = () => {
    if (!showSuccess) return null

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="h-16 w-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Vote Successfully Cast!</h3>
            <p className="text-gray-600 mt-2">
              Thank you for participating in the Student Council Election. Your vote has been recorded securely.
            </p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => setShowSuccess(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "profile" && <Profile />}
          {activeTab === "vote" && <Vote />}
          {activeTab === "results" && <Results />}
          {activeTab === "news" && <News />}
        </main>
      </div>
      <VoteModal />
      <SuccessModal />
    </div>
  )
}