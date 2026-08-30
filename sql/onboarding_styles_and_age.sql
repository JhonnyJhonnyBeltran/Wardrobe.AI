-- =========================================================================
-- KLOZET: Onboarding Completo (Edad Numérica + Catálogo Extenso de 34 Estilos)
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

-- 3. Insertar o actualizar los 34 estilos con imágenes locales de outfits reales (hombre y mujer)
INSERT INTO public.style_options (name, slug, image_url, image_url_woman, image_url_man, category, is_active) VALUES
('Casual Moderno', 'casual-moderno', '/styles/women/casual-moderno.jpg', '/styles/women/casual-moderno.jpg', '/styles/men/casual-moderno.jpg', 'visual', true),
('Streetwear', 'streetwear', '/styles/men/streetwear.jpg', '/styles/women/streetwear.jpg', '/styles/men/streetwear.jpg', 'visual', true),
('Elegante / Clásico', 'elegante-clasico', '/styles/women/elegante-clasico.jpg', '/styles/women/elegante-clasico.jpg', '/styles/men/elegante-clasico.jpg', 'visual', true),
('Old Money / Quiet Luxury', 'old-money', '/styles/men/old-money.jpg', '/styles/women/old-money.jpg', '/styles/men/old-money.jpg', 'visual', true),
('Minimalista', 'minimalista', '/styles/women/minimalista.jpg', '/styles/women/minimalista.jpg', '/styles/men/minimalista.jpg', 'visual', true),
('Deportivo / Athleisure', 'deportivo-athleisure', '/styles/men/deportivo-athleisure.jpg', '/styles/women/deportivo-athleisure.jpg', '/styles/men/deportivo-athleisure.jpg', 'visual', true),
('Boho Chic', 'boho-chic', '/styles/women/boho-chic.jpg', '/styles/women/boho-chic.jpg', '/styles/men/boho-chic.jpg', 'visual', true),
('Y2K', 'y2k', '/styles/women/y2k.jpg', '/styles/women/y2k.jpg', '/styles/men/y2k.jpg', 'visual', true),
('Business Casual', 'business-casual', '/styles/men/business-casual.jpg', '/styles/women/business-casual.jpg', '/styles/men/business-casual.jpg', 'visual', true),
('Rock / Grunge', 'rock-grunge', '/styles/women/rock-grunge.jpg', '/styles/women/rock-grunge.jpg', '/styles/men/rock-grunge.jpg', 'visual', true),
('Preppy', 'preppy', '/styles/men/preppy.jpg', '/styles/women/preppy.jpg', '/styles/men/preppy.jpg', 'visual', true),
('Vintage / Retro', 'vintage-retro', '/styles/women/vintage-retro.jpg', '/styles/women/vintage-retro.jpg', '/styles/men/vintage-retro.jpg', 'visual', true),
('Cottagecore', 'cottagecore', '/styles/women/cottagecore.jpg', '/styles/women/cottagecore.jpg', '/styles/men/cottagecore.jpg', 'visual', true),
('Gótico / Alt', 'gotico-alt', '/styles/women/gotico-alt.jpg', '/styles/women/gotico-alt.jpg', '/styles/men/gotico-alt.jpg', 'visual', true),
('Techwear / Utilitario', 'techwear', '/styles/men/techwear.jpg', '/styles/women/techwear.jpg', '/styles/men/techwear.jpg', 'visual', true),
('Dark Academia', 'dark-academia', '/styles/women/dark-academia.jpg', '/styles/women/dark-academia.jpg', '/styles/men/dark-academia.jpg', 'visual', true),
('Light Academia', 'light-academia', '/styles/women/light-academia.jpg', '/styles/women/light-academia.jpg', '/styles/men/light-academia.jpg', 'visual', true),
('Skater / Surf', 'skater-surf', '/styles/men/skater-surf.jpg', '/styles/women/skater-surf.jpg', '/styles/men/skater-surf.jpg', 'visual', true),
('Clean Look', 'clean-look', '/styles/women/clean-look.jpg', '/styles/women/clean-look.jpg', '/styles/men/clean-look.jpg', 'visual', true),
('Normcore', 'normcore', '/styles/men/normcore.jpg', '/styles/women/normcore.jpg', '/styles/men/normcore.jpg', 'visual', true),
('Chic Parisino', 'chic-parisino', '/styles/women/chic-parisino.jpg', '/styles/women/chic-parisino.jpg', '/styles/men/chic-parisino.jpg', 'visual', true),
('Coastal / Resort', 'coastal-resort', '/styles/men/coastal-resort.jpg', '/styles/women/coastal-resort.jpg', '/styles/men/coastal-resort.jpg', 'visual', true),
('Western / Cowboy', 'western-cowboy', '/styles/women/western-cowboy.jpg', '/styles/women/western-cowboy.jpg', '/styles/men/western-cowboy.jpg', 'visual', true),
('K-Fashion', 'k-fashion', '/styles/women/k-fashion.jpg', '/styles/women/k-fashion.jpg', '/styles/men/k-fashion.jpg', 'visual', true),
('Harajuku / J-Fashion', 'harajuku', '/styles/women/harajuku-j-fashion.jpg', '/styles/women/harajuku-j-fashion.jpg', '/styles/men/harajuku-j-fashion.jpg', 'visual', true),
('Workwear / Americana', 'workwear-americana', '/styles/men/workwear-americana.jpg', '/styles/women/workwear-americana.jpg', '/styles/men/workwear-americana.jpg', 'visual', true),
('Coquette', 'coquette', '/styles/women/coquette.jpg', '/styles/women/coquette.jpg', '/styles/men/coquette.jpg', 'visual', true),
('Baddie / Glam', 'baddie-glam', '/styles/women/baddie-glam.jpg', '/styles/women/baddie-glam.jpg', '/styles/men/baddie-glam.jpg', 'visual', true),
('Maximalista', 'maximalista', '/styles/women/maximalista.jpg', '/styles/women/maximalista.jpg', '/styles/men/maximalista.jpg', 'visual', true),
('Gorpcore / Outdoor', 'gorpcore', '/styles/men/gorpcore-outdoor.jpg', '/styles/women/gorpcore-outdoor.jpg', '/styles/men/gorpcore-outdoor.jpg', 'visual', true),
('Noche / Fiesta', 'party-noche', '/styles/women/noche-fiesta.jpg', '/styles/women/noche-fiesta.jpg', '/styles/men/noche-fiesta.jpg', 'visual', true),
('Smart Casual', 'smart-casual', '/styles/men/smart-casual.jpg', '/styles/women/smart-casual.jpg', '/styles/men/smart-casual.jpg', 'visual', true),
('Soft Girl / Soft Boy', 'soft-girl-boy', '/styles/women/soft-girl-boy.jpg', '/styles/women/soft-girl-boy.jpg', '/styles/men/soft-girl-boy.jpg', 'visual', true),
('Cyberpunk / Y2K Tech', 'cyberpunk', '/styles/men/cyberpunk.jpg', '/styles/women/cyberpunk.jpg', '/styles/men/cyberpunk.jpg', 'visual', true)

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  image_url = EXCLUDED.image_url,
  image_url_woman = EXCLUDED.image_url_woman,
  image_url_man = EXCLUDED.image_url_man,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active;
