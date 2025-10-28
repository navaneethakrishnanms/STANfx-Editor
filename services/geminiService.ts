import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { CollageTemplate, TextOverlay } from '../types';

// Use provided Google API key for image-to-image edits
const apiKey = 'AIzaSyC4TC6OL0K3SO5q1eJRXjwp1KPeycPIoUY';

const ai = new GoogleGenAI({ apiKey });
const imageEditModel = 'gemini-2.5-flash-image';
// Use a more powerful model for the complex visual analysis required for template generation.
const templateGenerationModel = 'gemini-2.5-pro';

// Swap editor AI Edit to OpenAI image-to-image using provided project key
export async function editImageWithGemini(base64ImageData: string, mimeType: string, prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: imageEditModel,
      contents: [{
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      }],
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    // Extract the image data from the response safely
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
        for (const part of parts) {
          if (part.inlineData) {
            return part.inlineData.data;
          }
        }
    }

    // If no image is returned, check for a text response which might contain an error or safety feedback.
    const textFeedback = response.text;
    if (textFeedback) {
      throw new Error(`AI returned a text response instead of an image: ${textFeedback}`);
    }

    throw new Error("No image data found in the Gemini API response. The response may have been blocked or was empty.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Failed to process image with Gemini API due to an unknown error.");
  }
}

// --- Collage AI Service ---
const boundsSchema = {
    type: Type.OBJECT,
    description: 'The normalized bounding box of the element.',
    properties: {
        x: { type: Type.NUMBER, description: 'Normalized horizontal position of the top-left corner (0 to 1).' },
        y: { type: Type.NUMBER, description: 'Normalized vertical position of the top-left corner (0 to 1).' },
        w: { type: Type.NUMBER, description: 'Normalized width of the element (0 to 1).' },
        h: { type: Type.NUMBER, description: 'Normalized height of the element (0 to 1).' },
    },
    required: ['x', 'y', 'w', 'h']
};

const collageSlotSchema = {
    type: Type.OBJECT,
    properties: {
        bounds: boundsSchema,
        clipPath: { 
            type: Type.STRING, 
            description: "An SVG path string for the slot's shape, normalized to a 1x1 viewBox relative to its own bounds. Use M for moveto, L for lineto, Q for quadratic Bezier, C for cubic Bezier, and Z for closepath."
        },
        isBackground: {
            type: Type.BOOLEAN,
            description: "Set to true only if this slot serves as a full-bleed background for other slots. Omit or set to false otherwise.",
            nullable: true,
        },
    },
    required: ['bounds', 'clipPath']
};

const textOverlaySchema = {
    type: Type.OBJECT,
    description: 'A decorative text element.',
    properties: {
        type: { type: Type.STRING, description: "Must be 'text'." },
        text: { type: Type.STRING, description: 'The exact text content.' },
        bounds: boundsSchema,
        fontFamily: { type: Type.STRING, description: 'The best-guess font family (e.g., "Helvetica", "Arial", "Impact").' },
        fontWeight: { type: Type.STRING, description: 'Font weight (e.g., "bold", "normal", "700").' },
        color: { type: Type.STRING, description: 'The text color in hex format (e.g., "#FFFFFF").' },
        textAlign: { type: Type.STRING, description: 'Text alignment ("left", "center", or "right").' },
        transform: { type: Type.STRING, description: 'An SVG-like transform string, e.g., "rotate(90)" for vertical text. Omit if not rotated.', nullable: true },
    },
    required: ['type', 'text', 'bounds', 'fontFamily', 'fontWeight', 'color', 'textAlign']
};

const collageTemplateSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: 'A unique identifier for the template, formatted as a slug-cased version of the name (e.g., "my-cool-template").' },
        name: { type: Type.STRING, description: 'The user-provided name for the template.' },
        slots: { type: Type.INTEGER, description: 'The total number of PHOTO slots identified in the layout.' },
        layout: {
            type: Type.ARRAY,
            items: collageSlotSchema,
            description: 'An array of objects, where each object represents a photo slot.'
        },
        overlays: {
            type: Type.ARRAY,
            description: 'An array of decorative text elements that appear on top of the photos.',
            items: textOverlaySchema,
            nullable: true
        }
    },
    required: ['id', 'name', 'slots', 'layout']
};

export async function generateCollageTemplateFromImage(base64ImageData: string, mimeType: string, templateName: string): Promise<CollageTemplate> {
  try {
    const cleanSlug = templateName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const prompt = `You are a world-class digital layout tracing specialist with an expert-level understanding of SVG paths. Your mission is to analyze an image of a collage layout and convert its visual structure into a perfectly precise JSON object.

**The user has named this template: "${templateName}". You MUST use this exact name for the 'name' field and create a slug from it for the 'id' field (e.g., "${cleanSlug}" ).**

**PRIMARY DIRECTIVE: Replicate the layout with absolute, pixel-perfect fidelity. The output must be an exact digital twin of the provided layout.**

Follow this systematic process rigorously:

**Step 1: Comprehensive Inventory**
First, mentally scan the entire image and list every distinct element you will trace. Categorize them into:
1.  **Photo Placeholders (Slots):** Areas for user photos.
2.  **Decorative Text Overlays:** Static text elements that are part of the design.

**Step 2: Precise Geometric Analysis**
For each element identified in Step 1, determine its precise geometry:
- **\`bounds\`**: Calculate the normalized bounding box (\`x\`, \`y\`, \`w\`, \`h\`) for each element, where (0,0) is the top-left and (1,1) is the bottom-right of the entire collage canvas. Maintain exact proportions.
- **Shape Description**: Verbally describe the shape of each slot. Example: "A rectangle with a wavy top edge" or "A parallelogram tilted 15 degrees".

**Step 3: Meticulous SVG Path Construction (for Photo Slots)**
This is the most critical step. For each photo slot, create an SVG \`clipPath\` string.

---
**CRITICAL RULES FOR SVG \`clipPath\`:**
---
1.  **1x1 ViewBox:** The path coordinates MUST be normalized to a \`0 0 1 1\` viewBox. This means the path is drawn relative to the slot's own bounding box. \`M 0 0\` is the top-left corner of the slot, and \`L 1 1\` is the bottom-right corner of the slot.
2.  **HIGH-FIDELITY CURVES:** When tracing curves (e.g., rounded corners, brush strokes, torn edges), you MUST use cubic (\`C\`) or quadratic (\`Q\`) Bézier commands. Use multiple, chained curve commands if necessary to perfectly replicate a complex curve. **Approximating a complex curve with a single \`C\` command or a series of straight lines (\`L\`) is a critical failure.**
3.  **NO SIMPLIFICATION:** Capture the EXACT shape. Do not simplify irregular shapes (like paint splatters or torn paper) into basic rectangles or ovals. Trace every detail.

**Example: Tracing a shape with a complex curve.**
- **FAILURE (Jagged/Inaccurate):** \`"clipPath": "M 0 1 L 0 0.5 L 0.1 0.3 ... Z"\`
- **FAILURE (Oversimplified):** \`"clipPath": "M 0 1 L 0 0.5 C 0.5 0, 0.5 0, 1 0.5 L 1 1 Z"\`
- **SUCCESS (Precise & Smooth):** \`"clipPath": "M 0 1 L 0 0.5 C 0.2 0.2, 0.4 0, 0.5 0 S 0.8 0.2, 1 0.5 L 1 1 Z"\` (Uses a Smooth cubic Bézier for a better curve)

---
**RULES FOR OTHER PROPERTIES:**
---
- **\`isBackground\`**: If a slot covers the entire canvas behind other slots, you MUST add \`"isBackground": true\`. Omit this for all other slots.
- **Decorative Text**: For \`overlays\`, capture the text content, font properties, color, and alignment as accurately as possible from visual inspection. If text is rotated, you MUST provide an SVG \`transform\` string (e.g., \`"transform": "rotate(90)"\`).

**Step 4: Final JSON Assembly**
Assemble the final JSON object strictly adhering to the provided schema. The \`slots\` property MUST be an integer equal to the number of PHOTO slots in the \`layout\` array.

**Final Self-Correction:** Before providing the output, perform a final review.
- Does the \`slots\` count match the \`layout\` array length?
- Is every single \`clipPath\` normalized to a \`0 0 1 1\` viewBox?
- Are curves smooth and complex shapes detailed?
- Are the proportions and positions of all elements identical to the source image?
- Is rotated text correctly flagged with a \`transform\` property?
Fix any discrepancies before finalizing. Your reputation for precision depends on it.`;
    
    const response = await ai.models.generateContent({
      model: templateGenerationModel,
      contents: [{
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: collageTemplateSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("The AI returned an empty response. It might have been unable to understand the layout.");
    }
    const template = JSON.parse(jsonText);

    // Final validation and override to guarantee correctness
    template.name = templateName;
    template.id = cleanSlug;
    if (template.slots !== template.layout.length) {
        console.warn("AI-generated 'slots' count mismatch; correcting automatically.", { aiCount: template.slots, actualCount: template.layout.length });
        template.slots = template.layout.length;
    }

    return template as CollageTemplate;

  } catch (error) {
    console.error("Error generating collage template with Gemini:", error);
    let errorMessage = "Failed to generate collage template with AI due to an unknown error.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    // Prepend a user-friendly message
    throw new Error(`AI Template Generation Error: ${errorMessage}`);
  }
}