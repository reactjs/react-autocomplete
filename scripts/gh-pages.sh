#!/bin/sh -e

if [ -n "$(git status --porcelain)" ]; then
    echo "Working directory is not clean!"
    exit 1
fi
git checkout master
npm run build:examples
cp -r examples/* .
touch .nojekyll
git add -A
git commit -m 'Updating gh-pages'
git push --force origin HEAD:gh-pages
git reset --hard HEAD^
