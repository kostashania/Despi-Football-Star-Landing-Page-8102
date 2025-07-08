import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { uploadImage, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '../utils/imageUpload';

const { FiUpload, FiImage, FiX, FiCheck, FiLoader } = FiIcons;

const ImageUploader = ({ onUploadSuccess, onCancel }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFile(selectedFile);
  };
  
  const handleFile = (selectedFile) => {
    setError('');
    
    if (!selectedFile) return;
    
    // Check file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
      return;
    }
    
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setError('File type not supported. Please upload a JPEG, PNG, WebP, or GIF image.');
      return;
    }
    
    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 90) {
        clearInterval(interval);
        progress = 90;
      }
      setUploadProgress(Math.min(progress, 90));
    }, 300);
    
    return () => clearInterval(interval);
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      setError('');
      
      // Start progress simulation
      const stopProgress = simulateProgress();
      
      // Upload the file
      const imageUrl = await uploadImage(file);
      
      // Complete progress
      stopProgress();
      setUploadProgress(100);
      
      // Notify parent component
      onUploadSuccess(imageUrl);
    } catch (error) {
      setError(error.message || 'Error uploading image. Please try again.');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleCancel = () => {
    setFile(null);
    setPreview('');
    setError('');
    onCancel();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4">Upload Image</h3>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4"
        >
          {error}
        </motion.div>
      )}
      
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload').click()}
        >
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="image/jpeg, image/png, image/webp, image/gif"
            onChange={handleFileChange}
          />
          <SafeIcon
            icon={FiImage}
            className={`w-12 h-12 mx-auto mb-4 ${
              dragActive ? 'text-green-500' : 'text-gray-400'
            }`}
          />
          <p className="text-gray-600 mb-2">
            Drag and drop an image here, or click to select
          </p>
          <p className="text-xs text-gray-500">
            JPEG, PNG, WebP, or GIF • Max {MAX_FILE_SIZE / (1024 * 1024)}MB
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative border rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-contain bg-gray-100"
            />
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPreview('');
              }}
              className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-white transition-colors"
              disabled={isUploading}
            >
              <SafeIcon icon={FiX} className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>{file.name}</p>
            <p>
              {(file.size / 1024).toFixed(1)} KB • {file.type.split('/')[1].toUpperCase()}
            </p>
          </div>
          
          {isUploading && (
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                Uploading... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
          
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                isUploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isUploading ? (
                <>
                  <SafeIcon icon={FiLoader} className="animate-spin" />
                  Uploading
                </>
              ) : (
                <>
                  <SafeIcon icon={FiUpload} />
                  Upload
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;