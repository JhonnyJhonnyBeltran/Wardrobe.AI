-- =========================================================================
-- KLOZET: Onboarding Completo (Edad Numérica + Catálogo Extenso de Estilos)
-- Ejecutar en Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- =========================================================================

-- 1. Añadir columna de edad numérica a la tabla profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age INTEGER CHECK (age >= 13 AND age <= 100);

-- 2. Asegurar columnas de imágenes diferenciadas por género en style_options
ALTER TABLE public.style_options
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS image_url_man TEXT,
  ADD COLUMN IF NOT EXISTS image_url_woman TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS style_options_slug_key ON public.style_options (slug);

-- 3. Insertar o actualizar los 32 estilos con imágenes de personas (hombre y mujer)
INSERT INTO public.style_options (name, slug, image_url, image_url_woman, image_url_man, category, is_active) VALUES
('Casual Moderno', 'casual-moderno', 
 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80',
 'visual', true),

('Streetwear', 'streetwear', 
 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=80',
 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80',
 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=80',
 'visual', true),

('Elegante / Clásico', 'elegante-clasico', 
 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&q=80',
 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&q=80',
 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80',
 'visual', true),

('Old Money / Quiet Luxury', 'old-money', 
 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80',
 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80',
 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80',
 'visual', true),

('Minimalista', 'minimalista', 
 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80',
 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80',
 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=600&q=80',
 'visual', true),

('Deportivo / Athleisure', 'deportivo-athleisure', 
 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=80',
 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=80',
 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
 'visual', true),

('Boho Chic', 'boho-chic', 
 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80',
 'https://images.unsplash.com/photo-1529139579449-5573c3260b5c?w=600&q=80',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80',
 'visual', true),

('Y2K', 'y2k', 
 'https://images.unsplash.com/photo-1616847231686-22a76203405c?w=600&q=80',
 'https://images.unsplash.com/photo-1616847231686-22a76203405c?w=600&q=80',
 'https://images.unsplash.com/photo-1611042553365-9b101441c135?w=600&q=80',
 'visual', true),

('Business Casual', 'business-casual', 
 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80',
 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80',
 'https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=600&q=80',
 'visual', true),

('Rock / Grunge', 'rock-grunge', 
 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80',
 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80',
 'https://images.unsplash.com/photo-1536766820879-059fec98ec0a?w=600&q=80',
 'visual', true),

('Preppy', 'preppy', 
 'https://images.unsplash.com/photo-1550614000-4b9519e6022e?w=600&q=80',
 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&q=80',
 'https://images.unsplash.com/photo-1550614000-4b9519e6022e?w=600&q=80',
 'visual', true),

('Vintage / Retro', 'vintage-retro', 
 'https://images.unsplash.com/photo-1529374255404-31176343895d?w=600&q=80',
 'https://images.unsplash.com/photo-1529374255404-31176343895d?w=600&q=80',
 'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?w=600&q=80',
 'visual', true),

('Cottagecore', 'cottagecore', 
 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80',
 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80',
 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80',
 'visual', true),

('Gótico / Alt', 'gotico-alt', 
 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=600&q=80',
 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=600&q=80',
 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=600&q=80',
 'visual', true),

('Techwear / Utilitario', 'techwear', 
 'https://images.unsplash.com/photo-1511135232973-c3ee80040060?w=600&q=80',
 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80',
 'https://images.unsplash.com/photo-1511135232973-c3ee80040060?w=600&q=80',
 'visual', true),

('Dark Academia', 'dark-academia', 
 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80',
 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80',
 'visual', true),

('Light Academia', 'light-academia', 
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80',
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80',
 'visual', true),

('Skater / Surf', 'skater-surf', 
 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?w=600&q=80',
 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?w=600&q=80',
 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80',
 'visual', true),

('Clean Look', 'clean-look', 
 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',
 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80',
 'visual', true),

('Normcore', 'normcore', 
 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=600&q=80',
 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=600&q=80',
 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&q=80',
 'visual', true),

('Chic Parisino', 'chic-parisino', 
 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80',
 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80',
 'visual', true),

('Coastal / Resort', 'coastal-resort', 
 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&q=80',
 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&q=80',
 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80',
 'visual', true),

('Western / Cowboy', 'western-cowboy', 
 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600&q=80',
 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600&q=80',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
 'visual', true),

('K-Fashion', 'k-fashion', 
 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&q=80',
 'visual', true),

('Harajuku / J-Fashion', 'harajuku', 
 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80',
 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80',
 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&q=80',
 'visual', true),

('Workwear / Americana', 'workwear-americana', 
 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
 'visual', true),

('Coquette', 'coquette', 
 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80',
 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80',
 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80',
 'visual', true),

('Baddie / Glam', 'baddie-glam', 
 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80',
 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
 'visual', true),

('Maximalista', 'maximalista', 
 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80',
 'visual', true),

('Gorpcore / Outdoor', 'gorpcore', 
 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80',
 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
 'visual', true),

('Noche / Fiesta', 'party-noche', 
 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600&q=80',
 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600&q=80',
 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80',
 'visual', true),

('Smart Casual', 'smart-casual', 
 'https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=600&q=80',
 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80',
 'https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=600&q=80',
 'visual', true)

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url,
  image_url_woman = EXCLUDED.image_url_woman,
  image_url_man = EXCLUDED.image_url_man,
  category = EXCLUDED.category,
  is_active = true;

-- 4. Migración de compatibilidad para usuarios existentes con age_range legacy
UPDATE public.profiles SET age = 16 WHERE age IS NULL AND age_range = 'under_18';
UPDATE public.profiles SET age = 21 WHERE age IS NULL AND age_range IN ('18_24', '18-24');
UPDATE public.profiles SET age = 30 WHERE age IS NULL AND age_range IN ('25_34', '25-34');
UPDATE public.profiles SET age = 40 WHERE age IS NULL AND age_range IN ('35_44', '35-44');
UPDATE public.profiles SET age = 52 WHERE age IS NULL AND age_range IN ('45_plus', '45-54', '55+');
