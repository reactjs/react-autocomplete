#!/bin/sh -e

if [ -n "$(git status --porcelain)" ]; then
    echo "Working directory is not clean!"
    exit 1
fi
if [ -z "$1" ]; then
    echo "No version specified! Usage: npm run release -- [major|minor|patch|x.x.x]"
    exit 1
fi
read -n1 -p "Have you remembered to update the CHANGELOG? (y/n) " answer
if [ "$answer" = 'y' -o "$answer" = 'Y' ]; then
    npm run generate-readme
    if [ -n "$(git status --porcelain)" ]; then
        git commit README.md -m 'Update README'
    fi
    npm version $1
    npm run build:component
    npm publish
    git push origin master --follow-tags
else
    exit 1
fi
