const allowedRoles = ['Admin', 'Doctor', 'Receptionist', 'Patient'];
const nowTimestamp = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

const state = {
  nextUserId: 1,
  nextDoctorId: 1,
  nextAppointmentId: 1,
  nextRefreshTokenId: 1,
  nextEmailVerificationTokenId: 1,
  nextPasswordResetTokenId: 1,
  nextActivityLogId: 1,
  users: [],
  doctors: [],
  departments: [],
  appointments: [],
  roles: allowedRoles.map((name, index) => ({ id: index + 1, name })),
  refresh_tokens: [],
  email_verification_tokens: [],
  password_reset_tokens: [],
  activity_logs: []
};

// Development demo seeding: add persistent demo accounts when the server process loads
try {
  const env = require('./env');
  if ((env.nodeEnv === 'development' || env.useFallbackDb) && state.users.length === 0) {
    const bcrypt = require('bcrypt');
    const seedUsers = [
      { full_name: 'Demo Admin', email: 'admin@local.test', password: 'Admin123!', role_name: 'Admin', status: 'active' },
      { full_name: 'Demo Doctor', email: 'doctor@local.test', password: 'Doctor123!', role_name: 'Doctor', status: 'active' },
      { full_name: 'Demo Patient', email: 'patient@local.test', password: 'Patient123!', role_name: 'Patient', status: 'active' }
    ];

    seedUsers.forEach((u) => {
      const role = state.roles.find((r) => r.name.toLowerCase() === u.role_name.toLowerCase());
      const id = state.nextUserId++;
      const password_hash = bcrypt.hashSync(u.password, Math.max(8, Number(env.bcryptSaltRounds || 10)));
      state.users.push({ id, role_id: role ? role.id : null, full_name: u.full_name, email: u.email, password_hash, status: u.status, created_at: nowTimestamp(), updated_at: nowTimestamp(), deleted_at: null });
    });

    state.departments = [
      { id: state.nextDoctorId++, name: 'General Medicine', description: 'Primary care and general consultations', status: 'active', created_at: nowTimestamp(), updated_at: nowTimestamp() },
      { id: state.nextDoctorId++, name: 'Cardiology', description: 'Heart and cardiovascular care', status: 'active', created_at: nowTimestamp(), updated_at: nowTimestamp() },
      { id: state.nextDoctorId++, name: 'Pediatrics', description: 'Children and adolescent care', status: 'active', created_at: nowTimestamp(), updated_at: nowTimestamp() },
      { id: state.nextDoctorId++, name: 'Orthopedics', description: 'Bone, joint, and musculoskeletal care', status: 'active', created_at: nowTimestamp(), updated_at: nowTimestamp() }
    ];

    // Seed a sample doctor profile for the demo doctor account
    const demoDoctorUser = state.users.find((u) => u.email === 'doctor@local.test');
    if (demoDoctorUser) {
      state.doctors.push({
        id: state.nextDoctorId++,
        user_id: demoDoctorUser.id,
        department_id: null,
        license_number: 'DOC-0001',
        specialization: 'General Medicine',
        qualification: 'MBBS',
        consultation_fee: 1200,
        availability_status: 'available',
        created_at: nowTimestamp(),
        updated_at: nowTimestamp()
      });
    }
  }
} catch (err) {
  // ignore seeding errors in environments where env isn't available
}

// In development, ensure any previously-created pending users are activated to avoid blocking testing
try {
  const env = require('./env');
  if (env.nodeEnv === 'development') {
    state.users.forEach((u) => {
      if (u.status === 'pending') u.status = 'active';
    });
  }
} catch (err) {
  // ignore
}

const mapUserRow = (user) => ({
  ...user,
  created_at: user.created_at || nowTimestamp(),
  updated_at: user.updated_at || nowTimestamp(),
  last_login_at: user.last_login_at || null,
  email_verified_at: user.email_verified_at || null,
  deleted_at: user.deleted_at || null
});

const findRoleByName = (value) => {
  if (value === undefined || value === null) return null;
  const normalized = String(value).toLowerCase();
  return (
    state.roles.find((role) => role.name.toLowerCase() === normalized) ||
    state.roles.find((role) => String(role.id) === normalized) ||
    null
  );
};
const isActiveUser = (user) => user.deleted_at === null || user.deleted_at === undefined;
const findUserByEmail = (email) => {
  const normalizedEmail = String(email || '').toLowerCase();
  return state.users.find((user) => String(user.email || '').toLowerCase() === normalizedEmail && isActiveUser(user)) || null;
};
const findUserById = (id) => state.users.find((user) => Number(user.id) === Number(id) && isActiveUser(user)) || null;

const parseInsertFields = (sql) => {
  const fieldsMatch = sql.match(/\(([^)]+)\)\s*VALUES\s*\(/i);
  if (!fieldsMatch) return [];
  return fieldsMatch[1].split(',').map((field) => field.trim());
};

const toRows = (row) => (Array.isArray(row) ? row : [row]);

const query = async (sql, params = []) => {
  const normalized = sql.replace(/\s+/g, ' ').trim();
  const lower = normalized.toLowerCase();
  const values = Array.isArray(params) ? params : [params];

  if (lower.startsWith('select users.*, roles.name as role_name')) {
    if (lower.includes('where users.email = ?')) {
      const user = findUserByEmail(values[0]);
      if (!user) return [];
      const role = findRoleByName(user.role_id ? user.role_id : user.role_name) || {};
      return [{ ...user, role_name: role.name }];
    }

    if (lower.includes('where users.id = ?')) {
      const user = findUserById(values[0]);
      if (!user) return [];
      const role = state.roles.find((roleItem) => roleItem.id === Number(user.role_id)) || { name: user.role_name };
      return [{ ...user, role_name: role.name }];
    }
  }

  if (lower.startsWith('select id, name from roles where name = ?')) {
    const role = findRoleByName(values[0]);
    return role ? [role] : [];
  }

  if (lower.startsWith('select') && lower.includes('from users') && lower.includes('where id = ? limit 1')) {
    const user = findUserById(values[0]);
    return user ? [mapUserRow(user)] : [];
  }

  if (lower.startsWith('select') && lower.includes('from users') && lower.includes('where users.email = ?')) {
    const user = findUserByEmail(values[0]);
    return user ? [mapUserRow(user)] : [];
  }

  if (lower.startsWith('select id, user_id, action, entity_type, entity_id, description, ip_address, user_agent, created_at from activity_logs where id = ? limit 1')) {
    const log = state.activity_logs.find((item) => Number(item.id) === Number(values[0]));
    return log ? [log] : [];
  }

  if (lower.startsWith('insert into users')) {
    const fields = parseInsertFields(normalized);
    const user = { id: state.nextUserId++ };
    fields.forEach((field, index) => {
      const key = field.replace(/`/g, '');
      user[key] = values[index] === undefined ? null : values[index];
    });
    user.status = user.status || 'active';
    user.created_at = nowTimestamp();
    user.updated_at = nowTimestamp();
    user.deleted_at = null;
    state.users.push(user);
    return { insertId: user.id };
  }

  if (lower.startsWith('insert into doctors')) {
    const fields = parseInsertFields(normalized);
    const doctor = { id: state.nextDoctorId++ };
    fields.forEach((field, index) => {
      const key = field.replace(/`/g, '');
      doctor[key] = values[index] === undefined ? null : values[index];
    });
    doctor.created_at = nowTimestamp();
    doctor.updated_at = nowTimestamp();
    state.doctors.push(doctor);
    return { insertId: doctor.id };
  }

  if (lower.startsWith('insert into departments')) {
    const fields = parseInsertFields(normalized);
    const department = { id: state.nextDoctorId++ };
    fields.forEach((field, index) => {
      const key = field.replace(/`/g, '');
      department[key] = values[index] === undefined ? null : values[index];
    });
    department.created_at = nowTimestamp();
    department.updated_at = nowTimestamp();
    state.departments.push(department);
    return { insertId: department.id };
  }

  if (lower.startsWith('insert into appointments')) {
    const fields = parseInsertFields(normalized);
    const appointment = { id: state.nextAppointmentId++ };
    fields.forEach((field, index) => {
      const key = field.replace(/`/g, '');
      appointment[key] = values[index] === undefined ? null : values[index];
    });
    appointment.created_at = nowTimestamp();
    appointment.updated_at = nowTimestamp();
    state.appointments.push(appointment);
    return { insertId: appointment.id };
  }

  if (lower.startsWith('insert into activity_logs')) {
    const fields = parseInsertFields(normalized);
    const log = { id: state.nextActivityLogId++ };
    fields.forEach((field, index) => {
      const key = field.replace(/`/g, '');
      log[key] = values[index] === undefined ? null : values[index];
    });
    log.created_at = nowTimestamp();
    state.activity_logs.push(log);
    return { insertId: log.id };
  }

  if (lower.startsWith('update doctors set')) {
    const assignments = normalized.match(/update doctors set (.+?) where id = \?/i);
    if (assignments) {
      const doctor = state.doctors.find((item) => Number(item.id) === Number(values[values.length - 1]));
      if (doctor) {
        const fields = assignments[1].split(',').map((field) => field.trim().split('=')[0].trim().replace(/`/g, ''));
        fields.forEach((field, index) => {
          doctor[field] = values[index] === undefined ? null : values[index];
        });
        doctor.updated_at = nowTimestamp();
      }
    }
    return [];
  }

  if (lower.startsWith('delete from doctors where id = ?')) {
    const id = values[0];
    const index = state.doctors.findIndex((item) => Number(item.id) === Number(id));
    if (index !== -1) state.doctors.splice(index, 1);
    return [];
  }

  if (lower.startsWith('update users set last_login_at = now() where id = ?')) {
    const user = findUserById(values[0]);
    if (user) user.last_login_at = nowTimestamp();
    return [];
  }

  if (lower.startsWith('update users set password_hash = ? where id = ?')) {
    const user = findUserById(values[1]);
    if (user) user.password_hash = values[0];
    return [];
  }

  if (lower.startsWith('update users set email_verified_at = coalesce(email_verified_at, now()) where id = ?')) {
    const user = findUserById(values[0]);
    if (user && !user.email_verified_at) user.email_verified_at = nowTimestamp();
    return [];
  }

  if (lower.startsWith('insert into email_verification_tokens')) {
    const fields = parseInsertFields(normalized);
    const token = { id: state.nextEmailVerificationTokenId++ };
    fields.forEach((field, index) => {
      const key = field.replace(/`/g, '');
      token[key] = values[index] === undefined ? null : values[index];
    });
    token.created_at = nowTimestamp();
    state.email_verification_tokens.push(token);
    return { insertId: token.id };
  }

  if (lower.startsWith('insert into refresh_tokens')) {
    const fields = parseInsertFields(normalized);
    const token = { id: state.nextRefreshTokenId++ };
    fields.forEach((field, index) => {
      const key = field.replace(/`/g, '');
      token[key] = values[index] === undefined ? null : values[index];
    });
    token.created_at = nowTimestamp();
    state.refresh_tokens.push(token);
    return { insertId: token.id };
  }

  if (lower.startsWith('insert into password_reset_tokens')) {
    const fields = parseInsertFields(normalized);
    const token = { id: state.nextPasswordResetTokenId++ };
    fields.forEach((field, index) => {
      const key = field.replace(/`/g, '');
      token[key] = values[index] === undefined ? null : values[index];
    });
    token.created_at = nowTimestamp();
    state.password_reset_tokens.push(token);
    return { insertId: token.id };
  }

  if (lower.startsWith('select * from password_reset_tokens')) {
    const [tokenHash] = values;
    const token = state.password_reset_tokens.find((item) => item.token_hash === tokenHash && !item.used_at && new Date(item.expires_at) > new Date());
    return token ? [token] : [];
  }

  if (lower.startsWith('select * from email_verification_tokens')) {
    const [tokenHash] = values;
    const token = state.email_verification_tokens.find((item) => item.token_hash === tokenHash && !item.used_at && new Date(item.expires_at) > new Date());
    return token ? [token] : [];
  }

  if (lower.startsWith('select * from refresh_tokens')) {
    const [jti, tokenHash] = values;
    const token = state.refresh_tokens.find((item) => item.jti === jti && item.token_hash === tokenHash && !item.revoked_at && new Date(item.expires_at) > new Date());
    return token ? [token] : [];
  }

  if (lower.startsWith('update password_reset_tokens set used_at = now() where user_id = ? and used_at is null')) {
    const [userId] = values;
    state.password_reset_tokens.forEach((token) => {
      if (Number(token.user_id) === Number(userId) && !token.used_at) token.used_at = nowTimestamp();
    });
    return [];
  }

  if (lower.startsWith('update email_verification_tokens set used_at = now() where id = ?')) {
    const [id] = values;
    const token = state.email_verification_tokens.find((item) => Number(item.id) === Number(id));
    if (token) token.used_at = nowTimestamp();
    return [];
  }

  if (lower.startsWith('update refresh_tokens set revoked_at = now() where jti = ?')) {
    const [jti] = values;
    const token = state.refresh_tokens.find((item) => item.jti === jti);
    if (token) token.revoked_at = nowTimestamp();
    return [];
  }

  if (lower.startsWith('update refresh_tokens set revoked_at = now(), replaced_by_jti = ? where jti = ?')) {
    const [replacedByJti, jti] = values;
    const token = state.refresh_tokens.find((item) => item.jti === jti);
    if (token) {
      token.revoked_at = nowTimestamp();
      token.replaced_by_jti = replacedByJti;
    }
    return [];
  }

  if (lower.startsWith('update refresh_tokens set revoked_at = now() where user_id = ? and revoked_at is null')) {
    const [userId] = values;
    state.refresh_tokens.forEach((token) => {
      if (Number(token.user_id) === Number(userId) && !token.revoked_at) token.revoked_at = nowTimestamp();
    });
    return [];
  }

  if (lower.startsWith('select count(*) as total from')) {
    const tableMatch = lower.match(/select count\(\*\) as total from ([^ ]+)(?: where (.+))?/);
    if (tableMatch) {
      const table = tableMatch[1];
      const whereClause = tableMatch[2] || '';
      let rows = state[table] ? [...state[table]] : [];
      if (table === 'appointments' && whereClause) {
        if (whereClause.includes('patient_id = ?')) {
          const index = values.findIndex((value) => value !== undefined && value !== null);
          rows = rows.filter((item) => Number(item.patient_id) === Number(values[index]));
        }
        if (whereClause.includes('doctor_id = ?')) {
          const index = values.findIndex((value) => value !== undefined && value !== null);
          rows = rows.filter((item) => Number(item.doctor_id) === Number(values[index]));
        }
      }
      return [{ total: rows.length }];
    }
  }

  if (lower.startsWith('select') && lower.includes('from doctors')) {
    const rows = state.doctors.map((doctor) => {
      const user = findUserById(doctor.user_id) || {};
      return {
        ...doctor,
        doctor_name: user.full_name,
        full_name: user.full_name,
        department_name: doctor.specialization,
        status: doctor.availability_status || 'available'
      };
    });

    if (lower.includes('where id = ? limit 1')) {
      const doctor = rows.find((item) => Number(item.id) === Number(values[0]));
      return doctor ? [doctor] : [];
    }

    if (lower.includes('where user_id = ? limit 1')) {
      const doctor = rows.find((item) => Number(item.user_id) === Number(values[0]));
      return doctor ? [doctor] : [];
    }

    if (lower.includes('limit ? offset ?')) {
      const limit = Number(values[values.length - 2]) || 20;
      const offset = Number(values[values.length - 1]) || 0;
      return rows.slice(offset, offset + limit);
    }

    return rows;
  }

  if (lower.startsWith('select') && lower.includes('from departments')) {
    let rows = state.departments.map((department) => ({
      ...department,
      status: department.status || 'active'
    }));

    if (lower.includes('where id = ? limit 1')) {
      const department = rows.find((item) => Number(item.id) === Number(values[0]));
      return department ? [department] : [];
    }

    if (lower.includes('limit ? offset ?')) {
      const limit = Number(values[values.length - 2]) || 20;
      const offset = Number(values[values.length - 1]) || 0;
      return rows.slice(offset, offset + limit);
    }

    return rows;
  }

  if (lower.startsWith('select') && lower.includes('from appointments')) {
    let rows = state.appointments.map((appointment) => ({
      ...appointment,
      appointment_date: appointment.appointment_date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      status: appointment.status || 'pending'
    }));

    const whereMatch = lower.match(/where (.+?) (order by|limit|$)/);
    const filterParams = Array.isArray(values) ? [...values] : [values];

    if (whereMatch) {
      const conditions = whereMatch[1].split(/ and /i).map((condition) => condition.trim());
      conditions.forEach((condition) => {
        if (condition === 'patient_id = ?') {
          const value = filterParams.shift();
          rows = rows.filter((item) => Number(item.patient_id) === Number(value));
        }
        if (condition === 'doctor_id = ?') {
          const value = filterParams.shift();
          rows = rows.filter((item) => Number(item.doctor_id) === Number(value));
        }
        if (condition === 'id = ?') {
          const value = filterParams.shift();
          rows = rows.filter((item) => Number(item.id) === Number(value));
        }
      });
    }

    if (lower.includes('where id = ? limit 1')) {
      const appointment = rows[0];
      return appointment ? [appointment] : [];
    }

    if (lower.includes('limit ? offset ?')) {
      const limit = Number(values[values.length - 2]) || 20;
      const offset = Number(values[values.length - 1]) || 0;
      return rows.slice(offset, offset + limit);
    }

    if (lower.startsWith('select id from appointments')) {
      return rows.map((appointment) => ({ id: appointment.id }));
    }

    return rows;
  }

  if (lower.startsWith('update appointments set')) {
    const match = normalized.match(/update appointments set (.+?) where id = \?/i);
    if (match) {
      const fields = match[1].split(',').map((field) => field.trim().split('=')[0].trim().replace(/`/g, ''));
      const appointment = state.appointments.find((item) => Number(item.id) === Number(values[values.length - 1]));
      if (appointment) {
        fields.forEach((field, index) => {
          appointment[field] = values[index] === undefined ? null : values[index];
        });
        appointment.updated_at = nowTimestamp();
      }
    }
    return [];
  }

  if (lower.startsWith('delete from appointments where id = ?')) {
    const id = values[0];
    const index = state.appointments.findIndex((item) => Number(item.id) === Number(id));
    if (index !== -1) state.appointments.splice(index, 1);
    return [];
  }

  if (lower.startsWith('select') && lower.includes('from users')) {
    // handle single user by id
    const idMatch = lower.match(/where id = \? limit 1/);
    if (idMatch) {
      const user = findUserById(values[0]);
      return user ? [mapUserRow(user)] : [];
    }

    // handle paginated listing with LIMIT ? OFFSET ? at end
    if (lower.match(/limit \? offset \?/)) {
      // assume last two params are limit and offset
      const limit = Number(values[values.length - 2]) || 20;
      const offset = Number(values[values.length - 1]) || 0;
      const rows = state.users.filter(isActiveUser).map((u) => {
        const role = state.roles.find((r) => r.id === Number(u.role_id)) || { name: u.role_name };
        return { ...mapUserRow(u), role_name: role.name };
      });
      return rows.slice(offset, offset + limit);
    }
  }

  // For development fallback DB, return an empty result for unknown queries
  // instead of throwing so the UI shows empty lists rather than 500 errors.
  return [];
};

const transaction = async (callback) => {
  const connection = { execute: async (sql, params) => [await query(sql, params), null] };
  try {
    const result = await callback(connection);
    return result;
  } finally {
    // no-op
  }
};

module.exports = { query, transaction, state };
