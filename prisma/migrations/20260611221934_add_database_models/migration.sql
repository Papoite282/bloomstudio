/*
  Warnings:

  - You are about to drop the column `caption` on the `ReelProject` table. All the data in the column will be lost.
  - You are about to drop the column `format` on the `ReelProject` table. All the data in the column will be lost.
  - You are about to drop the column `hashtags` on the `ReelProject` table. All the data in the column will be lost.
  - You are about to drop the column `hook` on the `ReelProject` table. All the data in the column will be lost.
  - You are about to drop the column `mood` on the `ReelProject` table. All the data in the column will be lost.
  - You are about to drop the column `sourceType` on the `ReelProject` table. All the data in the column will be lost.
  - Added the required column `objective` to the `ReelProject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `style` to the `ReelProject` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "BrandProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "colors" TEXT,
    "audience" TEXT,
    "language" TEXT NOT NULL DEFAULT 'pt',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reelProjectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration" REAL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MediaAsset_reelProjectId_fkey" FOREIGN KEY ("reelProjectId") REFERENCES "ReelProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReelScript" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reelProjectId" TEXT NOT NULL,
    "hook" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "hashtags" TEXT NOT NULL,
    "audioSuggestion" TEXT,
    "scenesJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReelScript_reelProjectId_fkey" FOREIGN KEY ("reelProjectId") REFERENCES "ReelProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReelExport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reelProjectId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "duration" INTEGER,
    "resolution" TEXT NOT NULL DEFAULT '1080x1920',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReelExport_reelProjectId_fkey" FOREIGN KEY ("reelProjectId") REFERENCES "ReelProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReelProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "template" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 15,
    "language" TEXT NOT NULL DEFAULT 'pt',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ReelProject" ("createdAt", "id", "status", "title", "updatedAt") SELECT "createdAt", "id", "status", "title", "updatedAt" FROM "ReelProject";
DROP TABLE "ReelProject";
ALTER TABLE "new_ReelProject" RENAME TO "ReelProject";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "MediaAsset_reelProjectId_idx" ON "MediaAsset"("reelProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "ReelScript_reelProjectId_key" ON "ReelScript"("reelProjectId");

-- CreateIndex
CREATE INDEX "ReelExport_reelProjectId_idx" ON "ReelExport"("reelProjectId");
