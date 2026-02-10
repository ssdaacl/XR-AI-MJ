
import { InteriorCase } from './types';

export const CASES: InteriorCase[] = [
  {
    id: 'nordic-silence',
    title: 'Nordic Silence',
    subtitle: 'Minimalist living with soft-diffused morning light',
    description: 'A study in monochromatic textures and spatial breathing. This project explores the intersection of raw concrete and warm oak.',
    mainImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1600',
    gallery: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1600',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1600',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=1600'
    ],
    hotspots: [
      { id: '1', x: 30, y: 60, label: 'Børge Mogensen Chair', description: 'Hand-crafted oak frame with natural leather upholstery, adding organic warmth to the cool concrete.' },
      { id: '2', x: 70, y: 40, label: 'Louvered Window', description: 'Strategic timber slats that fragment the morning light into architectural shadows.' },
      { id: '3', x: 50, y: 80, label: 'Seamless Concrete', description: 'Polished micro-cement finish with zero visible joints for an infinite floor feel.' }
    ],
    prompts: {
      lighting: 'Volumetric morning sunlight, soft-diffused through timber slats, high-contrast shadows, cinematic atmosphere, 8k, ray tracing.',
      composition: 'Eye-level architectural photography, wide-angle lens, symmetrical balance, negative space focus, clean lines.',
      materials: 'Polished micro-cement floor, light white oak grain, bouclé fabric texture, brushed steel accents.',
      camera: 'Phase One XF, 35mm lens, f/8, ISO 100, professional interior photography style.',
      negative: 'Blurry, distorted furniture, messy, cluttered, dark, low resolution, oversaturated.'
    }
  },
  {
    id: 'zenith-penthouse',
    title: 'Zenith Penthouse',
    subtitle: 'Sophisticated dark wood and dramatic shadows',
    description: 'An exploration of obsidian tones and metallic highlights, designed for late-night city viewing.',
    mainImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1600',
    gallery: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1600',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1600',
      'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&q=80&w=1600'
    ],
    hotspots: [
      { id: 'h1', x: 45, y: 55, label: 'Marble Coffee Table', description: 'Italian Nero Marquina marble with deep white veining, reflecting ambient ceiling lights.' },
      { id: 'h2', x: 20, y: 30, label: 'Ambient LED Strips', description: 'Recessed 2700K warm lighting providing a floating effect to the cabinetry.' }
    ],
    prompts: {
      lighting: 'Moody low-key lighting, ambient warm glows, city lights reflection, dramatic chiaroscuro, photorealistic.',
      composition: 'Low angle shot, emphasizing ceiling height, leading lines towards the window view.',
      materials: 'Dark walnut wood, black marble, brass trim, velvet curtains.',
      camera: 'Hasselblad H6D, 50mm, f/11, long exposure.',
      negative: 'Sunlight, bright, colorful, cheap furniture, plastic.'
    }
  }
];
