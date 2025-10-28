// Hugging Face Inference API client for text-to-image using
// runwayml/stable-diffusion-v1-5 to mirror the Python diffusers example.

function getHfToken(): string | null {
    const envKey = process.env.HF_API_TOKEN || process.env.VITE_HF_API_TOKEN || null;
    if (envKey) return envKey;
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem('HF_API_TOKEN');
        }
    } catch {}
    return null;
}

export function saveHfToken(token: string) {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('HF_API_TOKEN', token);
        }
    } catch {}
}

export type HFTextToImageOptions = {
    model?: string; // defaults to runwayml/stable-diffusion-v1-5
};

export async function generateImageFromTextHF(prompt: string, options: HFTextToImageOptions = {}): Promise<string> {
    const token = getHfToken();
    if (!token) {
        throw new Error('HF_API_TOKEN not set. Add it in settings.');
    }
    const model = options.model || 'runwayml/stable-diffusion-v1-5';
    const endpoint = `https://api-inference.huggingface.co/models/${model}`;
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'image/png',
        },
        body: JSON.stringify({ inputs: prompt, options: { wait_for_model: true } }),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Hugging Face API error: ${res.status} ${res.statusText} ${text}`);
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


