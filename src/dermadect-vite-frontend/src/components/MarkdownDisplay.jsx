"use client"

import { useEffect, useState } from "react"
import "./MarkdownDisplay.scss"
import { marked } from "marked"

export function MarkdownDisplay({ geminiResponse }) {
  const [markdownContent, setMarkdownContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (geminiResponse) {
      try {
        // Extract the markdown text from the Gemini response
        const markdownText = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text || ""

        // Convert markdown to HTML
        const htmlContent = marked.parse(markdownText)
        setMarkdownContent(htmlContent)
      } catch (error) {
        console.error("Error parsing markdown:", error)
        setMarkdownContent("<p>Error displaying detailed information.</p>")
      } finally {
        setIsLoading(false)
      }
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

  return (
    <div className="markdown-display">
      <h2>Detailed Information</h2>
      <div className="markdown-content" dangerouslySetInnerHTML={{ __html: markdownContent }} />
    </div>
  )
}
