-- init-scripts/01-create-transaction-schema.sql

CREATE TYPE transaction_type AS ENUM (
    'income',
    'expense'
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions_table (
    id SERIAL PRIMARY KEY,
    type transaction_type NOT NULL,
    amount BIGINT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions_table(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions_table(category);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions_table(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions_table(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON transactions_table(amount);

-- Create a composite index for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_type_date ON transactions_table(type, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category_date ON transactions_table(category, date DESC);

-- Add comments for documentation
COMMENT ON TABLE transactions_table IS 'Financial transactions table';
COMMENT ON COLUMN transactions_table.id IS 'Unique transaction identifier';
COMMENT ON COLUMN transactions_table.type IS 'Type of transaction (INCOME, EXPENSE, etc.)';
COMMENT ON COLUMN transactions_table.amount IS 'Transaction amount in smallest currency unit (e.g., cents)';
COMMENT ON COLUMN transactions_table.description IS 'Transaction description';
COMMENT ON COLUMN transactions_table.category IS 'Transaction category';
COMMENT ON COLUMN transactions_table.date IS 'Transaction date';
COMMENT ON COLUMN transactions_table.created_at IS 'Record creation timestamp';

