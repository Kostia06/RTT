-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_role AS ENUM ('customer', 'employee', 'admin');
CREATE TYPE address_type AS ENUM ('shipping', 'billing');
CREATE TYPE product_category AS ENUM ('ramen-bowl', 'retail-product', 'merchandise', 'ingredient');
CREATE TYPE spice_level AS ENUM ('mild', 'medium', 'hot', 'extra-hot');
CREATE TYPE product_size AS ENUM ('regular', 'large');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('square', 'cash');
CREATE TYPE fulfillment_type AS ENUM ('delivery', 'pickup');
CREATE TYPE fulfillment_status AS ENUM ('pending', 'processing', 'ready', 'completed', 'cancelled');
CREATE TYPE class_type AS ENUM ('beginner', 'intermediate', 'advanced', 'specialty');
CREATE TYPE class_schedule_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE registration_status AS ENUM ('registered', 'confirmed', 'attended', 'cancelled', 'no-show');
CREATE TYPE registration_payment_status AS ENUM ('pending', 'completed', 'refunded');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    role user_role DEFAULT 'customer',
    email_verified TIMESTAMP,
    image TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User addresses table
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type address_type NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    country TEXT DEFAULT 'CA',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Employee data table (optional, for Phase 2)
CREATE TABLE employee_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    position TEXT,
    hire_date DATE,
    hourly_rate DECIMAL(10, 2),
    employee_id TEXT,
    qr_code TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    short_description TEXT,
    category product_category NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    compare_at_price DECIMAL(10, 2) CHECK (compare_at_price >= 0),
    meta_title TEXT,
    meta_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Product images table
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0
);

-- Product variants table
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    options JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Product nutritional info table
CREATE TABLE product_nutritional_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    calories INT,
    protein INT,
    carbs INT,
    fat INT,
    sodium INT
);

-- Inventory data table (for Phase 3)
CREATE TABLE product_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    track_inventory BOOLEAN DEFAULT FALSE,
    current_stock INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
    shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
    discount DECIMAL(10, 2) DEFAULT 0 CHECK (discount >= 0),
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    square_payment_id TEXT,
    square_order_id TEXT,
    transaction_date TIMESTAMP,
    fulfillment_type fulfillment_type NOT NULL,
    fulfillment_status fulfillment_status DEFAULT 'pending',
    scheduled_date TIMESTAMP,
    fulfillment_notes TEXT,
    status order_status DEFAULT 'pending',
    notes TEXT,
    internal_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name TEXT NOT NULL,
    variant_id UUID REFERENCES product_variants(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    options JSONB DEFAULT '{}'
);

-- Order addresses table
CREATE TABLE order_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    type address_type NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    country TEXT DEFAULT 'CA'
);

-- Classes table
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    short_description TEXT,
    type class_type NOT NULL,
    duration INT NOT NULL CHECK (duration >= 30),
    max_students INT NOT NULL CHECK (max_students >= 1),
    current_students INT DEFAULT 0 CHECK (current_students >= 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    instructor_user_id UUID REFERENCES users(id),
    instructor_name TEXT NOT NULL,
    instructor_bio TEXT,
    instructor_image TEXT,
    requirements TEXT[] DEFAULT '{}',
    what_you_will_learn TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Class images table
CREATE TABLE class_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

-- Class schedules table
CREATE TABLE class_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status class_schedule_status DEFAULT 'scheduled',
    attendees INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Class registrations table
CREATE TABLE class_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    schedule_date DATE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    student_email TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_phone TEXT,
    payment_amount DECIMAL(10, 2) NOT NULL CHECK (payment_amount >= 0),
    payment_status registration_payment_status DEFAULT 'pending',
    square_payment_id TEXT,
    status registration_status DEFAULT 'registered',
    qr_code TEXT,
    checked_in_at TIMESTAMP,
    checked_in_by UUID REFERENCES users(id),
    notes TEXT,
    dietary_restrictions TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category, is_active);
CREATE INDEX idx_products_featured ON products(is_featured, is_active);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_addresses_order_id ON order_addresses(order_id);
CREATE INDEX idx_classes_slug ON classes(slug);
CREATE INDEX idx_classes_active ON classes(is_active);
CREATE INDEX idx_class_schedules_class_id ON class_schedules(class_id);
CREATE INDEX idx_class_schedules_date ON class_schedules(date);
CREATE INDEX idx_class_registrations_class_id ON class_registrations(class_id);
CREATE INDEX idx_class_registrations_user_id ON class_registrations(user_id);
CREATE INDEX idx_class_registrations_student_email ON class_registrations(student_email);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_data_updated_at BEFORE UPDATE ON employee_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_inventory_updated_at BEFORE UPDATE ON product_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_class_registrations_updated_at BEFORE UPDATE ON class_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
