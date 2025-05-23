"use client"

import { useEffect, useState } from "react"
import "./MarkdownDisplay.scss"
import { marked } from "marked"

export function MarkdownDisplay({ geminiResponse }) {
  const [markdownContent, setMarkdownContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    if (!geminiResponse) {
      setIsLoading(false)
      setError("No response received")
      return
    }

    try {
      console.log("Full Gemini response:", geminiResponse)

      // Try multiple possible paths to extract the text
      let markdownText = ""

      // Handle responses based on different possible formats from your backend
      if (typeof geminiResponse === 'object') {
        // Standard Gemini API response format
        if (geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text) {
          markdownText = geminiResponse.candidates[0].content.parts[0].text
        }
        // Check for text property directly on the response
        else if (geminiResponse.text) {
          markdownText = geminiResponse.text
        }
        // Check for content.text format
        else if (geminiResponse.content?.text) {
          markdownText = geminiResponse.content.text
        }
        // Check other possible paths
        else if (geminiResponse.content?.parts?.[0]?.text) {
          markdownText = geminiResponse.content.parts[0].text
        }
        else if (geminiResponse.parts?.[0]?.text) {
          markdownText = geminiResponse.parts[0].text
        }
        else if (geminiResponse.response) {
          // If wrapped in a response property
          markdownText = typeof geminiResponse.response === 'string'
            ? geminiResponse.response
            : JSON.stringify(geminiResponse.response)
        }
        else {
          // Last resort: stringify the whole object
          console.warn("Unrecognized response format, using full object", geminiResponse)
          markdownText = JSON.stringify(geminiResponse, null, 2)
        }
      }
      // If the response is already a string
      else if (typeof geminiResponse === 'string') {
        // Try to parse it as JSON first in case it's a stringified JSON
        try {
          const parsedResponse = JSON.parse(geminiResponse)
          console.log("Parsed string response as JSON:", parsedResponse)

          // Now extract text from parsed object
          if (parsedResponse.candidates?.[0]?.content?.parts?.[0]?.text) {
            markdownText = parsedResponse.candidates[0].content.parts[0].text
          }
          else if (parsedResponse.text) {
            markdownText = parsedResponse.text
          }
          else if (parsedResponse.content?.text) {
            markdownText = parsedResponse.content.text
          }
          else {
            // If we can't find a specific text field, use the whole parsed response
            markdownText = geminiResponse
          }
        } catch (parseError) {
          // If it's not valid JSON, use the string directly
          console.log("Using string response directly")
          markdownText = geminiResponse
        }
      }
      else {
        console.error("Unrecognized response type:", typeof geminiResponse)
        setError("Response format not recognized")
        markdownText = "Error: Could not extract content from response."
      }

      console.log("Extracted markdown text:", markdownText)

      // Convert markdown to HTML
      const htmlContent = marked.parse(markdownText)
      setMarkdownContent(htmlContent)
    } catch (error) {
      console.error("Error parsing markdown:", error)
      setError(error.message || "Unknown error")
      setMarkdownContent("<p>Error displaying detailed information.</p>")
    } finally {
      setIsLoading(false)
    }
  }, [geminiResponse])

  if (isLoading) {
    return (
      <div className="markdown-loading">
        <div className="skeleton-loader">
          <div className="skeleton-title"></div>
          <div className="skeleton-paragraph"></div>
          <div className="skeleton-paragraph"></div>
          <div className="skeleton-paragraph"></div>
        </div>
      </div>
    )
  }

  if (error && !markdownContent) {
    return (
      <div className="markdown-error">
        <h2>Detailed Information</h2>
        <div className="error-message">
          <p>There was a problem displaying the information:</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="markdown-display">
      <h2>Detailed Information</h2>
      {error && <div className="warning-message">Note: {error}</div>}
      <div className="markdown-content" dangerouslySetInnerHTML={{ __html: markdownContent }} />
    </div>
  )
}