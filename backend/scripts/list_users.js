(async () => {
  try {
    const path = require('path');
    process.chdir(path.resolve(__dirname, '..'));
    const fallback = require('./../src/config/fallbackDb');
    if (fallback && fallback.state && Array.isArray(fallback.state.users)) {
      console.log('Users in fallback DB:');
      console.log(JSON.stringify(fallback.state.users, null, 2));
    } else {
      console.log('No fallback state available.');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(2);
  }
})();
