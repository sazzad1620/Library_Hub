import * as bcrypt from 'bcryptjs';

async function generateHash() {
  const password = 'admin';
  const saltRounds = 10;

  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Generated bcrypt hash:', hash);
}

generateHash();
