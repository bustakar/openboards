-- Change projects.user_id from uuid -> text and point FK to auth user table
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_user_id_users_id_fk;
ALTER TABLE projects ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE projects
  ADD CONSTRAINT projects_user_id_user_id_fk
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;


