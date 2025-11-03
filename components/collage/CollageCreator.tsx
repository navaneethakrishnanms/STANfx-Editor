import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { collageTemplates } from './templates';
import type { CollageTemplate, CollageImage, CollageSlot, TextOverlay } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { generateCollageTemplateFromImage } from '../../services/geminiService';

// Icons
const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-muted group-hover:text-[var(--accent-primary)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
);
const ResetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5" /><path d="M4 9a9 9 0 0 1 14.85-3.36L20 10M4 14l-1.15 1.36A9 9 0 0 0 9 20h1" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;
const WandIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 2.293a1 1 0 011.414 0l.001.001a1 1 0 010 1.414l-11 11a1 1 0 01-1.414-1.414l11-11zM11 7a1 1 0 012 0v1a1 1 0 11-2 0V7zM4 11a1 1 0 012 0v1a1 1 0 11-2 0v-1zM7 4a1 1 0 012 0v1a1 1 0 11-2 0V4zM8 12a1 1 0 00-2 0v1a1 1 0 102 0v-1zM5 7a1 1 0 00-2 0v1a1 1 0 102 0V7z" /><path d="M3 10a1 1 0 011-1h1.01a1 1 0 01.894.553l.448.894a1 1 0 001.789 0l.448-.894A1 1 0 0110.49 9H12a1 1 0 110 2h-1.51a1 1 0 01-.894-.553l-.448-.894a1 1 0 00-1.789 0l-.448.894A1 1 0 016.51 12H5a1 1 0 01-1-1v-1z" /></svg>;
const PositionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" /></svg>;

// Helper to draw image with pan and zoom, behaving like object-fit: cover
const drawImageWithPanAndZoom = (
    ctx: CanvasRenderingContext2D,
    collageImage: CollageImage,
    dx: number, dy: number, dw: number, dh: number
) => {
    const { image, x, y, scale } = collageImage;
    if (!image) return;

    const imgRatio = image.width / image.height;
    const slotRatio = dw / dh;
    
    let baseSw, baseSh;
    if (imgRatio > slotRatio) {
        baseSh = image.height;
        baseSw = image.height * slotRatio;
    } else {
        baseSw = image.width;
        baseSh = image.width / slotRatio;
    }

    const finalSw = baseSw / scale;
    const finalSh = baseSh / scale;

    let finalSx = (image.width - finalSw) / 2 - x;
    let finalSy = (image.height - finalSh) / 2 - y;

    finalSx = Math.max(0, Math.min(image.width - finalSw, finalSx));
    finalSy = Math.max(0, Math.min(image.height - finalSh, finalSy));

    ctx.drawImage(image, finalSx, finalSy, finalSw, finalSh, dx, dy, dw, dh);
};

interface CollageCreatorProps {
    onFinalize: (dataUrl: string) => void;
    onCancel: () => void;
}

const initialFilters = {
    brightness: 100, contrast: 100, saturate: 100,
    grayscale: 0, sepia: 0, invert: 0, hueRotate: 0,
    vignette: 0, grain: 0,
};
type FilterSettings = typeof initialFilters;

const presets: { name: string, settings: Partial<FilterSettings>, overlay: string }[] = [
    { name: 'Vintage', settings: { brightness: 105, contrast: 105, saturate: 85, sepia: 25, vignette: 30, grain: 10 }, overlay: 'lightLeak' },
    { name: 'Golden', settings: { brightness: 110, contrast: 105, saturate: 120, sepia: 15, vignette: 20, grain: 5 }, overlay: 'none' },
    { name: 'Noir', settings: { brightness: 95, contrast: 130, saturate: 0, grayscale: 100, vignette: 50, grain: 15 }, overlay: 'none' },
    { name: 'Retro', settings: { hueRotate: -10, contrast: 105, saturate: 110, grain: 8 }, overlay: 'dust' },
];

// --- UI Components ---
const FilterSlider = ({ label, value, min, max, unit, onChange }: { label: string; value: number; min: number; max: number; unit: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-secondary flex justify-between">
            <span>{label}</span>
            <span className="text-muted">{value}{unit}</span>
        </label>
        <input type="range" min={min} max={max} value={value} onChange={onChange} />
    </div>
);

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean; }> = ({ title, children, defaultOpen = false }) => (
    <details className="bg-[rgba(var(--bg-secondary-rgb),0.6)] backdrop-blur-xl border border-[rgba(var(--border-rgb),0.1)] rounded-2xl group" open={defaultOpen}>
        <summary className="p-4 list-none flex justify-between items-center cursor-pointer">
            <h3 className="text-lg font-semibold text-primary">{title}</h3>
            <ChevronDownIcon />
        </summary>
        <div className="p-4 border-t border-[rgba(var(--border-rgb),0.1)]">
            {children}
        </div>
    </details>
);

const TemplatePreview: React.FC<{ template: CollageTemplate }> = ({ template }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Get the computed color from CSS variables, as canvas context cannot parse them directly.
        const computedStyle = getComputedStyle(document.documentElement);
        const textSecondaryRgb = computedStyle.getPropertyValue('--text-secondary-rgb').trim();
        
        const { width, height } = canvas;
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = `rgba(${textSecondaryRgb}, 0.6)`;

        template.layout.forEach(slot => {
            const path = new Path2D(slot.clipPath);
            ctx.save();
            ctx.translate(slot.bounds.x * width, slot.bounds.y * height);
            ctx.scale(slot.bounds.w * width, slot.bounds.h * height);
            ctx.fill(path);
            ctx.restore();
        });
    }, [template]);

    return <canvas ref={canvasRef} width="64" height="64" className="w-full h-full bg-[rgb(var(--bg-tertiary-rgb))] rounded-sm"></canvas>;
};

export const CollageCreator: React.FC<CollageCreatorProps> = ({ onFinalize, onCancel }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [customTemplates, setCustomTemplates] = useLocalStorage<CollageTemplate[]>('customCollageTemplates', []);
    const [allTemplates, setAllTemplates] = useState<CollageTemplate[]>([]);

    const [activeTemplate, setActiveTemplate] = useState<CollageTemplate | null>(null);
    const [images, setImages] = useState<(CollageImage | null)[]>([]);
    const [spacing, setSpacing] = useState(10);
    const [backgroundColor, setBackgroundColor] = useState('#1E293B');
    const [filters, setFilters] = useState(initialFilters);
    const [overlay, setOverlay] = useState('none');
    const [isLoading, setIsLoading] = useState(false);
    
    const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0, initialImageX: 0, initialImageY: 0 });

    const [aiImportFile, setAiImportFile] = useState<File | null>(null);
    const [aiImportPreview, setAiImportPreview] = useState<string | null>(null);
    const [aiImportName, setAiImportName] = useState('');
    const [importStatus, setImportStatus] = useState<{ type: 'idle' | 'loading' | 'error' | 'success'; message: string }>({ type: 'idle', message: '' });

    // --- Effect Overlay Generation ---
    const overlayCache = useRef<Record<string, HTMLCanvasElement>>({});
    const grainCanvas = useMemo(() => {
        if (typeof document === 'undefined') return null;
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d')!;
        const imageData = ctx.createImageData(100, 100);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const val = Math.random() * 255;
            data[i] = val;
            data[i + 1] = val;
            data[i + 2] = val;
            data[i + 3] = 20; // low alpha
        }
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }, []);
    
    const getOverlayCanvas = (type: string, width: number, height: number): HTMLCanvasElement => {
        const cacheKey = `${type}-${width}-${height}`;
        if (overlayCache.current[cacheKey]) return overlayCache.current[cacheKey];

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;

        if (type === 'lightLeak') {
            const grad = ctx.createLinearGradient(0, 0, width, height);
            grad.addColorStop(0.1, 'rgba(255, 180, 50, 0.4)');
            grad.addColorStop(0.5, 'rgba(220, 50, 50, 0.3)');
            grad.addColorStop(0.9, 'rgba(255, 180, 50, 0.4)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
        } else if (type === 'dust') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            for (let i = 0; i < 200; i++) {
                ctx.fillRect(Math.random() * width, Math.random() * height, Math.random() * 2, Math.random() * 2);
            }
        }
        overlayCache.current[cacheKey] = canvas;
        return canvas;
    };


    useEffect(() => {
        const combined = [...collageTemplates, ...customTemplates];
        setAllTemplates(combined);
        if (!activeTemplate) {
            setActiveTemplate(combined[0]);
        }
    }, [customTemplates, activeTemplate]);

    useEffect(() => {
        if (activeTemplate) {
            setImages(new Array(activeTemplate.slots).fill(null));
        }
    }, [activeTemplate]);

    const handleImageUpload = (file: File, index: number) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                setImages(currentImages => {
                    const newImages = [...currentImages];
                    newImages[index] = { image: img, x: 0, y: 0, scale: 1 };
                    return newImages;
                });
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = (index: number) => {
        setImages(currentImages => {
            const newImages = [...currentImages];
            newImages[index] = null;
            return newImages;
        });
    };

    const handleResetImageTransform = (index: number) => {
        setImages(currentImages => {
            const newImages = [...currentImages];
            const currentImage = newImages[index];
            if (currentImage) {
                newImages[index] = { ...currentImage, x: 0, y: 0, scale: 1 };
            }
            return newImages;
        });
    };
    
    // Draw the collage to the canvas whenever inputs change
    const drawCollage = useCallback((ctx: CanvasRenderingContext2D) => {
        if (!activeTemplate) return;
        const { width, height } = ctx.canvas;
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        const mainFilterString = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) invert(${filters.invert}%) hue-rotate(${filters.hueRotate}deg)`;

        const drawSlot = (slot: CollageSlot, index: number) => {
            const collageImage = images[index];
            const { bounds, clipPath } = slot;
           
            const dX = bounds.x * width + (spacing / 2);
            const dY = bounds.y * height + (spacing / 2);
            const dW = bounds.w * width - spacing;
            const dH = bounds.h * height - spacing;
            
            ctx.save();
            const path = new Path2D(clipPath);
            ctx.translate(dX, dY);
            ctx.scale(dW, dH);
            ctx.clip(path);
            ctx.resetTransform();

            if (collageImage) {
                ctx.save();
                ctx.filter = mainFilterString;
                drawImageWithPanAndZoom(ctx, collageImage, dX, dY, dW, dH);
                ctx.restore();
            } else {
                ctx.fillStyle = 'rgba(var(--bg-tertiary-rgb), 0.5)';
                ctx.fillRect(dX, dY, dW, dH);
            }
            if (index === activeSlotIndex) {
                ctx.fillStyle = "rgba(2, 132, 199, 0.3)";
                ctx.fillRect(dX, dY, dW, dH);
                ctx.strokeStyle = "rgb(14, 165, 233)";
                ctx.lineWidth = 4;
                ctx.strokeRect(dX, dY, dW, dH);
            }
            ctx.restore();
        };

        const slotsWithIndices = activeTemplate.layout.map((slot, index) => ({ slot, index }));
        const backgroundItems = slotsWithIndices.filter(item => item.slot.isBackground);
        const foregroundItems = slotsWithIndices.filter(item => !item.slot.isBackground);

        // 1. Draw background slots first
        backgroundItems.forEach(item => drawSlot(item.slot, item.index));
        // 2. Then draw foreground slots on top
        foregroundItems.forEach(item => drawSlot(item.slot, item.index));
        
        // 3. Draw Overlays on top of everything
        activeTemplate.overlays?.forEach((overlay) => {
            if (overlay.type === 'text') {
                const b = overlay.bounds;
                const dX = b.x * width;
                const dY = b.y * height;
                const dW = b.w * width;
                const dH = b.h * height;
                
                ctx.save();
                ctx.textAlign = overlay.textAlign as CanvasTextAlign;
                ctx.fillStyle = overlay.color;
                
                // Estimate font size based on bounding box height
                const fontSize = dH * 0.8;
                ctx.font = `${overlay.fontWeight} ${fontSize}px ${overlay.fontFamily}`;
                ctx.textBaseline = 'middle';

                let textX = dX;
                if (overlay.textAlign === 'center') textX += dW / 2;
                if (overlay.textAlign === 'right') textX += dW;
                let textY = dY + dH / 2;

                // Handle transforms
                if (overlay.transform) {
                    const rotateMatch = overlay.transform.match(/rotate\(([-]?\d*\.?\d+)\)/);
                    if (rotateMatch) {
                        const angle = parseFloat(rotateMatch[1]);
                        const rad = angle * Math.PI / 180;
                        // Translate to the center of the bounding box for rotation
                        ctx.translate(dX + dW / 2, dY + dH / 2);
                        ctx.rotate(rad);
                        // Adjust text position to be drawn at the new (0,0) center
                        textX = 0; 
                        textY = 0;
                    }
                }
                
                ctx.fillText(overlay.text, textX, textY);
                ctx.restore();
            }
        });

        // Draw Effects
        if (overlay !== 'none') {
            const overlayCanvas = getOverlayCanvas(overlay, width, height);
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = 0.4;
            ctx.drawImage(overlayCanvas, 0, 0, width, height);
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
        }
        if (filters.vignette > 0) {
            const gradient = ctx.createRadialGradient(width / 2, height / 2, width / 3, width / 2, height / 2, width * 0.8);
            gradient.addColorStop(0, "rgba(0,0,0,0)");
            gradient.addColorStop(1, `rgba(0,0,0,${filters.vignette / 100})`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }
        if (filters.grain > 0 && grainCanvas) {
            ctx.globalAlpha = filters.grain / 100;
            ctx.fillStyle = ctx.createPattern(grainCanvas, 'repeat')!;
            ctx.fillRect(0, 0, width, height);
            ctx.globalAlpha = 1;
        }

    }, [activeTemplate, images, spacing, backgroundColor, activeSlotIndex, filters, overlay, grainCanvas, getOverlayCanvas]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        drawCollage(ctx);
    }, [drawCollage]);

    const getSlotIndexAtCoords = useCallback((x: number, y: number): number => {
        if (!canvasRef.current || !activeTemplate) return -1;
        const canvas = canvasRef.current;
        const { width, height } = canvas;
        const rect = canvas.getBoundingClientRect();
        const canvasX = (x - rect.left) * (width / rect.width);
        const canvasY = (y - rect.top) * (height / rect.height);
        
        const checkCollision = (slot: CollageSlot): boolean => {
            const { bounds } = slot;
            const dX = bounds.x * width + (spacing / 2);
            const dY = bounds.y * height + (spacing / 2);
            const dW = bounds.w * width - spacing;
            const dH = bounds.h * height - spacing;
            return canvasX >= dX && canvasX <= dX + dW && canvasY >= dY && canvasY <= dY + dH;
        };

        const slotsWithIndices = activeTemplate.layout.map((slot, index) => ({ slot, index }));
        const foregroundItems = slotsWithIndices.filter(item => !item.slot.isBackground);
        const backgroundItems = slotsWithIndices.filter(item => item.slot.isBackground);

        // Check foreground items first, from top to bottom (last in array is visually on top)
        for (let i = foregroundItems.length - 1; i >= 0; i--) {
            const item = foregroundItems[i];
            if (checkCollision(item.slot)) {
                return item.index;
            }
        }

        // Then check background items
        for (const item of backgroundItems) {
            if (checkCollision(item.slot)) {
                return item.index;
            }
        }
        
        return -1;
    }, [activeTemplate, spacing]);
    
    // --- Canvas Interaction Handlers ---
    const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const index = getSlotIndexAtCoords(e.clientX, e.clientY);
        setActiveSlotIndex(index);
        
        if (index !== -1 && images[index]) {
            isDraggingRef.current = true;
            const collageImage = images[index]!;
            dragStartRef.current = {
                x: e.clientX,
                y: e.clientY,
                initialImageX: collageImage.x,
                initialImageY: collageImage.y,
            };
        }
    };
    
    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDraggingRef.current || activeSlotIndex === null || !images[activeSlotIndex]) return;
        
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        
        setImages(currentImages => {
            const newImages = [...currentImages];
            const collageImage = newImages[activeSlotIndex];
            if (collageImage) {
                // To move image content WITH the mouse, we ADD the mouse delta.
                const sensitivity = 2.5 / collageImage.scale;
                const newX = dragStartRef.current.initialImageX + (dx * sensitivity);
                const newY = dragStartRef.current.initialImageY + (dy * sensitivity);
                newImages[activeSlotIndex] = { ...collageImage, x: newX, y: newY };
            }
            return newImages;
        });
    };
    
    const handleCanvasMouseUp = () => {
        isDraggingRef.current = false;
    };

    const handleCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const index = getSlotIndexAtCoords(e.clientX, e.clientY);
        if (index === -1 || !images[index]) return;

        const zoomIntensity = 0.1;
        const direction = e.deltaY < 0 ? 1 : -1;

        setImages(currentImages => {
            const newImages = [...currentImages];
            const collageImage = newImages[index];
            if (collageImage) {
                const newScale = collageImage.scale + direction * zoomIntensity;
                newImages[index] = { ...collageImage, scale: Math.max(1, Math.min(newScale, 5)) };
            }
            return newImages;
        });
    };

    const handleFilterChange = useCallback((key: keyof FilterSettings, value: number) => {
        setFilters(prev => ({...prev, [key]: value}));
    }, []);
    
    const applyPreset = (preset: { name: string, settings: Partial<FilterSettings>, overlay: string }) => {
        setFilters(prev => ({ ...initialFilters, ...preset.settings }));
        setOverlay(preset.overlay);
    };

    const handleResetFilters = () => setFilters(initialFilters);
    
    const handleAiImportFileChange = (file: File) => {
        setAiImportFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setAiImportPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleAIImport = async () => {
        if (!aiImportFile || !aiImportName) {
            setImportStatus({ type: 'error', message: 'Please upload an image and provide a name.' });
            return;
        }
        setImportStatus({ type: 'loading', message: 'AI is analyzing the layout...' });
        const reader = new FileReader();
        reader.readAsDataURL(aiImportFile);
        reader.onloadend = async () => {
          try {
            const base64 = (reader.result as string).split(',')[1];
            const newTemplate = await generateCollageTemplateFromImage(base64, aiImportFile.type, aiImportName);
            if (allTemplates.some(t => t.id === newTemplate.id)) {
                setImportStatus({ type: 'error', message: `Template with ID '${newTemplate.id}' already exists. Please use a different name.` });
                return;
            }
            setCustomTemplates(prev => [...prev, newTemplate]);
            setImportStatus({ type: 'success', message: `Template "${newTemplate.name}" created and saved!` });
            setAiImportFile(null); setAiImportPreview(null); setAiImportName('');
          } catch (error) {
             const message = error instanceof Error ? error.message : 'An unknown error occurred.';
             setImportStatus({ type: 'error', message: message });
          }
        }
        reader.onerror = () => setImportStatus({ type: 'error', message: 'Failed to read the image file.'});
    }

    const handleFinalize = () => {
        if (!canvasRef.current || images.some(img => img === null)) {
            alert('Please fill all image slots before finalizing.');
            return;
        }
        setIsLoading(true);
        setActiveSlotIndex(null);
        setTimeout(() => {
            const canvas = canvasRef.current!;
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = canvas.width;
            finalCanvas.height = canvas.height;
            const finalCtx = finalCanvas.getContext('2d');
            if (finalCtx) {
                drawCollage(finalCtx);
                const dataUrl = finalCanvas.toDataURL('image/png');
                onFinalize(dataUrl);
            }
            setIsLoading(false);
        }, 100);
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
                <div className="relative w-full aspect-square bg-[rgba(var(--bg-secondary-rgb),0.5)] rounded-2xl overflow-hidden shadow-2xl shadow-black/30 flex items-center justify-center ring-1 ring-inset ring-[rgba(var(--border-rgb),0.1)]">
                   <canvas
                        ref={canvasRef}
                        width={1024}
                        height={1024}
                        className="max-w-full max-h-full object-contain transition-all duration-200"
                        style={{ cursor: activeSlotIndex !== null ? 'move' : 'default' }}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        onMouseLeave={handleCanvasMouseUp}
                        onWheel={handleCanvasWheel}
                    />
                    {isLoading && (
                        <div className="absolute inset-0 bg-[rgba(var(--bg-secondary-rgb),0.7)] flex flex-col items-center justify-center backdrop-blur-sm z-20">
                            <LoadingSpinner /><p className="mt-4 text-lg text-secondary">Creating your collage...</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
                <CollapsibleSection title="1. Choose a Template" defaultOpen>
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2">
                        {allTemplates.map(template => {
                            const isCustom = !collageTemplates.some(t => t.id === template.id);
                            return (
                                <div key={template.id} onClick={() => setActiveTemplate(template)} className={`group relative cursor-pointer p-1 rounded-md aspect-square transition-all ${activeTemplate?.id === template.id ? 'ring-2 ring-[var(--accent-primary)]' : 'bg-transparent hover:ring-2 hover:ring-[rgb(var(--bg-interactive-rgb))]'}`}>
                                    <TemplatePreview template={template} />
                                    {isCustom && <span className="absolute top-1 right-1 text-[8px] font-bold bg-[var(--accent-secondary)] text-inverted px-1.5 py-0.5 rounded-full">CUSTOM</span>}
                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[rgb(var(--bg-primary-rgb))] text-primary text-xs font-semibold rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[60] border border-[rgba(var(--border-rgb),0.1)]">
                                    {template.name}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </CollapsibleSection>
                <CollapsibleSection title="2. Upload Images" defaultOpen>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {images.map((img, index) => (
                            <ImageSlot key={`${activeTemplate?.id}-${index}`} image={img?.image || null} index={index} onImageUpload={handleImageUpload} onRemoveImage={handleRemoveImage} onResetTransform={handleResetImageTransform} />
                        ))}
                    </div>
                </CollapsibleSection>
                <CollapsibleSection title="3. Layout & Background">
                     <div className="space-y-4">
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-secondary flex justify-between"><span>Spacing</span><span className="text-muted">{spacing}px</span></label>
                            <input type="range" min="0" max="50" value={spacing} onChange={e => setSpacing(Number(e.target.value))} />
                        </div>
                         <div className="flex items-center justify-between">
                             <label className="text-sm font-medium text-secondary">Background</label>
                             <input type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="w-10 h-10 rounded border-none bg-transparent cursor-pointer p-0" />
                         </div>
                    </div>
                </CollapsibleSection>
                 <CollapsibleSection title="4. Presets & Effects">
                    <div className="space-y-4">
                        <div>
                           <h4 className="text-md font-semibold text-primary mb-3">Presets</h4>
                           <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                             {presets.map(p => <button key={p.name} onClick={() => applyPreset(p)} className="px-3 py-2 text-xs font-semibold bg-[rgb(var(--bg-interactive-rgb))] hover:bg-[rgb(var(--bg-interactive-hover-rgb))] rounded-md transition-colors">{p.name}</button>)}
                           </div>
                        </div>
                         <div className="pt-4 border-t border-[rgba(var(--border-rgb),0.1)]">
                             <div className="flex justify-between items-center mb-3">
                                <h4 className="text-md font-semibold text-primary">Filters & Effects</h4>
                                <button onClick={handleResetFilters} className="flex items-center text-xs px-2 py-1 bg-[rgba(var(--bg-interactive-rgb),0.8)] hover:bg-[rgb(var(--bg-interactive-rgb))] rounded-md font-medium transition-colors"><ResetIcon /> Reset</button>
                            </div>
                            <FilterSlider label="Brightness" value={filters.brightness} min={0} max={200} unit="%" onChange={e => handleFilterChange('brightness', Number(e.target.value))} />
                            <FilterSlider label="Contrast" value={filters.contrast} min={0} max={200} unit="%" onChange={e => handleFilterChange('contrast', Number(e.target.value))} />
                            <FilterSlider label="Saturation" value={filters.saturate} min={0} max={200} unit="%" onChange={e => handleFilterChange('saturate', Number(e.target.value))} />
                            <FilterSlider label="Grayscale" value={filters.grayscale} min={0} max={100} unit="%" onChange={e => handleFilterChange('grayscale', Number(e.target.value))} />
                            <FilterSlider label="Sepia" value={filters.sepia} min={0} max={100} unit="%" onChange={e => handleFilterChange('sepia', Number(e.target.value))} />
                            <FilterSlider label="Hue" value={filters.hueRotate} min={0} max={360} unit="°" onChange={e => handleFilterChange('hueRotate', Number(e.target.value))} />
                            <FilterSlider label="Vignette" value={filters.vignette} min={0} max={100} unit="%" onChange={e => handleFilterChange('vignette', Number(e.target.value))} />
                            <FilterSlider label="Grain" value={filters.grain} min={0} max={50} unit="%" onChange={e => handleFilterChange('grain', Number(e.target.value))} />
                        </div>
                        <div className="pt-4 border-t border-[rgba(var(--border-rgb),0.1)]">
                            <h4 className="text-md font-semibold text-primary mb-3">Overlays</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                <button onClick={() => setOverlay('none')} className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors ${overlay === 'none' ? 'bg-[var(--accent-primary)] text-inverted' : 'bg-[rgb(var(--bg-interactive-rgb))] hover:bg-[rgb(var(--bg-interactive-hover-rgb))]'}`}>None</button>
                                <button onClick={() => setOverlay('lightLeak')} className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors ${overlay === 'lightLeak' ? 'bg-[var(--accent-primary)] text-inverted' : 'bg-[rgb(var(--bg-interactive-rgb))] hover:bg-[rgb(var(--bg-interactive-hover-rgb))]'}`}>Light Leak</button>
                                <button onClick={() => setOverlay('dust')} className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors ${overlay === 'dust' ? 'bg-[var(--accent-primary)] text-inverted' : 'bg-[rgb(var(--bg-interactive-rgb))] hover:bg-[rgb(var(--bg-interactive-hover-rgb))]'}`}>Dust</button>
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>
                <CollapsibleSection title="5. AI Template Creator">
                     <div className="space-y-4">
                        <p className="text-xs text-muted">Upload a screenshot of a collage layout from any website (e.g., Canva, Pinterest) and let AI create a template for you.</p>
                        <div className="flex gap-4 items-start">
                            <div className="w-24 flex-shrink-0">
                               <AiImageSlot image={aiImportPreview} onImageUpload={handleAiImportFileChange} onRemoveImage={() => { setAiImportFile(null); setAiImportPreview(null); }} />
                            </div>
                            <div className="flex-1 space-y-2">
                                <input type="text" value={aiImportName} onChange={e => setAiImportName(e.target.value)} placeholder="Template Name..." className="w-full bg-[rgb(var(--bg-interactive-rgb))] border-[rgb(var(--bg-interactive-hover-rgb))] border rounded-md p-2 text-sm" />
                                <button onClick={handleAIImport} disabled={importStatus.type === 'loading'} className="w-full flex items-center justify-center px-4 py-2 bg-[rgb(var(--bg-interactive-rgb))] text-sm font-medium text-primary rounded-md hover:bg-[rgb(var(--bg-interactive-hover-rgb))] transition-colors disabled:opacity-50">
                                   {importStatus.type === 'loading' ? <LoadingSpinner/> : <><WandIcon/> Generate</>}
                                </button>
                            </div>
                        </div>
                         {importStatus.type !== 'idle' && (
                            <p className={`text-xs p-2 rounded-md ${importStatus.type === 'error' ? 'bg-[rgba(var(--danger-bg-rgb),0.5)] text-[rgb(var(--danger-text-rgb))]' : 'bg-emerald-900/50 text-emerald-300'}`}>
                                {importStatus.message}
                            </p>
                         )}
                     </div>
                </CollapsibleSection>
                 <div className="grid grid-cols-2 gap-4 pt-4">
                    <button onClick={handleFinalize} disabled={images.some(i => i === null)} className="w-full px-4 py-3 bg-gradient-to-br from-[var(--accent-gradient-from)] to-[var(--accent-gradient-to)] text-white font-semibold rounded-lg shadow-lg hover:from-[var(--accent-primary)] hover:to-[var(--accent-primary)] disabled:bg-[rgb(var(--bg-interactive-rgb))] disabled:from-transparent disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200">Finalize & Edit</button>
                    <button onClick={onCancel} className="w-full px-4 py-3 bg-[rgb(var(--bg-interactive-rgb))] text-primary font-semibold rounded-lg shadow-md hover:bg-[rgb(var(--bg-interactive-hover-rgb))] transition-all duration-200">Cancel</button>
                </div>
            </div>
        </div>
    )
};

interface ImageSlotProps {
    image: HTMLImageElement | null;
    index: number;
    onImageUpload: (file: File, index: number) => void;
    onRemoveImage: (index: number) => void;
    onResetTransform: (index: number) => void;
}

const ImageSlot: React.FC<ImageSlotProps> = ({ image, index, onImageUpload, onRemoveImage, onResetTransform }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files?.[0]) {
            onImageUpload(e.target.files[0], index);
            e.target.value = '';
        }
    };

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    return (
        <div className="aspect-square relative group/slot">
            <input type="file" accept="image/*" ref={inputRef} className="sr-only" onChange={handleChange} />
            <button onClick={() => inputRef.current?.click()} className="group w-full h-full bg-[rgb(var(--bg-tertiary-rgb))] rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-transparent hover:border-[var(--accent-primary)] transition-all">
                {image ? (
                    <img src={image.src} className="w-full h-full object-cover" alt={`Collage slot ${index+1}`} />
                ) : (
                    <div className="text-center">
                        <UploadIcon/>
                        <span className="text-xs text-muted block mt-1">Slot {index+1}</span>
                    </div>
                )}
            </button>
            {image && (
                 <div className="absolute top-1 right-1 z-10 flex flex-col gap-1 opacity-0 group-hover/slot:opacity-100 transition-opacity">
                    <button onClick={(e) => handleActionClick(e, () => onResetTransform(index))} className="p-1.5 bg-[rgba(var(--bg-primary-rgb),0.7)] text-white rounded-full hover:bg-[var(--accent-primary)] transition-colors" aria-label={`Reset image position in slot ${index + 1}`}>
                       <PositionIcon />
                    </button>
                    <button onClick={(e) => handleActionClick(e, () => onRemoveImage(index))} className="p-1 bg-[rgba(var(--bg-primary-rgb),0.7)] text-white rounded-full hover:bg-[rgb(var(--danger-border-rgb))] transition-colors" aria-label={`Remove image from slot ${index + 1}`}>
                        <CloseIcon />
                    </button>
                </div>
            )}
        </div>
    );
};

const AiImageSlot: React.FC<{image: string | null; onImageUpload: (file: File) => void; onRemoveImage: () => void;}> = ({ image, onImageUpload, onRemoveImage }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files?.[0]) {
            onImageUpload(e.target.files[0]);
            e.target.value = '';
        }
    };

    return (
        <div className="aspect-square relative">
            <input type="file" accept="image/*" ref={inputRef} className="sr-only" onChange={handleChange} />
            <button onClick={() => inputRef.current?.click()} className="group w-full h-full bg-[rgb(var(--bg-tertiary-rgb))] rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-transparent hover:border-[var(--accent-primary)] transition-all">
                {image ? (
                    <img src={image} className="w-full h-full object-cover" alt="AI template preview" />
                ) : (
                    <div className="text-center p-2"><UploadIcon/></div>
                )}
            </button>
            {image && (
                <button onClick={(e) => { e.stopPropagation(); onRemoveImage(); }} className="absolute top-1 right-1 z-10 p-1 bg-[rgba(var(--bg-primary-rgb),0.7)] text-white rounded-full hover:bg-[rgb(var(--danger-border-rgb))] transition-colors" aria-label="Remove layout image">
                    <CloseIcon />
                </button>
            )}
        </div>
    );
};