(async () => {
  try {
    const path = require('path');
    process.chdir(path.resolve(__dirname, '..'));
    const userRepo = require('./../src/repositories/user.repository');
    const authRepo = require('./../src/repositories/auth.repository');
    const { hashPassword } = require('./../src/utils/password');

    const email = 'admin@example.com';
    const newPassword = 'Password123!';

    const user = await userRepo.findByEmail(email);
    if (!user) {
      console.error('User not found:', email);
      process.exit(1);
    }

    const hash = await hashPassword(newPassword);
    await authRepo.updatePassword(user.id, hash);
    console.log('Password reset for', email);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(2);
  }
})();
