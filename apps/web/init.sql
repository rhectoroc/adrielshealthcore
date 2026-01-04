-- Authentication Tables (compatible with Auth.js)
CREATE TABLE IF NOT EXISTS auth_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT UNIQUE,
    "emailVerified" TIMESTAMP WITH TIME ZONE,
    image TEXT
);

CREATE TABLE IF NOT EXISTS auth_accounts (
    id SERIAL PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    password TEXT, -- For credentials provider
    UNIQUE(provider, "providerAccountId")
);

CREATE TABLE IF NOT EXISTS auth_sessions (
    id SERIAL PRIMARY KEY,
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    expires TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_verification_token (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- Application Tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'doctor',
    full_name TEXT NOT NULL,
    mpps_number TEXT,
    colegio_number TEXT,
    specialty TEXT,
    rif TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    doctor_id UUID, -- For future linking if needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed internal admin if needed (optional)
-- INSERT INTO users (email, role, full_name, is_verified) 
-- VALUES ('admin@example.com', 'superuser', 'Root Admin', true) 
-- ON CONFLICT (email) DO NOTHING;

CREATE TABLE IF NOT EXISTS specialties (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    cedula TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT,
    blood_type TEXT,
    weight NUMERIC,
    height NUMERIC,
    phone TEXT,
    email TEXT,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    allergies TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initial Data
INSERT INTO specialties (name) VALUES 
('Cardiología'), ('Pediatría'), ('Ginecología'), ('Traumatología'), ('Medicina General')
ON CONFLICT (name) DO NOTHING;
