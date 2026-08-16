-- 1. Crear la función que actualiza el contador
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(0, COALESCE(likes_count, 0) - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Eliminar el trigger si ya existe para evitar errores
DROP TRIGGER IF EXISTS update_likes_count_trigger ON likes;

-- 3. Crear el trigger en la tabla 'likes'
CREATE TRIGGER update_likes_count_trigger
AFTER INSERT OR DELETE ON likes
FOR EACH ROW
EXECUTE FUNCTION update_post_likes_count();

-- 4. Opcional: Recalcular todos los likes actuales por si hubo desincronizaciones en el pasado
UPDATE posts p
SET likes_count = (
  SELECT COUNT(*)
  FROM likes l
  WHERE l.post_id = p.id
);
