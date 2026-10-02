#!/usr/bin/env bash
# Met à jour la branche « hostinger » (hébergement Node.js Hostinger) avec : package.json, package-lock.json, server.js et site/.
# Usage depuis la racine du dépôt : bash tools/deploy-branch.sh   puis   git push origin hostinger
set -euo pipefail
branch=hostinger
tmp=$(mktemp -d)
trap 'git worktree remove --force "$tmp" >/dev/null 2>&1 || rm -rf "$tmp"' EXIT
if git show-ref --verify --quiet "refs/heads/$branch"; then git worktree add -q "$tmp" "$branch"
else git worktree add -q --orphan -b "$branch" "$tmp"; fi
find "$tmp" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp package.json package-lock.json server.js "$tmp"/
cp -r site "$tmp"/site
rm -f "$tmp/site/LISEZMOI-HOSTINGER.md"
cat > "$tmp/README.md" <<'MD'
# La Maison du Parquet · version hébergement (Node.js)
Branche générée par `tools/deploy-branch.sh` : ne pas modifier à la main.
Hostinger (Node.js) : commande de démarrage `npm start`, fichier d'entrée `server.js`, aucune commande de build.
MD
git -C "$tmp" add -A
if git -C "$tmp" diff --cached --quiet; then echo "Branche $branch déjà à jour"
else git -C "$tmp" commit -q -m "Déploiement : $(git log -1 --format=%s HEAD)" && echo "Branche $branch mise à jour"; fi
