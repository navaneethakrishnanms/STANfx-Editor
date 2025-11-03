import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import type { TextObject, ShapeObject, Path } from '../types';

// Icons
const PenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>;
const BlurIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><path d="M2 12A10 10 0 1 1 12 2" /><path d="M22 12a10 10 0 0 0-10 10" /><path d="M12 2a10 10 0 0 0-10 10" /></svg>;
const GrayscaleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 18a6 6 0 0 0 0-12v12z"/></svg>;
const BrightnessIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>;
const ContrastIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 18V6a6 6 0 0 0 0 12z"/></svg>;
const SaturationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22A10 10 0 1 1 12 2a10 10 0 0 1 0 20z"/><path d="M12 2a10 10 0 1 0 10 10"/></svg>;
const TemperatureIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4.51V12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4.51a6 6 0 1 1 8 0z"/><path d="M8 14v1.5a2.5 2.5 0 1 0 5 0V14"/></svg>;
const TintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const VignetteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="10" ry="10" /><ellipse cx="12" cy="12" rx="6" ry="6" fill="currentColor" /></svg>;
const ShapesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="6" r="3"/><path d="M12 20.5v-13l-4.5 2.5"/><path d="M2 10.5l4.5 2.5"/><path d="M7.5 4.5l4.5 2.5"/><path d="M10 20.5l4.5-2.5"/></svg>;
const RotateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
const CropIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"/><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"/></svg>;
const TextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const OverlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 2a10 10 0 1 0 10 10"/></svg>;
const ResetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-4.142-3.358-7.5-7.5-7.5s-7.5 3.358-7.5 7.5 3.358 7.5 7.5 7.5 7.5-3.358 7.5-7.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0-6l6 6" /></svg>;
const UndoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>;
const RedoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" /></svg>;
const WandIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 2.293a1 1 0 011.414 0l.001.001a1 1 0 010 1.414l-11 11a1 1 0 01-1.414-1.414l11-11zM11 7a1 1 0 012 0v1a1 1 0 11-2 0V7zM4 11a1 1 0 012 0v1a1 1 0 11-2 0v-1zM7 4a1 1 0 012 0v1a1 1 0 11-2 0V4zM8 12a1 1 0 00-2 0v1a1 1 0 102 0v-1zM5 7a1 1 0 00-2 0v1a1 1 0 102 0V7z" /><path d="M3 10a1 1 0 011-1h1.01a1 1 0 01.894.553l.448.894a1 1 0 001.789 0l.448-.894A1 1 0 0110.49 9H12a1 1 0 110 2h-1.51a1 1 0 01-.894-.553l-.448-.894a1 1 0 00-1.789 0l-.448.894A1 1 0 016.51 12H5a1 1 0 01-1-1v-1z" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V4zm3 1a1 1 0 100 2h2a1 1 0 100-2H8z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const ClearIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const NoiseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z"/><path d="MM2 12h.01M22 12h.01M12 2v.01M12 22v.01M4.93 4.93l.01.01M19.07 19.07l.01.01M4.93 19.07l.01-.01M19.07 4.93l.01-.01"/></svg>;
const ZoomInIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>;
const ZoomOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>;
const FitToScreenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" /></svg>;

type Tool = 'blur' | 'grayscale' | 'brightness' | 'contrast' | 'saturate' | 'temperature' | 'tint' | 'vignette' | 'noise' | 'rotate' | 'crop' | 'text' | 'shapes' | 'draw' | 'overlay' | null;
type ShapeType = 'rect' | 'circle' | 'triangle' | 'star';

interface EditorPanelProps {
    imageSrc: string; mimeType: string; isLoading: boolean; prompt: string;
    setPrompt: (prompt: string) => void;
    onAIPromptEdit: (canvasState: { base64: string, mimeType: string }) => void;
    onSaveToGallery: (canvasDataUrl: string) => void;
    onClear: () => void;
}

const initialFilters = {
    blurLevel: 0, grayscaleLevel: 0, brightness: 100,
    contrast: 100, saturate: 100, temperature: 0,
    tint: 0, vignette: 0, noise: 0
};

interface OverlayState {
    image: HTMLImageElement;
    x: number;
    y: number;
    scale: number;
    opacity: number;
    blendMode: GlobalCompositeOperation;
    maskPaths: Path[];
}

type CanvasState = {
    filters: typeof initialFilters;
    rotation: number;
    texts: TextObject[];
    shapes: ShapeObject[];
    paths: Path[];
    overlay: OverlayState | null;
};
type HistoryEntry = {
    baseImageSrc: string;
    state: CanvasState;
};

const initialCanvasState: CanvasState = {
    filters: initialFilters,
    rotation: 0,
    texts: [],
    shapes: [],
    paths: [],
    overlay: null,
};

const toolset = [
    { tool: 'brightness' as Tool, icon: BrightnessIcon, tooltip: 'Brightness' },
    { tool: 'contrast' as Tool, icon: ContrastIcon, tooltip: 'Contrast' },
    { tool: 'saturate' as Tool, icon: SaturationIcon, tooltip: 'Saturation' },
    { tool: 'blur' as Tool, icon: BlurIcon, tooltip: 'Blur' },
    { tool: 'grayscale' as Tool, icon: GrayscaleIcon, tooltip: 'Grayscale' },
    { tool: 'temperature' as Tool, icon: TemperatureIcon, tooltip: 'Color Temp' },
    { tool: 'tint' as Tool, icon: TintIcon, tooltip: 'Tint' },
    { tool: 'vignette' as Tool, icon: VignetteIcon, tooltip: 'Vignette' },
    { tool: 'noise' as Tool, icon: NoiseIcon, tooltip: 'Noise / Grain' },
    { tool: 'rotate' as Tool, icon: RotateIcon, tooltip: 'Rotate' },
    { tool: 'crop' as Tool, icon: CropIcon, tooltip: 'Crop' },
    { tool: 'text' as Tool, icon: TextIcon, tooltip: 'Add Text' },
    { tool: 'shapes' as Tool, icon: ShapesIcon, tooltip: 'Add Shape' },
    { tool: 'draw' as Tool, icon: PenIcon, tooltip: 'Draw' },
    { tool: 'overlay' as Tool, icon: OverlayIcon, tooltip: 'Overlay Image' },
]

const availableFonts = [
    { name: 'Inter', family: 'Inter, sans-serif' },
    { name: 'Playfair Display', family: "'Playfair Display', serif" },
    { name: 'Roboto Mono', family: "'Roboto Mono', monospace" },
    { name: 'Pacifico', family: 'Pacifico, cursive' },
    { name: 'Anton', family: 'Anton, sans-serif' },
];

const ToolButton = ({ tool, icon: Icon, tooltip, activeTool, onClick }: any) => (
    <div className="group relative">
        <button 
            onClick={() => onClick(tool)} 
            className={`p-3 rounded-lg transition-all duration-200 w-full flex justify-center items-center ${activeTool === tool ? 'bg-[rgba(var(--accent-primary-rgb),0.2)] text-[var(--accent-primary)]' : 'text-muted hover:bg-[rgba(var(--bg-interactive-rgb),0.5)] hover:text-primary'}`}
            aria-label={tooltip}
        >
            <Icon />
        </button>
        <span className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-[rgb(var(--bg-primary-rgb))] text-primary text-xs font-semibold rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[60] border border-[rgba(var(--border-rgb),0.1)]">
           {tooltip}
        </span>
    </div>
);

// --- Drawing utility functions ---
const drawPath = (ctx: CanvasRenderingContext2D, path: Path) => {
    if (path.points.length < 1) return;
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(path.points[0].x, path.points[0].y);
    for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
    }
    ctx.stroke();
};

const drawShape = (ctx: CanvasRenderingContext2D, shape: ShapeObject) => {
    ctx.strokeStyle = shape.stroke;
    ctx.lineWidth = shape.strokeWidth;
    ctx.beginPath();
    switch (shape.type) {
        case 'rect':
            ctx.rect(shape.x, shape.y, shape.w, shape.h);
            break;
        case 'circle':
            const radiusX = Math.abs(shape.w / 2);
            const radiusY = Math.abs(shape.h / 2);
            ctx.ellipse(shape.x + shape.w / 2, shape.y + shape.h / 2, radiusX, radiusY, 0, 0, 2 * Math.PI);
            break;
        case 'triangle':
            ctx.moveTo(shape.x + shape.w / 2, shape.y); // Top point
            ctx.lineTo(shape.x + shape.w, shape.y + shape.h); // Bottom right
            ctx.lineTo(shape.x, shape.y + shape.h); // Bottom left
            ctx.closePath();
            break;
        case 'star':
            const centerX = shape.x + shape.w / 2;
            const centerY = shape.y + shape.h / 2;
            const outerRadius = Math.min(Math.abs(shape.w), Math.abs(shape.h)) / 2;
            const innerRadius = outerRadius / 2.5;
            const points = 5;
            const angleStep = Math.PI / points;
            ctx.moveTo(centerX, centerY - outerRadius);
            for (let i = 0; i < 2 * points; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = i * angleStep - Math.PI / 2;
                ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
            }
            ctx.closePath();
            break;
    }
    // Note: No fill() call here. Shapes are now outlines/frames.
    if (shape.strokeWidth > 0) {
        ctx.stroke();
    }
};

const renderCanvas = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    baseImage: HTMLImageElement, 
    canvasState: CanvasState,
    zoom: number,
    pan: { x: number, y: number },
    interactiveState: {
        cropRectForUI: {x:number, y:number, w:number, h:number} | null,
        drawingShape: ShapeObject | null,
        drawingPath: Path | null,
        drawingMaskPath: Path | null,
    }
) => {
    const { filters, rotation, texts, shapes, paths, overlay } = canvasState;
    const { blurLevel, grayscaleLevel, brightness, contrast, saturate, temperature, tint, vignette, noise } = filters;

    const w = baseImage.width; const h = baseImage.height;
    const rotated = rotation % 180 !== 0;
    const canvasWidth = rotated ? h : w;
    const canvasHeight = rotated ? w : h;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Apply view transformations (pan & zoom)
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    
    // 2. Draw all image-space content
    ctx.filter = `blur(${blurLevel}px) grayscale(${grayscaleLevel}%) brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`;
    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.drawImage(baseImage, -w / 2, -h / 2);
    ctx.restore();

    // Temperature/Tint overlays
    ctx.save();
    if (temperature > 0) {
        ctx.fillStyle = `rgba(255, 165, 0, ${temperature / 300})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (temperature < 0) {
        ctx.fillStyle = `rgba(0, 100, 255, ${-temperature / 300})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (tint > 0) {
        ctx.fillStyle = `rgba(0, 255, 0, ${tint / 300})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (tint < 0) {
        ctx.fillStyle = `rgba(255, 0, 255, ${-tint / 300})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.restore();

    // Draw persistent items
    paths.forEach(p => drawPath(ctx, p));
    shapes.forEach(s => drawShape(ctx, s));
    texts.forEach(t => {
        const fontWeight = t.fontWeight ?? 'normal';
        const fontStyle = t.fontStyle ?? 'normal';
        ctx.font = `${fontStyle} ${fontWeight} ${t.size}px ${t.font || 'Inter, sans-serif'}`;
        ctx.fillStyle = t.color;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(t.text, t.x, t.y);
    });

    // Draw items-in-progress
    if (interactiveState.drawingPath) drawPath(ctx, interactiveState.drawingPath);
    if (interactiveState.drawingShape) drawShape(ctx, interactiveState.drawingShape);
    
    // Draw Overlay Image
    if (overlay) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
            tempCtx.save();
            tempCtx.translate(overlay.x, overlay.y);
            tempCtx.scale(overlay.scale, overlay.scale);
            tempCtx.drawImage(overlay.image, 0, 0);
            tempCtx.restore();
            tempCtx.globalCompositeOperation = 'destination-out';
            overlay.maskPaths.forEach(path => drawPath(tempCtx, path));
            if (interactiveState.drawingMaskPath) {
                drawPath(tempCtx, interactiveState.drawingMaskPath);
            }
            ctx.save();
            ctx.globalAlpha = overlay.opacity;
            ctx.globalCompositeOperation = overlay.blendMode;
            ctx.drawImage(tempCanvas, 0, 0);
            ctx.restore();
        }
    }
    
    // 3. Restore from view transformations
    ctx.restore();

    // 4. Draw screen-space effects (not affected by zoom/pan)
    if (vignette > 0) {
        ctx.save();
        const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.width / 3, canvas.width / 2, canvas.height / 2, canvas.width);
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(1, `rgba(0,0,0,${vignette / 100})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }
    
    if (noise > 0) {
        ctx.save();
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const noiseAmount = noise * 2.55; // scale 0-100 to 0-255
        for (let i = 0; i < data.length; i += 4) {
            if (data[i+3] === 0) continue; // Skip transparent pixels
            const grain = (Math.random() - 0.5) * noiseAmount;
            data[i] += grain;
            data[i + 1] += grain;
            data[i + 2] += grain;
        }
        ctx.putImageData(imageData, 0, 0);
        ctx.restore();
    }

    // Crop rectangle UI (only drawn for the visible canvas)
    if (interactiveState.cropRectForUI) {
        ctx.save();
        const uiRect = {
            x: interactiveState.cropRectForUI.x * zoom + pan.x,
            y: interactiveState.cropRectForUI.y * zoom + pan.y,
            w: interactiveState.cropRectForUI.w * zoom,
            h: interactiveState.cropRectForUI.h * zoom,
        };
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.clearRect(uiRect.x, uiRect.y, uiRect.w, uiRect.h);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(uiRect.x, uiRect.y, uiRect.w, uiRect.h);
        ctx.restore();
    }
}


export const EditorPanel: React.FC<EditorPanelProps> = ({
    imageSrc, mimeType, isLoading, prompt, setPrompt, onAIPromptEdit, onSaveToGallery, onClear,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
    const [activeTool, setActiveTool] = useState<Tool>(null);
    const [isDirty, setIsDirty] = useState(false);

    // Editing states
    const [canvasState, setCanvasState] = useState<CanvasState>(initialCanvasState);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    
    // History states
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // UI states for tools
    const [textOptions, setTextOptions] = useState({ content: 'Hello World', color: '#FFFFFF', size: 48, fontWeight: 'normal' as 'normal' | 'bold', fontStyle: 'normal' as 'normal' | 'italic', fontFamily: 'Inter, sans-serif' });
    const [shapeOptions, setShapeOptions] = useState({ type: 'rect' as ShapeType, stroke: '#FFFFFF', strokeWidth: 4 });
    const [penOptions, setPenOptions] = useState({ color: '#FFFFFF', size: 5 });
    const [overlayToolMode, setOverlayToolMode] = useState<'move' | 'erase'>('move');
    const [eraserSize, setEraserSize] = useState(40);
    
    // Interactive states
    const [isPanning, setIsPanning] = useState(false);
    const altKeyPressed = useRef(false);
    const lastPanPoint = useRef({ x: 0, y: 0 });
    const [cropRect, setCropRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const startPoint = useRef<{ x: number, y: number } | null>(null);
    const [draggingText, setDraggingText] = useState<{ index: number, offsetX: number, offsetY: number } | null>(null);
    const [drawingShape, setDrawingShape] = useState<ShapeObject | null>(null);
    const [drawingPath, setDrawingPath] = useState<Path | null>(null);
    const [drawingMaskPath, setDrawingMaskPath] = useState<Path | null>(null);
    
    const pushToHistory = useCallback((newState: CanvasState) => {
        if (!baseImage) return;
        setHistory(prevHistory => {
            const newHistory = prevHistory.slice(0, historyIndex + 1);
            newHistory.push({ baseImageSrc: baseImage.src, state: newState });
            setHistoryIndex(newHistory.length - 1);
            return newHistory;
        });
        setIsDirty(true);
    }, [baseImage, historyIndex]);

    const applyNewBaseImage = useCallback((newBase64: string) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = newBase64;
        img.onload = () => {
            setBaseImage(img);
            const newEntry: HistoryEntry = { baseImageSrc: newBase64, state: initialCanvasState };
            setHistory(prev => {
                const newHistory = prev.slice(0, historyIndex + 1);
                newHistory.push(newEntry);
                setHistoryIndex(newHistory.length - 1);
                return newHistory;
            });
            setCanvasState(initialCanvasState);
            setIsDirty(true);
        };
    }, [historyIndex]);

    const loadState = useCallback((entry: HistoryEntry) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = entry.baseImageSrc;
        img.onload = () => {
            setBaseImage(img);
            setCanvasState(entry.state);
        }
    }, []);

    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            loadState(history[newIndex]);
            setHistoryIndex(newIndex);
        }
    }, [history, historyIndex, loadState]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            loadState(history[newIndex]);
            setHistoryIndex(newIndex);
        }
    }, [history, historyIndex, loadState]);
    
    const handleReset = useCallback(() => {
        if (!baseImage) return;
        setCanvasState(prev => {
            const newState = {...initialCanvasState, paths: [], shapes: [], texts: [], overlay: null };
            pushToHistory(newState);
            return newState;
        });
    }, [baseImage, pushToHistory]);

    const handleFitToScreen = useCallback(() => {
        if (!baseImage || !canvasContainerRef.current) return;
        const rotated = canvasState.rotation % 180 !== 0;
        const imgWidth = rotated ? baseImage.height : baseImage.width;
        const imgHeight = rotated ? baseImage.width : baseImage.height;
        
        const container = canvasContainerRef.current;
        const scaleX = container.clientWidth / imgWidth;
        const scaleY = container.clientHeight / imgHeight;
        const newZoom = Math.min(scaleX, scaleY) * 0.98; // Add a small margin
        
        setZoom(newZoom);
        setPan({
            x: (container.clientWidth - imgWidth * newZoom) / 2,
            y: (container.clientHeight - imgHeight * newZoom) / 2
        });
    }, [baseImage, canvasState.rotation]);

    // Effect to handle loading a new image
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageSrc;
        img.onload = () => {
            setBaseImage(img);
            // Reset all editing state when a new image is loaded
            const initialEntry: HistoryEntry = { baseImageSrc: imageSrc, state: initialCanvasState };
            setCanvasState(initialCanvasState);
            setHistory([initialEntry]);
            setHistoryIndex(0);
            setIsDirty(false);
            setActiveTool(null);
        };
    }, [imageSrc]);

    // Effect to manage the container's aspect ratio and fit the image when it changes or rotates
    useEffect(() => {
        if (baseImage && canvasContainerRef.current) {
            const rotated = canvasState.rotation % 180 !== 0;
            const aspectW = rotated ? baseImage.height : baseImage.width;
            const aspectH = rotated ? baseImage.width : baseImage.height;
            canvasContainerRef.current.style.aspectRatio = `${aspectW} / ${aspectH}`;
            
            // Allow the DOM to update with the new aspect ratio, then fit the image
            setTimeout(() => handleFitToScreen(), 0);
        }
    }, [baseImage, canvasState.rotation, handleFitToScreen]);


    useEffect(() => {
        if (!baseImage || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        const interactiveState = {
            cropRectForUI: cropRect,
            drawingShape,
            drawingPath,
            drawingMaskPath,
        };
        renderCanvas(ctx, canvas, baseImage, canvasState, zoom, pan, interactiveState);
    }, [baseImage, canvasState, cropRect, drawingShape, drawingPath, drawingMaskPath, zoom, pan]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Alt') { e.preventDefault(); altKeyPressed.current = true; } };
        const handleKeyUp = (e: KeyboardEvent) => { if (e.key === 'Alt') { e.preventDefault(); altKeyPressed.current = false; } };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const handleToolSelect = (tool: Tool) => {
        setActiveTool(tool);
        setIsDrawing(false);
        if (tool !== 'crop') setCropRect(null);
    };
    
    const handleAddText = useCallback(() => {
        if (!canvasRef.current) return;
        setCanvasState(prev => {
            const ctx = canvasRef.current!.getContext('2d')!;
            ctx.font = `${textOptions.fontStyle} ${textOptions.fontWeight} ${textOptions.size}px ${textOptions.fontFamily}`;
            const textWidth = ctx.measureText(textOptions.content).width;
            
            // Place text in the center of the current view
            const viewCenterX = (canvasRef.current!.clientWidth / 2 - pan.x) / zoom;
            const viewCenterY = (canvasRef.current!.clientHeight / 2 - pan.y) / zoom;
            
            const newText: TextObject = {
                id: new Date().toISOString(),
                text: textOptions.content,
                x: viewCenterX - textWidth / 2,
                y: viewCenterY,
                size: textOptions.size,
                color: textOptions.color,
                font: textOptions.fontFamily,
                fontWeight: textOptions.fontWeight,
                fontStyle: textOptions.fontStyle,
            };
            const newState = {...prev, texts: [...prev.texts, newText]};
            pushToHistory(newState);
            return newState;
        });
    }, [textOptions, pushToHistory, pan, zoom]);

    const handleApplyCrop = () => {
        if (!cropRect || !baseImage || !canvasRef.current) return;
        
        const offscreenCanvas = document.createElement('canvas');
        const offscreenCtx = offscreenCanvas.getContext('2d');
        if (!offscreenCtx) return;
        // Render at 1x zoom to capture the full resolution
        renderCanvas(offscreenCtx, offscreenCanvas, baseImage, canvasState, 1, {x:0, y:0}, { cropRectForUI: null, drawingShape: null, drawingPath: null, drawingMaskPath: null });

        const { x, y, w: cropW, h: cropH } = cropRect;
        let rectX = cropW > 0 ? x : x + cropW;
        let rectY = cropH > 0 ? y : y + cropH;
        let rectW = Math.abs(cropW);
        let rectH = Math.abs(cropH);
        
        if (rectW < 1 || rectH < 1) { setCropRect(null); return; }

        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = rectW;
        finalCanvas.height = rectH;
        const finalCtx = finalCanvas.getContext('2d');
        if (finalCtx) {
            finalCtx.drawImage(offscreenCanvas, rectX, rectY, rectW, rectH, 0, 0, rectW, rectH);
            const newDataUrl = finalCanvas.toDataURL(mimeType);
            applyNewBaseImage(newDataUrl);
        }
        setCropRect(null);
        setActiveTool(null);
    };

    const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const touch = 'touches' in e ? e.touches[0] : e;
        // Convert screen coords to canvas element coords
        const screenX = (touch.clientX - rect.left);
        const screenY = (touch.clientY - rect.top);
        // Convert canvas element coords to image space coords (considering pan and zoom)
        return {
            x: (screenX - pan.x) / zoom,
            y: (screenY - pan.y) / zoom
        };
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (altKeyPressed.current) {
            setIsPanning(true);
            const touch = 'touches' in e ? e.touches[0] : e;
            lastPanPoint.current = { x: touch.clientX, y: touch.clientY };
            return;
        }
        
        const { x, y } = getCanvasCoords(e);
        startPoint.current = { x, y };
        
        if (activeTool === 'text') {
            const ctx = canvasRef.current!.getContext('2d')!;
            for (let i = canvasState.texts.length - 1; i >= 0; i--) {
                const t = canvasState.texts[i];
                const fontWeight = t.fontWeight ?? 'normal';
                const fontStyle = t.fontStyle ?? 'normal';
                ctx.font = `${fontStyle} ${fontWeight} ${t.size}px ${t.font || 'Inter, sans-serif'}`;
                const textWidth = ctx.measureText(t.text).width;
                if (x >= t.x && x <= t.x + textWidth && y <= t.y && y >= t.y - t.size) {
                    setDraggingText({ index: i, offsetX: x - t.x, offsetY: y - t.y });
                    setIsDrawing(false);
                    return;
                }
            }
        }
        
        if (activeTool === 'overlay' && canvasState.overlay) {
            if (overlayToolMode === 'erase') {
                setIsDrawing(true);
                setDrawingMaskPath({ points: [{x,y}], color: '#000', size: eraserSize });
                return;
            } else if (overlayToolMode === 'move') {
                setIsDrawing(true);
                return;
            }
        }

        setIsDrawing(true);
        if (activeTool === 'draw') {
            setDrawingPath({ ...penOptions, points: [{ x, y }] });
        } else if (activeTool === 'crop') {
            setCropRect({ x, y, w: 0, h: 0 });
        } else if (activeTool === 'shapes') {
            setDrawingShape({ id: 'drawing', ...shapeOptions, x, y, w: 0, h: 0 });
        }
    };
    
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const touch = 'touches' in e ? e.touches[0] : e;
        if (isPanning) {
            const dx = touch.clientX - lastPanPoint.current.x;
            const dy = touch.clientY - lastPanPoint.current.y;
            setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            lastPanPoint.current = { x: touch.clientX, y: touch.clientY };
            return;
        }

        if (!isDrawing && draggingText === null) return;
        e.preventDefault();
        const { x, y } = getCanvasCoords(e);

        if (draggingText !== null) {
            const { index, offsetX, offsetY } = draggingText;
            setCanvasState(prev => {
                const newTexts = [...prev.texts];
                newTexts[index] = { ...newTexts[index], x: x - offsetX, y: y - offsetY };
                return { ...prev, texts: newTexts };
            });
        } else if (isDrawing && startPoint.current) {
             if (activeTool === 'draw' && drawingPath) {
                setDrawingPath(prev => prev ? { ...prev, points: [...prev.points, { x, y }] } : null);
            } else if (activeTool === 'crop') {
                setCropRect({ x: startPoint.current.x, y: startPoint.current.y, w: x - startPoint.current.x, h: y - startPoint.current.y });
            } else if (activeTool === 'shapes' && drawingShape) {
                const { x: startX, y: startY } = startPoint.current;
                setDrawingShape(prev => prev ? { ...prev, w: x - startX, h: y - startY } : null);
            } else if (activeTool === 'overlay' && canvasState.overlay) {
                if (overlayToolMode === 'erase' && drawingMaskPath) {
                    setDrawingMaskPath(prev => prev ? { ...prev, points: [...prev.points, {x, y}] } : null);
                } else if (overlayToolMode === 'move') {
                    const dx = x - startPoint.current.x;
                    const dy = y - startPoint.current.y;
                    setCanvasState(prev => {
                        if (!prev.overlay) return prev;
                        return { ...prev, overlay: { ...prev.overlay, x: prev.overlay.x + dx, y: prev.overlay.y + dy }};
                    });
                    startPoint.current = { x, y };
                }
            }
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
        if (isDrawing && activeTool === 'overlay' && canvasState.overlay) {
            if (overlayToolMode === 'erase' && drawingMaskPath && drawingMaskPath.points.length > 1) {
                setCanvasState(prev => {
                    if (!prev.overlay) return prev;
                    const newOverlay = { ...prev.overlay, maskPaths: [...prev.overlay.maskPaths, drawingMaskPath] };
                    const newState = { ...prev, overlay: newOverlay };
                    pushToHistory(newState);
                    return newState;
                });
            } else if (overlayToolMode === 'move') {
                pushToHistory(canvasState);
            }
            setDrawingMaskPath(null);
        }
        if (isDrawing && activeTool === 'draw' && drawingPath && drawingPath.points.length > 1) {
             setCanvasState(prev => {
                const newState = {...prev, paths: [...prev.paths, drawingPath]};
                pushToHistory(newState);
                return newState;
            });
        }
        if (isDrawing && activeTool === 'shapes' && drawingShape && (drawingShape.w !== 0 || drawingShape.h !==0)) {
            setCanvasState(prev => {
                let finalShape = {...drawingShape, id: new Date().toISOString()};
                if(finalShape.w < 0) { finalShape.x += finalShape.w; finalShape.w *= -1; }
                if(finalShape.h < 0) { finalShape.y += finalShape.h; finalShape.h *= -1; }
                const newState = {...prev, shapes: [...prev.shapes, finalShape]};
                pushToHistory(newState);
                return newState;
            });
        }
        if (draggingText) {
            pushToHistory(canvasState);
        }
        setIsDrawing(false);
        startPoint.current = null;
        setDraggingText(null);
        setDrawingShape(null);
        setDrawingPath(null);
    };

    const handleApplyAIEdit = () => {
        if (!canvasRef.current || !baseImage) return;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;
        renderCanvas(tempCtx, tempCanvas, baseImage, canvasState, 1, {x:0, y:0}, { cropRectForUI: null, drawingShape: null, drawingPath: null, drawingMaskPath: null });
        onAIPromptEdit({ base64: tempCanvas.toDataURL(mimeType).split(',')[1], mimeType });
    };

    const handleSave = () => {
        if (!canvasRef.current || !baseImage) return;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;
        renderCanvas(tempCtx, tempCanvas, baseImage, canvasState, 1, {x:0, y:0}, { cropRectForUI: null, drawingShape: null, drawingPath: null, drawingMaskPath: null });
        onSaveToGallery(tempCanvas.toDataURL(mimeType));
    };

    const handleDownload = () => {
        if (!canvasRef.current || !baseImage) return;
        const link = document.createElement('a');
        link.download = `edited-image-${Date.now()}.png`;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;
        renderCanvas(tempCtx, tempCanvas, baseImage, canvasState, 1, {x:0, y:0}, { cropRectForUI: null, drawingShape: null, drawingPath: null, drawingMaskPath: null });
        link.href = tempCanvas.toDataURL(mimeType);
        link.click();
    };

    const handleRotate = useCallback(() => {
        setCanvasState(prev => {
            const newState = {...prev, rotation: (prev.rotation + 90) % 360};
            pushToHistory(newState);
            return newState;
        });
    }, [pushToHistory]);

    const handleOverlayUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                setCanvasState(prev => {
                    if (!canvasRef.current) return prev;
                    const rotated = prev.rotation % 180 !== 0;
                    const canvasWidth = rotated ? baseImage!.height : baseImage!.width;
                    const canvasHeight = rotated ? baseImage!.width : baseImage!.height;
                    const newState = {
                        ...prev,
                        overlay: {
                            image: img,
                            x: (canvasWidth - img.width) / 2,
                            y: (canvasHeight - img.height) / 2,
                            scale: 1,
                            opacity: 0.7,
                            blendMode: 'source-over' as GlobalCompositeOperation,
                            maskPaths: [],
                        }
                    };
                    pushToHistory(newState);
                    return newState;
                });
            };
            img.src = e.target?.result as string;
        }
        reader.readAsDataURL(file);
    };

    const handleApplyOverlay = () => {
        if (!canvasRef.current || !baseImage || !canvasState.overlay) return;
        const offscreenCanvas = document.createElement('canvas');
        const offscreenCtx = offscreenCanvas.getContext('2d');
        if (!offscreenCtx) return;
        renderCanvas(offscreenCtx, offscreenCanvas, baseImage, canvasState, 1, {x:0, y:0}, { cropRectForUI: null, drawingShape: null, drawingPath: null, drawingMaskPath: null });
        const newDataUrl = offscreenCanvas.toDataURL(mimeType);
        applyNewBaseImage(newDataUrl);
        setCanvasState(prev => ({...prev, overlay: null}));
        setActiveTool(null);
    };

    const handleDiscardOverlay = () => {
        setCanvasState(prev => {
            const newState = {...prev, overlay: null};
            pushToHistory(newState);
            return newState;
        });
    };
    
    const cursorStyle = useMemo(() => {
        if (isPanning) return 'grabbing';
        if (altKeyPressed.current) return 'grab';
        if (activeTool === 'overlay') {
            if (overlayToolMode === 'move') return 'move';
            if (overlayToolMode === 'erase') return 'crosshair';
        }
        if (activeTool === 'text') return 'move';
        if (isDrawing && (activeTool === 'crop' || activeTool === 'shapes' || activeTool === 'draw')) return 'crosshair';
        return 'default';
    }, [activeTool, isDrawing, overlayToolMode, isPanning]);

    return (
        <div className="flex flex-row gap-4 md:gap-6">
            {/* Left vertical toolbar */}
            <div className="relative z-30 flex-shrink-0 bg-[rgba(var(--bg-secondary-rgb),0.6)] backdrop-blur-xl border border-[rgba(var(--border-rgb),0.1)] rounded-2xl p-2">
                <div className="flex flex-col gap-2">
                    {toolset.map((toolProps) => (
                        <ToolButton {...toolProps} key={toolProps.tool} activeTool={activeTool} onClick={handleToolSelect} />
                    ))}
                </div>
            </div>

            {/* Center canvas */}
            <div className="flex-1 relative z-10 min-w-0">
                <div ref={canvasContainerRef} className="relative w-full bg-[rgba(var(--bg-secondary-rgb),0.5)] rounded-2xl overflow-hidden shadow-2xl shadow-black/30 flex items-center justify-center ring-1 ring-inset ring-[rgba(var(--border-rgb),0.1)]">
                    <canvas ref={canvasRef} className="max-w-full max-h-full"
                      style={{ cursor: cursorStyle }}
                      onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
                      onTouchStart={handleMouseDown} onTouchMove={handleMouseMove} onTouchEnd={handleMouseUp}
                    />
                    {isLoading && (
                        <div className="absolute inset-0 bg-[rgba(var(--bg-secondary-rgb),0.7)] flex flex-col items-center justify-center backdrop-blur-sm z-20">
                            <LoadingSpinner /><p className="mt-4 text-lg text-secondary">AI is working its magic...</p>
                        </div>
                    )}
                </div>
            </div>
            {/* Right settings/prompt panel */}
            <aside className="w-full md:w-[360px] lg:w-[420px] shrink-0 flex flex-col gap-4">
                <div className="bg-[rgba(var(--bg-secondary-rgb),0.6)] backdrop-blur-xl border border-[rgba(var(--border-rgb),0.1)] p-4 rounded-2xl">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-primary">Manual Adjustments</h3>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-[rgba(var(--bg-interactive-rgb),0.8)] p-1 rounded-md">
                                    <button onClick={() => setZoom(z => z * 1.2)} className="p-1 hover:bg-[rgb(var(--bg-interactive-hover-rgb))] rounded"><ZoomInIcon/></button>
                                    <button onClick={handleFitToScreen} className="p-1 hover:bg-[rgb(var(--bg-interactive-hover-rgb))] rounded text-xs font-mono w-12 text-center">{Math.round(zoom*100)}%</button>
                                    <button onClick={() => setZoom(z => z / 1.2)} className="p-1 hover:bg-[rgb(var(--bg-interactive-hover-rgb))] rounded"><ZoomOutIcon/></button>
                                </div>
                                <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 bg-[rgba(var(--bg-interactive-rgb),0.8)] hover:bg-[rgb(var(--bg-interactive-rgb))] rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><UndoIcon/></button>
                                <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2 bg-[rgba(var(--bg-interactive-rgb),0.8)] hover:bg-[rgb(var(--bg-interactive-rgb))] rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><RedoIcon/></button>
                            </div>
                        </div>

                        <ToolOptions 
                            activeTool={activeTool} 
                            canvasState={canvasState}
                            onCanvasStateChange={setCanvasState}
                            onInteractionEnd={pushToHistory}
                            textOptions={textOptions}
                            onTextOptionsChange={setTextOptions}
                            onAddText={handleAddText}
                            shapeOptions={shapeOptions}
                            onShapeOptionsChange={setShapeOptions}
                            penOptions={penOptions}
                            onPenOptionsChange={setPenOptions}
                            onApplyCrop={handleApplyCrop}
                            onRotate={handleRotate}
                            onOverlayUpload={handleOverlayUpload}
                            overlayToolMode={overlayToolMode}
                            setOverlayToolMode={setOverlayToolMode}
                            eraserSize={eraserSize}
                            setEraserSize={setEraserSize}
                            onApplyOverlay={handleApplyOverlay}
                            onDiscardOverlay={handleDiscardOverlay}
                        />
                        <button onClick={handleReset} disabled={!isDirty} className="w-full flex items-center justify-center mt-2 px-3 py-2 bg-[rgba(var(--bg-interactive-rgb),0.8)] hover:bg-[rgb(var(--bg-interactive-rgb))] rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><ResetIcon/> Reset Edits</button>
                    </div>
                </div>

                <div className="bg-[rgba(var(--bg-secondary-rgb),0.6)] backdrop-blur-xl border border-[rgba(var(--border-rgb),0.1)] p-4 rounded-2xl space-y-4">
                    <h3 className="text-lg font-semibold text-primary">AI Magic Prompt</h3>
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., 'Make the background black and white', 'add a superhero cape'..." className="w-full h-24 p-3 bg-[rgba(var(--bg-tertiary-rgb),0.8)] border border-[rgb(var(--bg-interactive-rgb))] rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition-shadow" disabled={isLoading} />
                    <button onClick={handleApplyAIEdit} disabled={isLoading || !prompt} className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-br from-[var(--accent-gradient-from)] to-[var(--accent-gradient-to)] text-white font-semibold rounded-lg shadow-lg shadow-sky-500/10 hover:from-[var(--accent-primary)] hover:to-[var(--accent-primary)] disabled:bg-[rgb(var(--bg-interactive-rgb))] disabled:from-transparent disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200"><WandIcon />Apply AI Edit</button>
                    <div className="pt-4 border-t border-[rgba(var(--border-rgb),0.1)] grid grid-cols-2 gap-3">
                        <button onClick={handleSave} disabled={isLoading || !isDirty} className="flex items-center justify-center px-4 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-500 disabled:bg-[rgb(var(--bg-interactive-rgb))] disabled:text-muted disabled:cursor-not-allowed transition-all duration-200"><SaveIcon />Save to Gallery</button>
                        <button onClick={handleDownload} disabled={isLoading} className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 disabled:bg-[rgb(var(--bg-interactive-rgb))] disabled:text-muted transition-all duration-200"><DownloadIcon />Download</button>
                    </div>
                    <button onClick={onClear} disabled={isLoading} className="w-full flex items-center justify-center px-4 py-3 bg-[rgb(var(--bg-interactive-rgb))] text-primary font-semibold rounded-lg shadow-md hover:bg-[rgb(var(--bg-interactive-hover-rgb))] disabled:bg-[rgb(var(--bg-tertiary-rgb))] transition-all duration-200"><ClearIcon />Clear & Exit</button>
                </div>
            </aside>
        </div>
    );
};

// Memoized ToolOptions component to prevent re-renders on text input
const ToolOptions = React.memo(({
    activeTool, canvasState, onCanvasStateChange, onInteractionEnd, 
    textOptions, onTextOptionsChange, onAddText,
    shapeOptions, onShapeOptionsChange,
    penOptions, onPenOptionsChange,
    onApplyCrop, onRotate, onOverlayUpload,
    overlayToolMode, setOverlayToolMode,
    eraserSize, setEraserSize,
    onApplyOverlay, onDiscardOverlay,
}: any) => {
    const { filters, overlay } = canvasState;
    const onFilterChange = (key: keyof typeof initialFilters, value: number) => {
        onCanvasStateChange((prev: any) => ({...prev, filters: {...prev.filters, [key]: value}}));
    };

    if (!activeTool) return <div className="min-h-[220px] flex items-center justify-center rounded-lg bg-[rgba(var(--bg-tertiary-rgb),0.5)]"><p className="text-sm text-muted">Select a tool to start editing. <br/> <span className="font-semibold">Tip:</span> Hold <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Alt</kbd> and drag to pan the image.</p></div>;
    
    const sliderProps = (label: string, key: keyof typeof initialFilters, value: number, min: number, max: number, unit:string = "") => (
        <div className="space-y-2">
            <label className="text-sm font-medium text-secondary flex justify-between">
                <span>{label}</span>
                <span className="text-muted">{value}{unit}</span>
            </label>
            <input type="range" min={min} max={max} value={value} 
              onChange={(e) => onFilterChange(key, Number(e.target.value))} 
              onMouseUp={() => onInteractionEnd(canvasState)}
              onTouchEnd={() => onInteractionEnd(canvasState)}
               />
        </div>
    );

    const containerClasses = "bg-[rgba(var(--bg-tertiary-rgb),0.5)] p-3 rounded-lg space-y-4"

    switch(activeTool) {
        case 'blur': return <div className={containerClasses}>{sliderProps('Blur', 'blurLevel', filters.blurLevel, 0, 20, 'px')}</div>;
        case 'grayscale': return <div className={containerClasses}>{sliderProps('Grayscale', 'grayscaleLevel', filters.grayscaleLevel, 0, 100, '%')}</div>;
        case 'brightness': return <div className={containerClasses}>{sliderProps('Brightness', 'brightness', filters.brightness, 0, 200, '%')}</div>;
        case 'contrast': return <div className={containerClasses}>{sliderProps('Contrast', 'contrast', filters.contrast, 0, 200, '%')}</div>;
        case 'saturate': return <div className={containerClasses}>{sliderProps('Saturation', 'saturate', filters.saturate, 0, 200, '%')}</div>;
        case 'temperature': return <div className={containerClasses}>{sliderProps('Temperature', 'temperature', filters.temperature, -100, 100)}</div>;
        case 'tint': return <div className={containerClasses}>{sliderProps('Tint', 'tint', filters.tint, -100, 100)}</div>;
        case 'vignette': return <div className={containerClasses}>{sliderProps('Vignette', 'vignette', filters.vignette, 0, 100, '%')}</div>;
        case 'noise': return <div className={containerClasses}>{sliderProps('Noise', 'noise', filters.noise, 0, 100, '%')}</div>;
        case 'rotate': return <div className={containerClasses}><button onClick={onRotate} className="w-full px-3 py-2 bg-[rgb(var(--bg-interactive-rgb))] hover:bg-[rgb(var(--bg-interactive-hover-rgb))] rounded-md text-sm font-medium transition-colors">Rotate 90°</button></div>;
        case 'crop': return <div className={`${containerClasses} text-center`}><p className="text-sm text-muted mb-2">Drag on image to select an area to crop.</p><button onClick={onApplyCrop} className="w-full px-3 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-inverted rounded-md text-sm font-semibold transition-colors">Apply Crop</button></div>;
        case 'text':
            return (
                 <div className={containerClasses}>
                    <input type="text" value={textOptions.content} onChange={e => onTextOptionsChange((p: any) => ({...p, content: e.target.value}))} className="w-full bg-[rgb(var(--bg-interactive-rgb))] border-[rgb(var(--bg-interactive-hover-rgb))] border rounded-md p-2 text-sm" placeholder="Text content..." />
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-secondary">Font</label>
                        <div className="relative">
                            <select
                                value={textOptions.fontFamily}
                                onChange={e => onTextOptionsChange((p: any) => ({ ...p, fontFamily: e.target.value }))}
                                className="w-full bg-[rgb(var(--bg-interactive-rgb))] border-[rgb(var(--bg-interactive-hover-rgb))] border rounded-md p-2 text-sm appearance-none pr-8"
                                style={{ fontFamily: textOptions.fontFamily }}
                            >
                                {availableFonts.map(font => (
                                    <option key={font.name} value={font.family} style={{ fontFamily: font.family, backgroundColor: 'rgb(var(--bg-tertiary-rgb))' }}>
                                        {font.name}
                                    </option>
                                ))}
                            </select>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm flex-shrink-0">Color:</label>
                            <input type="color" value={textOptions.color} onChange={e => onTextOptionsChange((p: any) => ({...p, color: e.target.value}))} className="w-8 h-8 rounded border-none bg-transparent cursor-pointer p-0" style={{'WebkitAppearance': 'none', 'MozAppearance': 'none', appearance: 'none'}} />
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                            <label className="text-sm flex-shrink-0">Size:</label>
                            <input type="range" min="8" max="200" value={textOptions.size} onChange={e => onTextOptionsChange((p: any) => ({...p, size: Number(e.target.value)}))} className="w-full" />
                            <span className="text-xs text-muted w-10 text-right">{textOptions.size}px</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => onTextOptionsChange((p: any) => ({...p, fontWeight: p.fontWeight === 'bold' ? 'normal' : 'bold'}))}
                            className={`py-2 rounded text-sm font-bold transition-colors ${textOptions.fontWeight === 'bold' ? 'bg-[var(--accent-primary)] text-inverted' : 'bg-[rgb(var(--bg-interactive-hover-rgb))] text-primary'}`}
                        >
                            Bold
                        </button>
                        <button
                            onClick={() => onTextOptionsChange((p: any) => ({...p, fontStyle: p.fontStyle === 'italic' ? 'normal' : 'italic'}))}
                            className={`py-2 rounded text-sm italic transition-colors ${textOptions.fontStyle === 'italic' ? 'bg-[var(--accent-primary)] text-inverted' : 'bg-[rgb(var(--bg-interactive-hover-rgb))] text-primary'}`}
                        >
                            Italic
                        </button>
                    </div>
                    <button onClick={onAddText} className="w-full px-3 py-2 bg-[rgb(var(--bg-interactive-rgb))] hover:bg-[rgb(var(--bg-interactive-hover-rgb))] rounded-md text-sm font-medium transition-colors">Add Text</button>
                    <p className="text-xs text-center text-muted">Click and drag existing text on the image to move it.</p>
                </div>
            );
        case 'shapes':
            return (
                 <div className={containerClasses}>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <label className="flex items-center gap-2 p-2 bg-[rgb(var(--bg-interactive-rgb))] rounded-md"><input type="radio" name="shape-type" value="rect" checked={shapeOptions.type === 'rect'} onChange={() => onShapeOptionsChange((s:any)=>({...s, type: 'rect'}))} /> Rectangle</label>
                        <label className="flex items-center gap-2 p-2 bg-[rgb(var(--bg-interactive-rgb))] rounded-md"><input type="radio" name="shape-type" value="circle" checked={shapeOptions.type === 'circle'} onChange={() => onShapeOptionsChange((s:any)=>({...s, type: 'circle'}))} /> Circle</label>
                        <label className="flex items-center gap-2 p-2 bg-[rgb(var(--bg-interactive-rgb))] rounded-md"><input type="radio" name="shape-type" value="triangle" checked={shapeOptions.type === 'triangle'} onChange={() => onShapeOptionsChange((s:any)=>({...s, type: 'triangle'}))} /> Triangle</label>
                        <label className="flex items-center gap-2 p-2 bg-[rgb(var(--bg-interactive-rgb))] rounded-md"><input type="radio" name="shape-type" value="star" checked={shapeOptions.type === 'star'} onChange={() => onShapeOptionsChange((s:any)=>({...s, type: 'star'}))} /> Star</label>
                    </div>
                     <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2">Stroke: <input type="color" value={shapeOptions.stroke} onChange={e => onShapeOptionsChange((s: any) => ({...s, stroke: e.target.value}))} className="w-8 h-8 rounded border-none bg-transparent cursor-pointer p-0" /></label>
                        <label className="flex items-center gap-2">Width: <input type="number" min="0" max="50" value={shapeOptions.strokeWidth} onChange={e => onShapeOptionsChange((s: any) => ({...s, strokeWidth: Number(e.target.value)}))} className="w-20 bg-[rgb(var(--bg-interactive-rgb))] border-[rgb(var(--bg-interactive-hover-rgb))] border rounded-md p-1 text-sm" /></label>
                    </div>
                    <p className="text-sm text-center text-muted">Drag on the image to draw a shape.</p>
                </div>
            );
        case 'draw':
            return (
                 <div className={containerClasses}>
                    <div className="flex items-center justify-between">
                        <label className="text-sm flex items-center gap-2">Color: <input type="color" value={penOptions.color} onChange={e => onPenOptionsChange((p: any) => ({...p, color: e.target.value}))} className="w-8 h-8 rounded border-none bg-transparent cursor-pointer p-0" style={{'WebkitAppearance': 'none', 'MozAppearance': 'none', appearance: 'none'}} /></label>
                        <label className="text-sm flex items-center gap-2">Size: <input type="number" min="1" max="100" value={penOptions.size} onChange={e => onPenOptionsChange((p: any) => ({...p, size: Number(e.target.value)}))} className="w-20 bg-[rgb(var(--bg-interactive-rgb))] border-[rgb(var(--bg-interactive-hover-rgb))] border rounded-md p-2 text-sm" /></label>
                    </div>
                    <input type="range" min="1" max="100" value={penOptions.size} onChange={(e) => onPenOptionsChange((p:any) => ({...p, size: Number(e.target.value)}))} />
                    <p className="text-sm text-center text-muted">Drag on the image to draw.</p>
                </div>
            );
        case 'overlay':
            const overlayFileInputRef = React.useRef<HTMLInputElement>(null);
            const handleOverlayFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                if(e.target.files?.[0]) { onOverlayUpload(e.target.files[0]); }
            }
            if (!overlay) {
                return (
                    <div className={containerClasses}>
                         <input type="file" accept="image/*" ref={overlayFileInputRef} className="sr-only" onChange={handleOverlayFileChange} />
                         <button onClick={() => overlayFileInputRef.current?.click()} className="w-full px-3 py-2 bg-[rgb(var(--bg-interactive-rgb))] hover:bg-[rgb(var(--bg-interactive-hover-rgb))] rounded-md text-sm font-medium transition-colors">Upload Image to Overlay</button>
                    </div>
                )
            }
            return (
                <div className={containerClasses}>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setOverlayToolMode('move')} className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors ${overlayToolMode === 'move' ? 'bg-[var(--accent-primary)] text-inverted' : 'bg-[rgb(var(--bg-interactive-rgb))] hover:bg-[rgb(var(--bg-interactive-hover-rgb))]'}`}>Move / Scale</button>
                        <button onClick={() => setOverlayToolMode('erase')} className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors ${overlayToolMode === 'erase' ? 'bg-[var(--accent-primary)] text-inverted' : 'bg-[rgb(var(--bg-interactive-rgb))] hover:bg-[rgb(var(--bg-interactive-hover-rgb))]'}`}>Erase</button>
                    </div>
                    {overlayToolMode === 'erase' && (
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-secondary flex justify-between"><span>Eraser Size</span><span className="text-muted">{eraserSize}px</span></label>
                            <input type="range" min="5" max="150" value={eraserSize} onChange={e => setEraserSize(Number(e.target.value))} />
                        </div>
                    )}
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-secondary flex justify-between"><span>Opacity</span><span className="text-muted">{Math.round(overlay.opacity * 100)}%</span></label>
                        <input type="range" min="0" max="1" step="0.01" value={overlay.opacity} onChange={e => onCanvasStateChange((p:any) => ({...p, overlay: {...p.overlay, opacity: Number(e.target.value)}}))} onMouseUp={() => onInteractionEnd(canvasState)} onTouchEnd={() => onInteractionEnd(canvasState)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-secondary flex justify-between"><span>Blend Mode</span></label>
                        <select value={overlay.blendMode} onChange={e => onCanvasStateChange((p:any) => ({...p, overlay: {...p.overlay, blendMode: e.target.value as GlobalCompositeOperation}}))} onMouseUp={() => onInteractionEnd(canvasState)} className="w-full bg-[rgb(var(--bg-interactive-rgb))] border-[rgb(var(--bg-interactive-hover-rgb))] border rounded-md p-2 text-sm">
                            <option value="source-over">Normal</option><option value="multiply">Multiply</option><option value="screen">Screen</option><option value="overlay">Overlay</option><option value="darken">Darken</option><option value="lighten">Lighten</option><option value="color-dodge">Color Dodge</option><option value="color-burn">Color Burn</option><option value="hard-light">Hard Light</option><option value="soft-light">Soft Light</option><option value="difference">Difference</option><option value="exclusion">Exclusion</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[rgba(var(--border-rgb),0.1)]">
                        <button onClick={onApplyOverlay} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-inverted rounded-md text-sm font-semibold transition-colors">Apply</button>
                        <button onClick={onDiscardOverlay} className="px-3 py-2 bg-[rgb(var(--bg-interactive-rgb))] hover:bg-[rgb(var(--bg-interactive-hover-rgb))] rounded-md text-sm font-medium transition-colors">Discard</button>
                    </div>
                </div>
            );
        default: return null;
    }
});