#!/usr/bin/env node
(async () => {
  try {
    const path = require('path');
    process.chdir(path.resolve(__dirname, '..'));
    const fallback = require('./../src/config/fallbackDb');
    const { hashPassword } = require('../src/utils/password');

    const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

    // ensure roles exist
    const roles = fallback.state.roles;

    const findRole = (name) => roles.find((r) => r.name.toLowerCase() === name.toLowerCase());

    const adminRole = findRole('Admin');
    const doctorRole = findRole('Doctor');
    const patientRole = findRole('Patient');

    // simple users
    const users = [
      { full_name: 'Demo Admin', email: 'admin@local.test', password: 'Admin123!', role_id: adminRole?.id || 1, status: 'active' },
      { full_name: 'Demo Doctor', email: 'doctor@local.test', password: 'Doctor123!', role_id: doctorRole?.id || 2, status: 'active' },
      { full_name: 'Demo Patient', email: 'patient@local.test', password: 'Patient123!', role_id: patientRole?.id || 3, status: 'active' }
    ];

    for (const u of users) {
      // ensure not duplicate
      const exists = fallback.state.users.find((x) => String(x.email).toLowerCase() === String(u.email).toLowerCase());
      if (exists) continue;
      const hash = await hashPassword(u.password);
      const id = fallback.state.nextUserId++;
      const user = {
        id,
        role_id: u.role_id,
        full_name: u.full_name,
        email: u.email,
        phone: null,
        password_hash: hash,
        status: u.status,
        created_at: now(),
        updated_at: now(),
        deleted_at: null
      };
      fallback.state.users.push(user);
      console.log(`Seeded user: ${u.email} / ${u.password}`);
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(2);
  }
})();
