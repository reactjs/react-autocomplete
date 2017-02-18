'use strict'

const fs = require('fs')
const pkg = require('../package.json')
const generateDocFromModule = require('./generate-api-doc.js')

try {
  const API_DOC = generateDocFromModule(`${__dirname}/../lib/Autocomplete.js`)
  const readme = fs.readFileSync(`${__dirname}/../README-template.md`, 'utf-8')
    .replace(/\$\{API_DOC\}/g, API_DOC)
    .replace(/\$\{VERSION\}/g, pkg.version)
  fs.writeFileSync(`${__dirname}/../README.md`, readme)
} catch (e) {
  console.error(e)
  process.exit(1)
}
