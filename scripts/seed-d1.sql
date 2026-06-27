-- Idempotent local D1 seed for Respect The Technique ops/admin panels.
-- Apply with:  npx wrangler d1 execute rtt-db --local --file scripts/seed-d1.sql
-- (Admin USER must be created via the Better Auth sign-up flow — see scripts/seed-admin.md.)

-- Time-tracking QR token (value is JSON-encoded per the qr-codes route).
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('time_tracking_qr_token', '"seed-qr-token-rtt-2026"');

-- Production items (what staff make per shift).
INSERT OR IGNORE INTO production_items (id, name, sku, category, case_size, low_stock_threshold, active, created_at, updated_at) VALUES
  ('pi-tonkotsu-broth', 'Tonkotsu Broth Base', 'PI-TONK-BROTH', 'broth', 40, 8, 1, '2026-06-06T12:00:00.000Z', '2026-06-06T12:00:00.000Z'),
  ('pi-chashu-pork',    'Chashu Pork',          'PI-CHASHU',     'protein', 60, 12, 1, '2026-06-06T12:00:00.000Z', '2026-06-06T12:00:00.000Z'),
  ('pi-ajitama-egg',    'Ajitama Marinated Egg','PI-AJITAMA',    'topping', 100, 24, 1, '2026-06-06T12:00:00.000Z', '2026-06-06T12:00:00.000Z'),
  ('pi-wavy-noodles',   'House Wavy Noodles',   'PI-NOODLES',    'noodles', 80, 16, 1, '2026-06-06T12:00:00.000Z', '2026-06-06T12:00:00.000Z');

-- Fridges (QR-scannable storage units).
INSERT OR IGNORE INTO fridges (id, name, qr_code, location, max_capacity_cases, max_capacity_portions, temperature_log_required, active, created_at, updated_at) VALUES
  ('fr-main-walkin', 'Main Walk-In Cooler', 'fridge-main-walkin', 'Back of house', 24, 1200, 1, 1, '2026-06-06T12:00:00.000Z', '2026-06-06T12:00:00.000Z'),
  ('fr-prep-line',   'Prep Line Fridge',    'fridge-prep-line',   'Kitchen line',  8,  400,  1, 1, '2026-06-06T12:00:00.000Z', '2026-06-06T12:00:00.000Z');

-- Retail products (storefront + manage-content + retail inventory).
INSERT OR IGNORE INTO products (id, name, slug, sku, description, category, images, price_regular, price_bulk, stock, unit, low_stock_threshold, active, featured, created_at, updated_at) VALUES
  ('prod-tonkotsu-kit', 'Tonkotsu Ramen Kit', 'tonkotsu-ramen-kit', 'RTT-KIT-TONK', 'Make our signature 18-hour tonkotsu ramen at home.', 'meal-kit', '[{"url":"https://placehold.co/800x800/1e2a4a/white?text=Tonkotsu+Kit","alt":"Tonkotsu Ramen Kit","isPrimary":true}]', 24.99, 21.99, 40, 'kit', 8, 1, 1, '2026-06-06T12:00:00.000Z', '2026-06-06T12:00:00.000Z'),
  ('prod-miso-kit',     'Spicy Miso Ramen Kit', 'spicy-miso-ramen-kit', 'RTT-KIT-MISO', 'Bold, fiery miso broth kit with chili oil.', 'meal-kit', '[{"url":"https://placehold.co/800x800/1e2a4a/white?text=Miso+Kit","alt":"Spicy Miso Ramen Kit","isPrimary":true}]', 25.99, 22.99, 30, 'kit', 8, 1, 1, '2026-06-06T12:00:00.000Z', '2026-06-06T12:00:00.000Z'),
  ('prod-chili-oil',    'House Chili Oil', 'house-chili-oil', 'RTT-CHILI-OIL', 'Our small-batch aromatic chili oil.', 'pantry', '[{"url":"https://placehold.co/800x800/1e2a4a/white?text=Chili+Oil","alt":"House Chili Oil","isPrimary":true}]', 12.99, NULL, 60, 'jar', 12, 1, 0, '2026-06-06T12:00:00.000Z', '2026-06-06T12:00:00.000Z');

-- A sample customer message so the dashboard badge + messages panel render.
INSERT OR IGNORE INTO contact_messages (id, name, email, subject, message, status, created_at, updated_at) VALUES
  ('msg-welcome', 'Sample Customer', 'customer@example.com', 'Catering question', 'Do you offer catering for events of 30+ people?', 'new', '2026-06-06T12:00:00.000Z', '2026-06-06T12:00:00.000Z');

-- A sample newsletter subscriber.
INSERT OR IGNORE INTO newsletter_subscribers (id, email, source, is_active, subscribed_at, updated_at) VALUES
  ('sub-sample', 'subscriber@example.com', 'website', 1, '2026-06-06T12:00:00.000Z', '2026-06-06T12:00:00.000Z');
