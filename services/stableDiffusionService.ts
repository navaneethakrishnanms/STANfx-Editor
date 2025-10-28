import type { } from '../types';

// Simple client for Stability AI's Stable Diffusion text-to-image API.
// Retrieves key from env or browser localStorage. Returns a data URL string.

function getStabilityApiKey(): string | null {
    // Hardcoded T2I Stability key (per user request)
    const HARDCODED_API_KEY = 'sk-ZDXynAVq6PETBBjRprUJTNYVKuliJK5CLKbUNfPFx8lgVbMn';
    if (HARDCODED_API_KEY) return HARDCODED_API_KEY;
    const envKey = process.env.STABILITY_API_KEY || process.env.VITE_STABILITY_API_KEY || null;
    if (envKey) return envKey;
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem('STABILITY_API_KEY');
        }
    } catch {}
    return null;
}

export function saveStabilityApiKey(key: string) {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('STABILITY_API_KEY', key);
        }
    } catch {}
}

export type TextToImageOptions = {
    negativePrompt?: string;
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    outputFormat?: 'png' | 'webp' | 'jpeg';
};

export async function generateImageFromText(prompt: string, options: TextToImageOptions = {}): Promise<string> {
    const STABILITY_API_KEY = getStabilityApiKey();
    if (!STABILITY_API_KEY) {
        throw new Error('STABILITY_API_KEY not set. Add it in settings.');
    }

    const { negativePrompt = '', aspectRatio = '1:1', outputFormat = 'png' } = options;

    // Use Stability v2beta core endpoint (no engine ID required)
    const endpoint = 'https://api.stability.ai/v2beta/stable-image/generate/core';
    const form = new FormData();
    form.append('prompt', prompt);
    if (negativePrompt) form.append('negative_prompt', negativePrompt);
    form.append('output_format', outputFormat);
    form.append('aspect_ratio', aspectRatio);

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${STABILITY_API_KEY}`,
            'Accept': 'image/*'
        },
        body: form as any,
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Stable Diffusion API error: ${res.status} ${res.statusText} ${text}`);
    }
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
    return dataUrl;
}

// --- Image to Image (Editor) ---
export async function editImageToImage(base64ImageData: string, mimeType: string, prompt: string): Promise<string> {
    const STABILITY_API_KEY = getStabilityApiKey();
    if (!STABILITY_API_KEY) {
        throw new Error('STABILITY_API_KEY not set.');
    }
    const endpoint = 'https://api.stability.ai/v2beta/stable-image/edit/transform';

    // Convert base64 -> Blob
    const byteString = atob(base64ImageData);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) intArray[i] = byteString.charCodeAt(i);
    const blob = new Blob([intArray], { type: mimeType || 'image/png' });
    const file = new File([blob], 'source.png', { type: mimeType || 'image/png' });

    const form = new FormData();
    form.append('image', file);
    form.append('prompt', prompt);
    form.append('output_format', 'png');

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${STABILITY_API_KEY}`,
            'Accept': 'image/*'
        },
        body: form as any,
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Stable Diffusion API error: ${res.status} ${res.statusText} ${text}`);
    }
    const outBlob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(outBlob);
    });
    return dataUrl;
}


