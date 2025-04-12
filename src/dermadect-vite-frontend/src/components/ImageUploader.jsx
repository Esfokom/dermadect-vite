"use client"

import { useState } from "react"
import { Loader } from "./Loader"
import "./ImageUploader.scss"

export function ImageUploader({ onImageUpload, loading }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fileInput = document.getElementById("image-upload")
      fileInput.files = e.dataTransfer.files
      onImageUpload({ target: fileInput })
    }
  }

  return (
    <div
      className={`image-uploader ${isDragging ? "dragging" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {loading ? (
        <div className="upload-loading">
          <Loader />
          <p>Processing your image...</p>
        </div>
      ) : (
        <>
          <div className="upload-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
              <path d="M16 5h6v6"></path>
              <path d="M8 12l3 3 9-9"></path>
            </svg>
          </div>
          <h3>Upload an image</h3>
          <p>Drag and drop an image or click to browse</p>
          <input type="file" id="image-upload" accept="image/*" onChange={onImageUpload} />
          <label htmlFor="image-upload" className="upload-button">
            Select Image
          </label>
        </>
      )}
    </div>
  )
}
