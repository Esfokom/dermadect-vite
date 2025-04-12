import "./ResultDisplay.scss"

export function ResultDisplay({ prediction }) {
  const { predicted_class, probabilities } = prediction.prediction

  // Sort probabilities by value in descending order
  const sortedProbabilities = Object.entries(probabilities)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5) // Get top 5

  const isNormal = predicted_class === "Unknown/Normal"

  return (
    <div className={`result-display ${isNormal ? "normal" : "condition"}`}>
      <h2>Analysis Results</h2>

      <div className="prediction-result">
        <h3>Detected: {predicted_class}</h3>

        {isNormal ? (
          <div className="normal-message">
            <div className="icon-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <p>
              Good news! No specific skin condition was detected in the image. Your skin appears normal based on our
              analysis.
            </p>
            <p className="disclaimer">
              Note: This is not a medical diagnosis. If you have concerns about your skin, please consult a
              dermatologist.
            </p>
          </div>
        ) : (
          <div className="condition-message">
            <p>A potential skin condition has been detected. Detailed information is being loaded below.</p>
            <p className="disclaimer">
              Note: This is not a medical diagnosis. Please consult a dermatologist for proper evaluation.
            </p>
          </div>
        )}
      </div>

      <div className="probability-chart">
        <h4>Top Probability Scores</h4>
        <div className="chart">
          {sortedProbabilities.map(([condition, probability]) => (
            <div key={condition} className="chart-item">
              <div className="condition-name">{condition}</div>
              <div className="bar-container">
                <div className="bar" style={{ width: `${Math.round(probability * 100)}%` }}></div>
                <span className="percentage">{Math.round(probability * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
