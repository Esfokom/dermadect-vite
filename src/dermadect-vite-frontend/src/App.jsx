"use client"

import { useState } from "react"
import "./App.scss"
import { Loader } from "./components/Loader"
import { ImageUploader } from "./components/ImageUploader"
import { ResultDisplay } from "./components/ResultDisplay"
import { MarkdownDisplay } from "./components/MarkdownDisplay"
// import * as dermadect_vite_backend from "./backend" // Import the backend functions
import { dermadect_vite_backend } from "../../declarations/dermadect-vite-backend"

function App() {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState({
    upload: false,
    prediction: false,
    gemini: false,
  })
  const [prediction, setPrediction] = useState(null)
  const [geminiResponse, setGeminiResponse] = useState(null)
  const [error, setError] = useState(null)

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    setLoading({ ...loading, upload: true })
    setError(null)
    setPrediction(null)
    setGeminiResponse(null)

    // Convert to base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64String = e.target.result
      setImage(base64String)
      setImagePreview(base64String) // Use base64 string directly for preview
      setLoading({ ...loading, upload: false, prediction: true })

      // Call the prediction function
      dermadect_vite_backend
        .predictImage(base64String)
        .then((response) => {
          try {
            // Parse the response if it's a string
            const parsedResponse = typeof response === "string" ? JSON.parse(response) : response

            // Set prediction results immediately and turn off prediction loading
            setPrediction(parsedResponse)
            setLoading(prevLoading => ({ ...prevLoading, prediction: false }))

            // Check if it's Unknown/Normal or a known disease
            const predictedClass = parsedResponse.prediction.predicted_class

            if (predictedClass !== "Unknown/Normal") {
              // If it's a known disease, call the gemini function
              // Note: we're setting ONLY gemini loading to true now
              setLoading(prevLoading => ({ ...prevLoading, gemini: true }))

              dermadect_vite_backend
                .geminiRequest(predictedClass)
                .then((geminiRes) => {
                  console.log("Raw gemini response from backend:", geminiRes);

                  // If the response is a string that looks like it might be JSON
                  if (typeof geminiRes === 'string' && (geminiRes.startsWith('{') || geminiRes.startsWith('['))) {
                    try {
                      // Try to parse it
                      const parsedResponse = JSON.parse(geminiRes);
                      setGeminiResponse(parsedResponse);
                    } catch (e) {
                      // If parsing fails, use the raw string
                      console.warn("Failed to parse gemini response as JSON, using raw string", e);
                      setGeminiResponse(geminiRes);
                    }
                  } else {
                    // If it's not a JSON string, use as is
                    setGeminiResponse(geminiRes);
                  }

                  // Only turn off gemini loading
                  setLoading(prevLoading => ({ ...prevLoading, gemini: false }));
                })
                .catch((err) => {
                  console.error("Gemini request error:", err)
                  setError("Failed to get detailed information about the condition.")
                  setLoading(prevLoading => ({ ...prevLoading, gemini: false }))
                })
            }
          } catch (err) {
            console.error("Error parsing prediction:", err)
            setError("Failed to process the prediction result.")
            setLoading(prevLoading => ({ ...prevLoading, prediction: false }))
          }
        })
        .catch((err) => {
          console.error("Prediction error:", err)
          setError("Failed to analyze the image. Please try again.")
          setLoading(prevLoading => ({ ...prevLoading, prediction: false }))
        })
    }

    reader.onerror = () => {
      setError("Failed to read the image file. Please try again.")
      setLoading(prevLoading => ({ ...prevLoading, upload: false }))
    }

    reader.readAsDataURL(file)
  }

  const resetApp = () => {
    setImage(null)
    setImagePreview(null)
    setPrediction(null)
    setGeminiResponse(null)
    setError(null)
    setLoading({
      upload: false,
      prediction: false,
      gemini: false,
    })
  }

  return (
    <div className="app-container">
      <header>
        <h1>DermaDect</h1>
        <p>Upload an image for skin condition analysis</p>
      </header>

      <main>
        {!image ? (
          <ImageUploader onImageUpload={handleImageUpload} loading={loading.upload} />
        ) : (
          <div className="results-container">
            <div className="image-preview-container">
              {imagePreview && (
                <img src={imagePreview || "/placeholder.svg"} alt="Uploaded skin" className="image-preview" />
              )}
              <button className="reset-button" onClick={resetApp}>
                Upload a different image
              </button>
            </div>

            <div className="analysis-container">
              {loading.upload && (
                <div className="loader-container">
                  <Loader />
                  <p>Processing your image...</p>
                </div>
              )}

              {loading.prediction && (
                <div className="loader-container">
                  <Loader />
                  <p>Analyzing your image...</p>
                </div>
              )}

              {error && (
                <div className="error-message">
                  <p>{error}</p>
                </div>
              )}

              {/* Show prediction results as soon as they're available */}
              {prediction && !loading.prediction && <ResultDisplay prediction={prediction} />}

              {/* Separately show Gemini loading and results */}
              {loading.gemini && (
                <div className="loader-container gemini-loader">
                  <Loader />
                  <p>Getting detailed information...</p>
                </div>
              )}

              {geminiResponse && !loading.gemini && <MarkdownDisplay geminiResponse={geminiResponse} />}
            </div>
          </div>
        )}
      </main>

      <footer>
        <p>© 2025 DermaDect - AI-powered skin condition analysis</p>
      </footer>
    </div>
  )
}

export default App