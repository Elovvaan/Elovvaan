DO $$ BEGIN
  CREATE TYPE winner_claim_status_enum AS ENUM ('PENDING', 'CLAIMED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE wallet_transaction_type_enum AS ENUM ('CREDIT', 'DEBIT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE winners
  ADD COLUMN IF NOT EXISTS selection_seed VARCHAR(64),
  ADD COLUMN IF NOT EXISTS selection_candidate_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS selection_index INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS claim_status winner_claim_status_enum NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS wallet_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance_cents INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_account_id UUID NOT NULL REFERENCES wallet_accounts(id) ON DELETE CASCADE,
  type wallet_transaction_type_enum NOT NULL,
  amount_cents INT NOT NULL,
  balance_after_cents INT NOT NULL,
  reason VARCHAR(120) NOT NULL,
  reference_id VARCHAR(160) NOT NULL UNIQUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_account_id ON wallet_transactions(wallet_account_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_winners_board_id ON winners(board_id);
