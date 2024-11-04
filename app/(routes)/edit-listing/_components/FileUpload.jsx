import React, { useState } from 'react';
import Image from 'next/image';

const FileUpload = ({ setImages, imageList }) => {
  const [imagePreview, setImagePreview] = useState([]);

  const handleFileUpload = (event) => {
    const files = event.target.files;
    const filesArray = Array.from(files);

    // Update the parent component with the selected files
    setImages(filesArray);

    // Generate image previews
    const previews = filesArray.map((file) => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  return (
    <div>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {/* SVG Icon */}
            <svg
              className="w-8 h-8 mb-4 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 000-6h-.025A5.56 5.56 0 0016 6.5 5.5 5.5 0 005.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 000 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG or GIF (MAX. 800x400px)
            </p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept="image/png, image/gif, image/jpeg"
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {imagePreview.map((image, index) => (
          <div key={index}>
            <Image
              src={image}
              width={100}
              height={100}
              className="rounded-xl"
              alt={`Preview ${index}`}
            />
          </div>
        ))}
      </div>
      {imageList && <div className="grid grid-cols-2 gap-2 mt-4">
        {imageList.map((image, index) => (
          <div key={index}>
            <Image
              src={image?.url}
              width={100}
              height={100}
              className="rounded-xl"
              alt={index}
            />
          </div>
        ))}
      </div>}
    </div>
  );
};

export default FileUpload;
