-- Trust and engagement features
DO $$ BEGIN
  CREATE TYPE verification_status_enum AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE boards
  ADD COLUMN IF NOT EXISTS prize_value DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS prize_image_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS verification_status verification_status_enum NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS board_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS creator_share DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_share DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS escrow_released BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS board_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  event_type VARCHAR(120) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_board_activities_board_created_at ON board_activities(board_id, created_at DESC);

CREATE TABLE IF NOT EXISTS user_device_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(300) NOT NULL UNIQUE,
  provider VARCHAR(40) NOT NULL DEFAULT 'fcm',
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_device_tokens_user_id ON user_device_tokens(user_id);
