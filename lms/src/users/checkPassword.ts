import * as bcrypt from 'bcryptjs';

async function check() {
  const plainPassword = 'admin';
  const hashFromDb = '$2b$10$4rZTp2gFpQ2T8zcOceXF5OVi7VeQQaTqAO11RTXzrp.Hw9aTUFoEy';

  const match = await bcrypt.compare(plainPassword, hashFromDb);
  console.log('Do they match?', match);
}

check();
