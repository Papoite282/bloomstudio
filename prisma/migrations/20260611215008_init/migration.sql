-- CreateTable
CREATE TABLE "ReelProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'MIXED',
    "mood" TEXT NOT NULL DEFAULT 'SOFT',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "format" TEXT NOT NULL DEFAULT '9:16',
    "hook" TEXT,
    "caption" TEXT,
    "hashtags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
