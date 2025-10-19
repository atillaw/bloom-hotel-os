-- Create enum types for room status, room types, reservation status, payment methods
CREATE TYPE room_status AS ENUM ('available', 'occupied', 'cleaning', 'maintenance', 'reserved');
CREATE TYPE room_type AS ENUM ('single', 'double', 'suite', 'deluxe', 'presidential');
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show');
CREATE TYPE payment_method AS ENUM ('credit_card', 'cash', 'debit_card', 'bank_transfer', 'other');

-- Rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number VARCHAR(20) NOT NULL UNIQUE,
  room_type room_type NOT NULL,
  floor INTEGER,
  max_occupancy INTEGER NOT NULL DEFAULT 2,
  rate_per_night DECIMAL(10, 2) NOT NULL,
  amenities TEXT[],
  status room_status NOT NULL DEFAULT 'available',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Guests table
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  nationality VARCHAR(100),
  id_number VARCHAR(100),
  preferences TEXT,
  loyalty_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reservations table
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  status reservation_status NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  special_requests TEXT,
  number_of_guests INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  payment_method payment_method NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  slip_code VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Housekeeping tasks table
CREATE TABLE housekeeping_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  task_type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  assigned_to VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  notes TEXT,
  scheduled_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE housekeeping_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for now - will add auth later)
CREATE POLICY "Allow all operations on rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on guests" ON guests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on reservations" ON reservations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on housekeeping_tasks" ON housekeeping_tasks FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_type ON rooms(room_type);
CREATE INDEX idx_reservations_dates ON reservations(check_in_date, check_out_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_guest ON reservations(guest_id);
CREATE INDEX idx_reservations_room ON reservations(room_id);
CREATE INDEX idx_payments_reservation ON payments(reservation_id);
CREATE INDEX idx_housekeeping_room ON housekeeping_tasks(room_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_housekeeping_updated_at BEFORE UPDATE ON housekeeping_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO rooms (room_number, room_type, floor, max_occupancy, rate_per_night, amenities, status, description) VALUES
('101', 'single', 1, 1, 89.99, ARRAY['WiFi', 'TV', 'AC'], 'available', 'Cozy single room with city view'),
('102', 'double', 1, 2, 129.99, ARRAY['WiFi', 'TV', 'AC', 'Mini Bar'], 'available', 'Comfortable double room'),
('201', 'suite', 2, 4, 249.99, ARRAY['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Jacuzzi'], 'available', 'Luxurious suite with panoramic views'),
('202', 'deluxe', 2, 3, 189.99, ARRAY['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony'], 'occupied', 'Deluxe room with modern amenities'),
('301', 'presidential', 3, 6, 499.99, ARRAY['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Jacuzzi', 'Kitchen', 'Living Room'], 'available', 'Presidential suite with premium features');

INSERT INTO guests (first_name, last_name, email, phone, nationality, loyalty_points) VALUES
('John', 'Doe', 'john.doe@email.com', '+1-555-0101', 'USA', 250),
('Emma', 'Smith', 'emma.smith@email.com', '+44-20-1234', 'UK', 180),
('Carlos', 'Garcia', 'carlos.garcia@email.com', '+34-91-234', 'Spain', 420);