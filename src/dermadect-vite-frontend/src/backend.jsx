// src/backend.jsx

// This file mocks the backend API calls for the DermaDect application.
// In a real application, these functions would make HTTP requests to a backend server.

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function predictImage(base64Image) {
  // Simulate an API call to a prediction service.
  await sleep(1500) // Simulate network latency

  // Mock prediction data.  In a real application, this would come from the API.
  const mockPredictions = {
    Melanoma: 0.1,
    "Basal Cell Carcinoma": 0.2,
    "Squamous Cell Carcinoma": 0.05,
    "Actinic Keratosis": 0.15,
    Nevus: 0.05,
    "Seborrheic Keratosis": 0.03,
    Lentigo: 0.02,
    "Lichen Planus": 0.05,
    Psoriasis: 0.05,
    Eczema: 0.2,
    Warts: 0.05,
    Tinea: 0.05,
  }

  const predictedClass = Object.keys(mockPredictions).reduce((a, b) =>
    mockPredictions[a] > mockPredictions[b] ? a : b,
  )

  const predictionResult = {
    prediction: {
      predicted_class:
        predictedClass === "Eczema" || predictedClass === "Psoriasis" ? predictedClass : "Unknown/Normal",
      probabilities: mockPredictions,
    },
  }

  return JSON.stringify(predictionResult)
}

export async function geminiRequest(condition) {
  // Simulate an API call to a Gemini-like service for detailed information.
  await sleep(2000) // Simulate network latency

  // Mock Gemini response data. In a real application, this would come from the API.
  const mockGeminiResponse = {
    candidates: [
      {
        content: {
          parts: [
            {
              text: `# ${condition}\n\n${condition} is a skin condition characterized by inflammation and itchiness.  It can be caused by a variety of factors, including genetics, allergies, and irritants.\n\n## Symptoms\n\n*   Itching\n*   Redness\n*   Dryness\n*   Scaling\n\n## Treatment\n\nTreatment for ${condition} typically involves topical corticosteroids and emollients.  In severe cases, oral or injectable medications may be necessary.`,
            },
          ],
        },
      },
    ],
  }

  return JSON.stringify(mockGeminiResponse)
}
