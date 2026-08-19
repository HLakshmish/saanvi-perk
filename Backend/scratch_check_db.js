const prisma = require('./src/config/prisma');

async function main() {
  const user = await prisma.user.findUnique({ where: { userId: 7 } });
  console.log('User 7:', !!user);

  const policy = await prisma.compOffPolicy.findUnique({ where: { id: 2 } });
  console.log('Policy 2:', !!policy);

  const company = await prisma.companyDetails.findUnique({ where: { companyId: 1 } });
  console.log('Company 1:', !!company);

  const admin = await prisma.user.findUnique({ where: { userId: 1 } });
  console.log('Admin 1:', !!admin);

  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
