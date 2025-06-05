import Chart from "chart.js/auto"

export const renderBarChart = (canvasRef, data, options = {}) => {
  if (!canvasRef.current) return
  const ctx = canvasRef.current.getContext("2d")
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map((d) => d.name),
      datasets: [
        {
          label: "Votes",
          data: data.map((d) => d.votes),
          backgroundColor: data.map((d) => d.color || "#3B82F6"),
          borderColor: data.map((d) => d.color || "#3B82F6"),
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      ...options,
    },
  })
}