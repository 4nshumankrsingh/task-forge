import app from "./app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Task Forge API running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }
}

bootstrap();