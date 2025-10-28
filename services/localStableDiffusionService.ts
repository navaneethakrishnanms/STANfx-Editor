export type LocalTxt2ImgOptions = {
    baseUrl?: string; // e.g., http://127.0.0.1:7860
    width?: number;
    height?: number;
    steps?: number;
    cfgScale?: number;
    negativePrompt?: string;
    seed?: number;
};

// Calls Automatic1111 Stable Diffusion WebUI txt2img API
// https://github.com/AUTOMATIC1111/stable-diffusion-webui
export async function generateImageFromTextLocal(prompt: string, options: LocalTxt2ImgOptions = {}): Promise<string> {
    const {
        baseUrl = (typeof window !== 'undefined' && window.localStorage?.getItem('SD_LOCAL_BASE_URL')) || (process.env.SD_LOCAL_BASE_URL || 'http://127.0.0.1:7860'),
        width = 768,
        height = 768,
        steps = 30,
        cfgScale = 7,
        negativePrompt = '',
        seed,
    } = options;

    // Use dev proxy when path starts with /sdapi (Vite will forward to baseUrl)
    const useProxy = baseUrl === 'proxy' || baseUrl.startsWith('/');
    const url = useProxy ? `/sdapi/v1/txt2img` : `${baseUrl.replace(/\/$/, '')}/sdapi/v1/txt2img`;
    const body: any = {
        prompt,
        negative_prompt: negativePrompt,
        steps,
        width,
        height,
        cfg_scale: cfgScale,
    };
    if (seed !== undefined) body.seed = seed;

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`Local Stable Diffusion error: ${res.status} ${res.statusText} ${t}`);
    }
    const data = await res.json();
    const base64 = data?.images?.[0];
    if (!base64) throw new Error('Local Stable Diffusion returned no image.');
    return `data:image/png;base64,${base64}`;
}

export function saveLocalSdBaseUrl(url: string) {
    try { window.localStorage?.setItem('SD_LOCAL_BASE_URL', url); } catch {}
}


