-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReelScript" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reelProjectId" TEXT NOT NULL,
    "title" TEXT,
    "hook" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "hashtags" TEXT NOT NULL,
    "audioSuggestion" TEXT,
    "scenesJson" TEXT NOT NULL,
    "generationSource" TEXT NOT NULL DEFAULT 'local',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReelScript_reelProjectId_fkey" FOREIGN KEY ("reelProjectId") REFERENCES "ReelProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ReelScript" ("audioSuggestion", "caption", "createdAt", "hashtags", "hook", "id", "reelProjectId", "scenesJson", "updatedAt") SELECT "audioSuggestion", "caption", "createdAt", "hashtags", "hook", "id", "reelProjectId", "scenesJson", "updatedAt" FROM "ReelScript";
DROP TABLE "ReelScript";
ALTER TABLE "new_ReelScript" RENAME TO "ReelScript";
CREATE UNIQUE INDEX "ReelScript_reelProjectId_key" ON "ReelScript"("reelProjectId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
