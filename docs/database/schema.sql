-- ============================================================
-- 宠记 (Pet Record) — Supabase 数据库表结构
-- ============================================================
-- 使用方法：在 Supabase 后台 → SQL Editor 中粘贴执行
-- 用户表由 Supabase Auth 自动管理（auth.users），无需手动创建
-- ============================================================

-- 1. 宠物档案表
CREATE TABLE IF NOT EXISTS pets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  category_id   TEXT NOT NULL DEFAULT 'cat',
  custom_breed  TEXT,
  gender        TEXT CHECK (gender IN ('female', 'male', 'unknown')),
  birth_date    DATE,
  birth_date_type TEXT DEFAULT 'unknown',
  birth_year    INT,
  birth_month   INT,
  home_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  avatar        TEXT,  -- base64 data URL
  invite_code   TEXT NOT NULL UNIQUE,
  shared_ids    UUID[] DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 动态帖子表
CREATE TABLE IF NOT EXISTS posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id        UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  pet_ids       UUID[] DEFAULT '{}',  -- 多宠物动态
  author_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content       TEXT DEFAULT '',
  media         TEXT[] DEFAULT '{}',  -- base64 data URLs
  is_ai         BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. 评论表
CREATE TABLE IF NOT EXISTS comments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. 点赞表
CREATE TABLE IF NOT EXISTS likes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name     TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)  -- 同一用户对同一帖子只能点赞一次
);

-- 5. 里程碑（健康事件）表
CREATE TABLE IF NOT EXISTS milestones (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id          UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  author_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type            TEXT NOT NULL CHECK (type IN ('home', 'vaccine', 'deworm', 'bath', 'neuter', 'anniversary', 'weight', 'medical', 'abnormal', 'other')),
  title           TEXT NOT NULL,
  description     TEXT,
  date            DATE NOT NULL,
  icon            TEXT,
  metrics         JSONB DEFAULT '{}',
  is_ai           BOOLEAN DEFAULT false,
  reminder_interval INT DEFAULT 0, -- 天，0=不提醒
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. 表情包表
CREATE TABLE IF NOT EXISTS memes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id        UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  author_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image         TEXT NOT NULL,
  style         TEXT DEFAULT 'default',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 索引
-- ============================================================
CREATE INDEX idx_pets_owner ON pets(owner_id);
CREATE INDEX idx_pets_invite ON pets(invite_code);
CREATE INDEX idx_posts_pet ON posts(pet_id);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_likes_post ON likes(post_id);
CREATE INDEX idx_milestones_pet ON milestones(pet_id);
CREATE INDEX idx_milestones_date ON milestones(date DESC);
CREATE INDEX idx_memes_pet ON memes(pet_id);

-- ============================================================
-- 触发器：自动更新 updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS（Row Level Security）策略
-- ============================================================
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;

-- pets：owner 全部权限，shared user 可读
CREATE POLICY "owner_full_access" ON pets
  FOR ALL USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "shared_read_access" ON pets
  FOR SELECT USING (auth.uid() = ANY(shared_ids));

-- posts：宠物 owner 或 shared user 可读写
CREATE POLICY "pet_members_access" ON posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = posts.pet_id
        AND (pets.owner_id = auth.uid() OR auth.uid() = ANY(pets.shared_ids))
    )
  );

-- comments：同 posts
CREATE POLICY "pet_members_access" ON comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM posts
      JOIN pets ON pets.id = posts.pet_id
      WHERE comments.post_id = posts.id
        AND (pets.owner_id = auth.uid() OR auth.uid() = ANY(pets.shared_ids))
    )
  );

-- likes：同 posts
CREATE POLICY "pet_members_access" ON likes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM posts
      JOIN pets ON pets.id = posts.pet_id
      WHERE likes.post_id = posts.id
        AND (pets.owner_id = auth.uid() OR auth.uid() = ANY(pets.shared_ids))
    )
  );

-- milestones：同 posts
CREATE POLICY "pet_members_access" ON milestones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = milestones.pet_id
        AND (pets.owner_id = auth.uid() OR auth.uid() = ANY(pets.shared_ids))
    )
  );

-- memes：同 posts
CREATE POLICY "pet_members_access" ON memes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = memes.pet_id
        AND (pets.owner_id = auth.uid() OR auth.uid() = ANY(pets.shared_ids))
    )
  );
