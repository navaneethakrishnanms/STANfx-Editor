import React, { useCallback } from 'react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-muted group-hover:text-[var(--accent-primary)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
);

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        onImageUpload(file);
    }
  }, [onImageUpload]);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div 
        className="group flex flex-col items-center justify-center w-full h-[70vh] bg-[rgba(var(--bg-secondary-rgb),0.5)] border-2 border-dashed border-[rgb(var(--bg-interactive-rgb))] rounded-2xl transition-all duration-300 hover:border-[var(--accent-primary)] hover:bg-[rgba(var(--bg-secondary-rgb),0.8)] hover:shadow-2xl hover:shadow-sky-500/10"
        onDrop={onDrop}
        onDragOver={onDragOver}
    >
      <div className="text-center p-8">
        <UploadIcon />
        <h2 className="mt-6 text-xl font-semibold text-secondary">Drag & drop your image here</h2>
        <p className="mt-2 text-muted">or</p>
        <label htmlFor="file-upload" className="mt-4 inline-block cursor-pointer px-6 py-2 bg-[var(--accent-primary)] text-inverted font-semibold rounded-lg shadow-md hover:bg-[var(--accent-secondary)] transition-all duration-200 ring-2 ring-sky-600/50 hover:ring-sky-500">
          Browse Files
        </label>
        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
        <p className="mt-6 text-xs text-muted">Supports: PNG, JPG, WEBP</p>
      </div>
    </div>
  );
};