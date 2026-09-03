import { prisma } from "../lib/prisma";

async function main() {
  try {
    const rawNotifs: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "notifications" ORDER BY "createdAt" DESC LIMIT 20;`);
    console.log("NOTIFICATIONS IN DB (count:", rawNotifs.length, "):");
    console.log(JSON.stringify(rawNotifs, null, 2));

    const orgs: any[] = await prisma.$queryRawUnsafe(`SELECT "id", "name", "slug" FROM "organizations" LIMIT 10;`);
    console.log("ORGANIZATIONS IN DB:", JSON.stringify(orgs, null, 2));
  } catch (err) {
    console.error("Query error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
