-- finance_suppliers
CREATE TABLE IF NOT EXISTS finance_suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    document VARCHAR(20),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    pix_key VARCHAR(255),
    bank VARCHAR(100),
    agency VARCHAR(50),
    account VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- finance_payables
CREATE TABLE IF NOT EXISTS finance_payables (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES finance_suppliers(id),
    launch_date DATE NOT NULL,
    due_date DATE NOT NULL,
    type VARCHAR(100) NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    description TEXT,
    attachment_url TEXT,
    responsible VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- finance_refunds
CREATE TABLE IF NOT EXISTS finance_refunds (
    id SERIAL PRIMARY KEY,
    requester VARCHAR(255) NOT NULL,
    request_date DATE NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    description TEXT,
    attachment_url TEXT,
    status VARCHAR(50) DEFAULT 'Solicitado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- collaborators
CREATE TABLE IF NOT EXISTS collaborators (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    cpf VARCHAR(20),
    email VARCHAR(255),
    phone VARCHAR(20),
    birth_date DATE,
    role VARCHAR(100),
    bank VARCHAR(100),
    agency VARCHAR(50),
    account VARCHAR(50),
    account_type VARCHAR(50),
    pix_key VARCHAR(255),
    rg_url TEXT,
    cpf_url TEXT,
    bank_receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- finance_requests
CREATE TABLE IF NOT EXISTS finance_requests (
    id SERIAL PRIMARY KEY,
    requester VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    notes TEXT,
    attachment_url TEXT,
    status VARCHAR(50) DEFAULT 'Pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- finance_request_responses
CREATE TABLE IF NOT EXISTS finance_request_responses (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES finance_requests(id) ON DELETE CASCADE,
    responder VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- SUPABASE STORAGE CONFIGURATION
-- ==========================================

-- 1. Create the bucket (Public)
CREATE INDEX idx_finance_payables_competence ON finance_payables(payment_competence);
CREATE INDEX idx_finance_payables_status ON finance_payables(payment_status);

-- Atualização de Saldo e Comissionamento Líquido (Implementado)
ALTER TABLE finance_sales ADD COLUMN IF NOT EXISTS quantity_delivered INTEGER DEFAULT 0;
ALTER TABLE finance_sales ADD COLUMN IF NOT EXISTS used_value DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE finance_sales ADD COLUMN IF NOT EXISTS remaining_balance DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE finance_sales ADD COLUMN IF NOT EXISTS balance_rolled_over BOOLEAN DEFAULT false;
ALTER TABLE finance_sales ADD COLUMN IF NOT EXISTS discount_applied DECIMAL(10, 2) DEFAULT 0;
INSERT INTO storage.buckets (id, name, public) 
VALUES ('finance-files', 'finance-files', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow public read access to the bucket
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'finance-files');

-- 4. Policy: Allow anyone (or authenticated users) to upload files
CREATE POLICY "Public Insert Access" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'finance-files');

-- 5. Policy: Allow users to update their files
CREATE POLICY "Public Update Access" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'finance-files');

-- 6. Policy: Allow users to delete files
CREATE POLICY "Public Delete Access" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'finance-files');
