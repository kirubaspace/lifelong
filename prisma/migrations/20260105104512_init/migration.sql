-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priceId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProtectedContent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "description" TEXT,
    "keywords" TEXT[],
    "platformType" TEXT NOT NULL DEFAULT 'custom',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "contentType" TEXT NOT NULL DEFAULT 'video',
    "videoDuration" INTEGER,
    "videoResolution" TEXT,
    "videoFileSize" BIGINT,
    "videoHash" TEXT,
    "pdfPageCount" INTEGER,
    "pdfFileSize" BIGINT,
    "pdfHash" TEXT,
    "pdfAuthor" TEXT,
    "fileExtension" TEXT,
    "fileThumbnail" TEXT,
    "lastScannedAt" TIMESTAMP(3),
    "scanCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProtectedContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Infringement" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceDomain" TEXT,
    "title" TEXT,
    "snippet" TEXT,
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'detected',
    "evidenceScreenshot" TEXT,
    "autoDetected" BOOLEAN NOT NULL DEFAULT true,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Infringement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DMCANotice" (
    "id" TEXT NOT NULL,
    "infringementId" TEXT NOT NULL,
    "recipientType" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "recipientName" TEXT,
    "noticeContent" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sentAt" TIMESTAMP(3),
    "responseAt" TIMESTAMP(3),
    "responseContent" TEXT,
    "removalConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DMCANotice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoticeEvent" (
    "id" TEXT NOT NULL,
    "noticeId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "details" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoticeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanJob" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "scanType" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "resultsCount" INTEGER NOT NULL DEFAULT 0,
    "infringementsFound" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "ProtectedContent_userId_idx" ON "ProtectedContent"("userId");

-- CreateIndex
CREATE INDEX "ProtectedContent_isActive_idx" ON "ProtectedContent"("isActive");

-- CreateIndex
CREATE INDEX "ProtectedContent_contentType_idx" ON "ProtectedContent"("contentType");

-- CreateIndex
CREATE INDEX "Infringement_contentId_idx" ON "Infringement"("contentId");

-- CreateIndex
CREATE INDEX "Infringement_status_idx" ON "Infringement"("status");

-- CreateIndex
CREATE INDEX "Infringement_detectedAt_idx" ON "Infringement"("detectedAt");

-- CreateIndex
CREATE INDEX "DMCANotice_infringementId_idx" ON "DMCANotice"("infringementId");

-- CreateIndex
CREATE INDEX "DMCANotice_status_idx" ON "DMCANotice"("status");

-- CreateIndex
CREATE INDEX "NoticeEvent_noticeId_idx" ON "NoticeEvent"("noticeId");

-- CreateIndex
CREATE INDEX "ScanJob_contentId_idx" ON "ScanJob"("contentId");

-- CreateIndex
CREATE INDEX "ScanJob_status_idx" ON "ScanJob"("status");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProtectedContent" ADD CONSTRAINT "ProtectedContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Infringement" ADD CONSTRAINT "Infringement_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ProtectedContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DMCANotice" ADD CONSTRAINT "DMCANotice_infringementId_fkey" FOREIGN KEY ("infringementId") REFERENCES "Infringement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoticeEvent" ADD CONSTRAINT "NoticeEvent_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "DMCANotice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
