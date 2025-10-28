// --- App types ---
export interface ImageFile {
  base64: string;
  mimeType: string;
  name: string;
}

export interface EditedImage {
  id: string;
  src: string;
  prompt: string;
  originalName: string;
}

// --- Login types ---
export interface User {
    username: string;
    passwordHash: string;
    role: 'admin' | 'user';
}

// --- Editor types ---
export interface TextObject {
    id: string;
    text: string;
    x: number;
    y: number;
    size: number;
    color: string;
    font?: string;
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
}

export type ShapeType = 'rect' | 'circle' | 'triangle' | 'star';

export interface ShapeObject {
    id: string;
    type: ShapeType;
    x: number;
    y: number;
    w: number;
    h: number;
    stroke: string;
    strokeWidth: number;
}

export interface Path {
    points: { x: number; y: number }[];
    color: string;
    size: number;
}


// --- Collage types ---
export interface CollageImage {
    image: HTMLImageElement;
    x: number;
    y: number;
    scale: number;
}

export interface CollageSlot {
    bounds: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    clipPath: string;
    isBackground?: boolean;
}

export interface TextOverlay {
    type: 'text';
    text: string;
    bounds: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    fontFamily: string;
    fontWeight: string;
    color: string;
    textAlign: string;
    transform?: string;
}

export interface CollageTemplate {
    id: string;
    name: string;
    slots: number;
    layout: CollageSlot[];
    overlays?: TextOverlay[];
}