-- ============================================
-- SQL DE DATA SEEDING (Poblar Base de Datos)
-- ============================================
-- Este script inserta ropa y outfits de prueba para TODOS los usuarios existentes.
-- Ejecutar DESPUÉS de reset_schema.sql y crear usuarios.

DO $$
DECLARE
  r RECORD;
  -- Variables para IDs de las prendas insertadas
  t_shirt_id UUID;
  jeans_id UUID;
  sneakers_id UUID;
  jacket_id UUID;
  dress_id UUID;
  heels_id UUID;
  bag_id UUID;
  glasses_id UUID;
  outfit_casual_id UUID;
  outfit_formal_id UUID;
BEGIN
  -- Iterar sobre cada usuario existente en AUTH.USERS
  FOR r IN SELECT id FROM auth.users LOOP
    
    RAISE NOTICE 'Poblando datos para usuario: %', r.id;

    -- ============================================
    -- 1. INSERTAR PRENDAS (Clothing Items)
    -- ============================================

    -- Top: Camiseta Blanca
    INSERT INTO public.clothing_items (user_id, name, category, color, season, image_url, brand, tags)
    VALUES (r.id, 'Camiseta Blanca Básica', 'top', 'white', ARRAY['spring', 'summer', 'fall', 'winter'], 
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80',
            'Uniqlo', ARRAY['basico', 'algodon'])
    RETURNING id INTO t_shirt_id;

    -- Bottom: Jeans Clásicos
    INSERT INTO public.clothing_items (user_id, name, category, color, season, image_url, brand, tags)
    VALUES (r.id, 'Jeans Azul Clásico', 'bottom', 'blue', ARRAY['spring', 'summer', 'fall', 'winter'], 
            'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&w=500&q=80',
            'Levi''s', ARRAY['denim', 'casual'])
    RETURNING id INTO jeans_id;

    -- Shoes: Sneakers Blancas
    INSERT INTO public.clothing_items (user_id, name, category, color, season, image_url, brand, tags)
    VALUES (r.id, 'Zapatillas Blancas', 'shoes', 'white', ARRAY['spring', 'summer', 'fall'], 
            'https://images.unsplash.com/photo-1560769629-975e13f0c470?auto=format&fit=crop&w=500&q=80',
            'Nike', ARRAY['sport', 'comodo'])
    RETURNING id INTO sneakers_id;

    -- Outerwear: Chaqueta de Cuero
    INSERT INTO public.clothing_items (user_id, name, category, color, season, image_url, brand, tags)
    VALUES (r.id, 'Chaqueta de Cuero Negra', 'outerwear', 'black', ARRAY['fall', 'winter'], 
            'https://images.unsplash.com/photo-1551028919-ac7fa7a40d4f?auto=format&fit=crop&w=500&q=80',
            'Zara', ARRAY['noche', 'rock'])
    RETURNING id INTO jacket_id;

    -- Dress: Vestido Floral (Para variar, aunque el usuario sea hombre, es 'wardrobe' genérico o se podría filtrar por gender en perfil si existiera validación)
    INSERT INTO public.clothing_items (user_id, name, category, color, season, image_url, brand, tags)
    VALUES (r.id, 'Vestido Verano Floral', 'dress', 'pink', ARRAY['spring', 'summer'], 
            'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=500&q=80',
            'H&M', ARRAY['floral', 'ligero'])
    RETURNING id INTO dress_id;

    -- Shoes: Tacones (O Zapatos de vestir)
    INSERT INTO public.clothing_items (user_id, name, category, color, season, image_url, brand, tags)
    VALUES (r.id, 'Zapatos Elegantes', 'shoes', 'black', ARRAY['fall', 'winter', 'spring'], 
            'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=80',
            'Aldo', ARRAY['fiesta', 'oficina'])
    RETURNING id INTO heels_id;

    -- Accessory: Bolso
    INSERT INTO public.clothing_items (user_id, name, category, color, season, image_url, brand, tags)
    VALUES (r.id, 'Bolso de Mano Beige', 'accessory', 'beige', ARRAY['all-season'], 
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80',
            'Gucci', ARRAY['lujo', 'trabajo'])
    RETURNING id INTO bag_id;
    
    -- Accessory: Gafas de Sol
    INSERT INTO public.clothing_items (user_id, name, category, color, season, image_url, brand, tags)
    VALUES (r.id, 'Gafas de Sol Ray-Ban', 'accessory', 'black', ARRAY['summer', 'spring'], 
            'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=500&q=80',
            'Ray-Ban', ARRAY['sol', 'playa'])
    RETURNING id INTO glasses_id;

    -- ============================================
    -- 2. CREAR OUTFITS
    -- ============================================

    -- Outfit 1: Casual Diario
    INSERT INTO public.outfits (user_id, name, description, occasion, season, is_public, favorite)
    VALUES (r.id, 'Sunday Brunch', 'Look relajado para el domingo', 'casual', 'spring', true, true)
    RETURNING id INTO outfit_casual_id;

    -- Items del Outfit 1
    INSERT INTO public.outfit_items (outfit_id, clothing_item_id, position_x, position_y, scale, rotation, layer_order)
    VALUES 
    (outfit_casual_id, t_shirt_id, 50, 30, 1.0, 0, 1),
    (outfit_casual_id, jeans_id, 50, 70, 1.0, 0, 2),
    (outfit_casual_id, sneakers_id, 80, 80, 0.8, -15, 3),
    (outfit_casual_id, glasses_id, 50, 15, 0.6, 0, 4);


    -- Outfit 2: Noche de Fiesta
    INSERT INTO public.outfits (user_id, name, description, occasion, season, is_public, favorite)
    VALUES (r.id, 'Night Out Rocker', 'Estilo rockero para salir', 'party', 'winter', false, false)
    RETURNING id INTO outfit_formal_id;

    -- Items del Outfit 2
    INSERT INTO public.outfit_items (outfit_id, clothing_item_id, position_x, position_y, scale, rotation, layer_order)
    VALUES 
    (outfit_formal_id, jacket_id, 50, 40, 1.1, 0, 2),
    (outfit_formal_id, t_shirt_id, 48, 40, 1.0, 0, 1), -- Camiseta debajo de chaqueta
    (outfit_formal_id, jeans_id, 50, 80, 1.0, 0, 1),
    (outfit_formal_id, bag_id, 20, 60, 0.9, 10, 3);

  END LOOP;

  -- ============================================
  -- 3. CREAR CONVERSACIONES (Si hay más de 1 usuario)
  -- ============================================
  DECLARE
    user1 UUID;
    user2 UUID;
    conv_id UUID;
  BEGIN
    SELECT id INTO user1 FROM auth.users LIMIT 1;
    SELECT id INTO user2 FROM auth.users WHERE id != user1 LIMIT 1;

    -- Solo crear si existen al menos 2 usuarios
    IF user1 IS NOT NULL AND user2 IS NOT NULL THEN
      RAISE NOTICE 'Creando conversación entre % y %', user1, user2;

      -- Crear Conversación
      INSERT INTO public.conversations (participant1_id, participant2_id, last_message_text, last_message_sender_id, last_message_at)
      VALUES (
        LEAST(user1, user2), -- Ordenar IDs
        GREATEST(user1, user2),
        '¡Me encanta tu último outfit!',
        user1,
        NOW()
      )
      RETURNING id INTO conv_id;

      -- Insertar Mensajes
      INSERT INTO public.messages (conversation_id, sender_id, content, created_at) VALUES
      (conv_id, user1, '¡Hola! ¿Qué tal?', NOW() - INTERVAL '1 hour'),
      (conv_id, user2, '¡Hola! Todo bien, ¿y tú?', NOW() - INTERVAL '55 minutes'),
      (conv_id, user1, '¡Me encanta tu último outfit!', NOW());
      
    END IF;
  END;

  -- ============================================
  -- 4. CREAR GUARDADOS (SAVES)
  -- ============================================
  -- Guardar un outfit (el casual)
  INSERT INTO public.saves (user_id, outfit_id)
  VALUES (r.id, outfit_casual_id)
  ON CONFLICT DO NOTHING;


END $$;
