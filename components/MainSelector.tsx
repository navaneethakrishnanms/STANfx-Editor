import React, { useRef } from 'react';

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);

const CollageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-[var(--accent-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);

interface MainSelectorProps {
    onImageUpload: (file: File) => void;
    onStartCollage: () => void;
    onStartTextToImage: () => void;
}

export const MainSelector: React.FC<MainSelectorProps> = ({ onImageUpload, onStartCollage, onStartTextToImage }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageUpload(file);
        }
    };

    const handleSelectPhotoClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-primary">Start Your Creation</h1>
                <p className="text-lg text-muted mt-2">Choose an option below to begin editing.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                <div 
                    className="group flex flex-col items-center justify-center p-8 bg-[rgba(var(--bg-secondary-rgb),0.5)] border border-[rgb(var(--bg-interactive-rgb))] rounded-2xl transition-all duration-300 hover:border-[var(--accent-primary)] hover:bg-[rgba(var(--bg-secondary-rgb),0.8)] hover:shadow-2xl hover:shadow-sky-500/10 cursor-pointer"
                    onClick={handleSelectPhotoClick}
                >
                    <EditIcon />
                    <h2 className="text-2xl font-semibold text-secondary">Edit a Photo</h2>
                    <p className="mt-2 text-muted text-center">Upload a single image to apply filters, add text, or use AI magic.</p>
                </div>
                <div 
                    className="group flex flex-col items-center justify-center p-8 bg-[rgba(var(--bg-secondary-rgb),0.5)] border border-[rgb(var(--bg-interactive-rgb))] rounded-2xl transition-all duration-300 hover:border-[var(--accent-secondary)] hover:bg-[rgba(var(--bg-secondary-rgb),0.8)] hover:shadow-2xl hover:shadow-cyan-500/10 cursor-pointer"
                    onClick={onStartCollage}
                >
                    <CollageIcon />
                    <h2 className="text-2xl font-semibold text-secondary">Create a Collage</h2>
                    <p className="mt-2 text-muted text-center">Combine multiple photos into a beautiful collage using various templates.</p>
                </div>
                <div 
                    className="group flex flex-col items-center justify-center p-8 bg-[rgba(var(--bg-secondary-rgb),0.5)] border border-[rgb(var(--bg-interactive-rgb))] rounded-2xl transition-all duration-300 hover:border-indigo-500 hover:bg-[rgba(var(--bg-secondary-rgb),0.8)] hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer"
                    onClick={onStartTextToImage}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-indigo-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 10.59l3.3 3.3-1.41 1.41L11 13.41V7h2v5.59z"/></svg>
                    <h2 className="text-2xl font-semibold text-secondary">Text to Image</h2>
                    <p className="mt-2 text-muted text-center">Generate an image from a prompt using Stable Diffusion.</p>
                </div>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
            />
        </div>
    );
};
