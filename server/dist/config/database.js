import { PrismaClient } from "@prisma/client/extension";
const prisma = new PrismaClient({
    log: ["error", "query"],
    errorFormat: "pretty",
});
export default prisma;
