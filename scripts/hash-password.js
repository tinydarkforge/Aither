import { createHash } from 'crypto';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter password to hash: ', (password) => {
  const hash = createHash('sha256').update(password).digest('hex');
  console.log('\nYour password hash:');
  console.log(hash);
  console.log('\nAdd this to your .env file:');
  console.log(`VITE_ADMIN_PASS_HASH=${hash}`);
  rl.close();
});
