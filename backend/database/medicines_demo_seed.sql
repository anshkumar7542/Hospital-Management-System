-- Demo medicines seed data for dropdown usage
-- Run this after creating medicines table.

INSERT INTO medicines (
  name,
  generic_name,
  category,
  manufacturer,
  batch_number,
  dosage_form,
  strength,
  unit_price,
  stock_quantity,
  reorder_level,
  expiry_date,
  status,
  created_at,
  updated_at
) VALUES
  ('Paracetamol 650', 'Paracetamol', 'Pain reliever', 'DemoPharma', 'BCH-PA-650-001', 'Tablet', '650mg', 2.50, 500, 50, '2030-12-31', 'active', NOW(), NOW()),
  ('Amoxicillin 500', 'Amoxicillin', 'Antibiotic', 'DemoPharma', 'BCH-AMX-500-002', 'Capsule', '500mg', 8.00, 200, 30, '2030-10-01', 'active', NOW(), NOW()),
  ('Cetirizine 10', 'Cetirizine', 'Antihistamine', 'AllergoLabs', 'BCH-CET-10-003', 'Tablet', '10mg', 3.20, 300, 40, '2031-03-15', 'active', NOW(), NOW()),
  ('Ibuprofen 400', 'Ibuprofen', 'Pain reliever', 'HealthBridge', 'BCH-IBU-400-004', 'Tablet', '400mg', 5.10, 250, 35, '2030-08-20', 'active', NOW(), NOW()),
  ('Omeprazole 20', 'Omeprazole', 'Proton pump inhibitor', 'GastroCare', 'BCH-OMP-20-005', 'Capsule', '20mg', 9.50, 180, 25, '2031-01-10', 'active', NOW(), NOW());

