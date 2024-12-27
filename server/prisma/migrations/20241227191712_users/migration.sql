-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "password" TEXT NOT NULL,
    "passWordResetToken" TEXT,
    "TokenSendAt" TIMESTAMP(3),
    "emailVarifiedAt" TIMESTAMP(3),
    "emailVarifyToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
