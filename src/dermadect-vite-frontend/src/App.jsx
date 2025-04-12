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

    // Create a preview URL
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)

    // Convert to base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64String = e.target.result
      setImage(base64String)
      setLoading({ ...loading, upload: false, prediction: true })

      // Call the prediction function
      dermadect_vite_backend
        .predictImage(base64String)
        .then((response) => {
          try {
            // Parse the response if it's a string
            const parsedResponse = typeof response === "string" ? JSON.parse(response) : response

            setPrediction(parsedResponse)

            // Check if it's Unknown/Normal or a known disease
            const predictedClass = parsedResponse.prediction.predicted_class

            if (predictedClass !== "Unknown/Normal") {
              // If it's a known disease, call the gemini function
              setLoading({ ...loading, prediction: false, gemini: true })

              dermadect_vite_backend
                .geminiRequest(predictedClass)
                .then((geminiRes) => {
                  setGeminiResponse(geminiRes)
                  setLoading({ ...loading, gemini: false })
                })
                .catch((err) => {
                  console.error("Gemini request error:", err)
                  setError("Failed to get detailed information about the condition.")
                  setLoading({ ...loading, gemini: false })
                })
            } else {
              setLoading({ ...loading, prediction: false })
            }
          } catch (err) {
            console.error("Error parsing prediction:", err)
            setError("Failed to process the prediction result.")
            setLoading({ ...loading, prediction: false })
          }
        })
        .catch((err) => {
          console.error("Prediction error:", err)
          setError("Failed to analyze the image. Please try again.")
          setLoading({ ...loading, prediction: false })
        })
    }

    reader.onerror = () => {
      setError("Failed to read the image file. Please try again.")
      setLoading({ ...loading, upload: false })
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
              {(loading.prediction || loading.upload) && (
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

              {prediction && !loading.prediction && !loading.gemini && <ResultDisplay prediction={prediction} />}

              {loading.gemini && (
                <div className="loader-container">
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
        <p>© 2024 DermaDect - AI-powered skin condition analysis</p>
      </footer>
    </div>
  )
}

export default App
