-- Raw SQL to set up full text search for posts
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS posts_search_gin_idx ON posts USING GIN (search_vector);

CREATE FUNCTION posts_search_vector_trigger() RETURNS trigger AS $$
begin
  new.search_vector := to_tsvector('simple', coalesce(new.title,'') || ' ' || coalesce(new.body,''));
  return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_search_vector_update ON posts;
CREATE TRIGGER posts_search_vector_update BEFORE INSERT OR UPDATE OF title, body ON posts
FOR EACH ROW EXECUTE PROCEDURE posts_search_vector_trigger();


