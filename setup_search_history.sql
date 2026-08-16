-- Create search_history table
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, query)
);

-- Enable RLS
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own search history"
ON search_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own search history"
ON search_history FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search history"
ON search_history FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own search history"
ON search_history FOR UPDATE USING (auth.uid() = user_id);

-- Create a function to maintain the maximum limit of 20 searches per user
CREATE OR REPLACE FUNCTION limit_search_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete entries older than 30 days for this user
    DELETE FROM search_history 
    WHERE user_id = NEW.user_id AND created_at < NOW() - INTERVAL '30 days';

    -- Keep only the most recent 20 entries
    DELETE FROM search_history 
    WHERE id IN (
        SELECT id FROM search_history 
        WHERE user_id = NEW.user_id 
        ORDER BY created_at DESC 
        OFFSET 20
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_limit_search_history ON search_history;
CREATE TRIGGER trigger_limit_search_history
AFTER INSERT ON search_history
FOR EACH ROW
EXECUTE FUNCTION limit_search_history();
