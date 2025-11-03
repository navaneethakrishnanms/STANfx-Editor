import type { CollageTemplate } from '../../types';

const rectPath = "M 0 0 L 1 0 L 1 1 L 0 1 Z";

export const collageTemplates: CollageTemplate[] = [
  // 2 Slots
  {
    id: 't-2-split',
    name: 'Side by Side',
    slots: 2,
    layout: [
      { bounds: { x: 0, y: 0, w: 0.5, h: 1 }, clipPath: rectPath },
      { bounds: { x: 0.5, y: 0, w: 0.5, h: 1 }, clipPath: rectPath },
    ],
  },
  {
    id: 't-2-band',
    name: 'Top & Bottom',
    slots: 2,
    layout: [
      { bounds: { x: 0, y: 0, w: 1, h: 0.5 }, clipPath: rectPath },
      { bounds: { x: 0, y: 0.5, w: 1, h: 0.5 }, clipPath: rectPath },
    ],
  },
  // 3 Slots
  {
    id: 't-3-spotlight',
    name: 'Spotlight',
    slots: 3,
    layout: [
      { bounds: { x: 0, y: 0, w: 1, h: 2/3 }, clipPath: rectPath },
      { bounds: { x: 0, y: 2/3, w: 0.5, h: 1/3 }, clipPath: rectPath },
      { bounds: { x: 0.5, y: 2/3, w: 0.5, h: 1/3 }, clipPath: rectPath },
    ],
  },
  {
    id: 't-3-side-strip',
    name: 'Side Strip',
    slots: 3,
    layout: [
      { bounds: { x: 0, y: 0, w: 2/3, h: 1 }, clipPath: rectPath },
      { bounds: { x: 2/3, y: 0, w: 1/3, h: 0.5 }, clipPath: rectPath },
      { bounds: { x: 2/3, y: 0.5, w: 1/3, h: 0.5 }, clipPath: rectPath },
    ],
  },
   {
    id: 't-3-film-vert',
    name: 'Film Strip',
    slots: 3,
    layout: [
      { bounds: { x: 0, y: 0, w: 1, h: 1/3 }, clipPath: rectPath },
      { bounds: { x: 0, y: 1/3, w: 1, h: 1/3 }, clipPath: rectPath },
      { bounds: { x: 0, y: 2/3, w: 1, h: 1/3 }, clipPath: rectPath },
    ],
  },
  // 4 Slots
  {
    id: 't-4-grid',
    name: '2x2 Grid',
    slots: 4,
    layout: [
      { bounds: { x: 0, y: 0, w: 0.5, h: 0.5 }, clipPath: rectPath },
      { bounds: { x: 0.5, y: 0, w: 0.5, h: 0.5 }, clipPath: rectPath },
      { bounds: { x: 0, y: 0.5, w: 0.5, h: 0.5 }, clipPath: rectPath },
      { bounds: { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }, clipPath: rectPath },
    ],
  },
  {
    id: 't-4-pintastic',
    name: 'Pintastic',
    slots: 4,
    layout: [
        { bounds: { x: 0, y: 0, w: 2 / 3, h: 1 }, clipPath: rectPath },
        { bounds: { x: 2 / 3, y: 0, w: 1 / 3, h: 1 / 3 }, clipPath: rectPath },
        { bounds: { x: 2 / 3, y: 1 / 3, w: 1 / 3, h: 1 / 3 }, clipPath: rectPath },
        { bounds: { x: 2 / 3, y: 2 / 3, w: 1 / 3, h: 1 / 3 }, clipPath: rectPath },
    ],
  },
  {
    id: 't-4-quad',
    name: 'Quad Panel',
    slots: 4,
    layout: [
      { bounds: { x: 0, y: 0, w: 2/3, h: 2/3 }, clipPath: rectPath },
      { bounds: { x: 2/3, y: 0, w: 1/3, h: 1/3 }, clipPath: rectPath },
      { bounds: { x: 2/3, y: 1/3, w: 1/3, h: 2/3 }, clipPath: rectPath },
      { bounds: { x: 0, y: 2/3, w: 2/3, h: 1/3 }, clipPath: rectPath },
    ],
  },
  // 5 slots
  {
    id: 't-5-mosaic',
    name: 'Mosaic',
    slots: 5,
    layout: [
      { bounds: { x: 0.25, y: 0.25, w: 0.5, h: 0.5 }, clipPath: rectPath },
      { bounds: { x: 0, y: 0, w: 0.25, h: 0.5 }, clipPath: rectPath },
      { bounds: { x: 0.75, y: 0, w: 0.25, h: 0.5 }, clipPath: rectPath },
      { bounds: { x: 0, y: 0.5, w: 0.25, h: 0.5 }, clipPath: rectPath },
      { bounds: { x: 0.75, y: 0.5, w: 0.25, h: 0.5 }, clipPath: rectPath },
    ],
  },
  {
    id: 't-5-header',
    name: 'Header Grid',
    slots: 5,
    layout: [
      { bounds: { x: 0, y: 0, w: 1, h: 0.5 }, clipPath: rectPath },
      { bounds: { x: 0, y: 0.5, w: 0.25, h: 0.5 }, clipPath: rectPath },
      { bounds: { x: 0.25, y: 0.5, w: 0.25, h: 0.5 }, clipPath: rectPath },
      { bounds: { x: 0.5, y: 0.5, w: 0.25, h: 0.5 }, clipPath: rectPath },
      { bounds: { x: 0.75, y: 0.5, w: 0.25, h: 0.5 }, clipPath: rectPath },
    ],
  },
];