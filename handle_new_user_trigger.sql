-- Trigger to handle new user creation
-- Automatically creates a profile entry when a new user signs up via Auth

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into profiles (New Social Table)
  INSERT INTO public.profiles (id, full_name, username, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'avatar_url'
  );

  -- Insert into users (Legacy Table - Keeping for compatibility)
  INSERT INTO public.users (id, email, name, avatar)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'avatar_url'
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
