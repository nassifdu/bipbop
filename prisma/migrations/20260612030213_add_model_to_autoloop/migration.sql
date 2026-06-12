-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AutoLoop" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "intervalSeconds" INTEGER NOT NULL DEFAULT 45,
    "model" TEXT NOT NULL DEFAULT 'google/gemma-3-4b-it',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AutoLoop" ("enabled", "id", "intervalSeconds", "updatedAt") SELECT "enabled", "id", "intervalSeconds", "updatedAt" FROM "AutoLoop";
DROP TABLE "AutoLoop";
ALTER TABLE "new_AutoLoop" RENAME TO "AutoLoop";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
