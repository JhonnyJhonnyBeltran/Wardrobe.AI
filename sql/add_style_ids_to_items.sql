-- ============================================
-- AGREGAR SOPORTE PARA ESTILOS A PRENDAS Y POSTS
-- ============================================

-- 1. Añadir array de estilos a la ropa, outfits y posts
ALTER TABLE public.clothing_items ADD COLUMN IF NOT EXISTS style_ids TEXT[] DEFAULT '{}';
ALTER TABLE public.outfits ADD COLUMN IF NOT EXISTS style_ids TEXT[] DEFAULT '{}';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS style_ids TEXT[] DEFAULT '{}';

-- 2. Insertar nuevos estilos demandados
INSERT INTO public.style_options (name, image_url, category) VALUES
('Gorpcore / Outdoor', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80', 'visual'),
('Dark Academia', 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80', 'visual'),
('Light Academia', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80', 'visual'),
('Soft Girl / Soft Boy', 'https://images.unsplash.com/photo-1616847231686-22a76203405c?w=600&q=80', 'visual'),
('Skater / Surf', 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?w=600&q=80', 'visual'),
('Cyberpunk / Y2K Tech', 'https://images.unsplash.com/photo-1511135232973-c3ee80040060?w=600&q=80', 'visual'),
('Baddie / Glam', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', 'visual')
ON CONFLICT DO NOTHING;
