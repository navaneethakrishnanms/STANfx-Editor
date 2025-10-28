import React from 'react';
import type { EditedImage } from '../types';

interface GalleryProps {
  images: EditedImage[];
}

export const Gallery: React.FC<GalleryProps> = ({ images }) => {
  return (
    <div className="bg-[rgba(var(--bg-secondary-rgb),0.6)] backdrop-blur-xl border border-[rgba(var(--border-rgb),0.1)] p-4 rounded-2xl h-full min-h-[60vh] lg:min-h-[80vh]">
      <h2 className="text-xl font-semibold mb-4 text-primary border-b border-[rgba(var(--border-rgb),0.1)] pb-3">My Edits</h2>
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted py-16">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25z" />
            </svg>
            <p className="font-semibold text-secondary">Your gallery is empty.</p>
            <p className="text-sm mt-1">Saved images will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4 max-h-[calc(80vh-60px)] overflow-y-auto pr-2">
          {images.map((image) => (
            <div key={image.id} className="group relative overflow-hidden rounded-lg shadow-lg aspect-square">
              <img src={image.src} alt={image.prompt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                <p className="text-xs text-white leading-tight translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-in-out">{image.prompt}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};