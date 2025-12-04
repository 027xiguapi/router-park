-- 为 users 表添加邀请相关字段
ALTER TABLE user ADD COLUMN balance INTEGER NOT NULL DEFAULT 10000;
ALTER TABLE user ADD COLUMN invite_code TEXT UNIQUE;
ALTER TABLE user ADD COLUMN invited_by TEXT;
ALTER TABLE user ADD COLUMN total_earned INTEGER NOT NULL DEFAULT 0;
ALTER TABLE user ADD COLUMN invite_count INTEGER NOT NULL DEFAULT 0;

-- 创建邀请记录表
CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY,
  inviter_id TEXT NOT NULL,
  invitee_id TEXT NOT NULL,
  reward INTEGER NOT NULL DEFAULT 2000,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at INTEGER NOT NULL,
  FOREIGN KEY (inviter_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (invitee_id) REFERENCES user(id) ON DELETE CASCADE
);

-- 创建余额变动记录表
CREATE TABLE IF NOT EXISTS balance_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  related_id TEXT,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_invitations_inviter ON invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invitations_invitee ON invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_user ON balance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_invite_code ON user(invite_code);
