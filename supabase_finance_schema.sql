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
