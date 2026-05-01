-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Url" (
    "id" SERIAL NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "expires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hashedUrl" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Url_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Url_hashedUrl_key" ON "Url"("hashedUrl");

-- CreateIndex
CREATE INDEX "Url_userId_createdAt_idx" ON "Url"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Url_expires_idx" ON "Url"("expires");

-- AddForeignKey
ALTER TABLE "Url" ADD CONSTRAINT "Url_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
