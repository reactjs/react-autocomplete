'use strict'

const fs = require('fs')
const map = require('lodash.map')
const flow = require('lodash.flow')
const sortBy = require('lodash.sortby')
const docgen = require('react-docgen')

const TYPES = {
  any: 'Any',
  array: 'Array',
  func: 'Function',
  bool: 'Boolean',
  string: 'String',
  number: 'Number',
  object: 'Object',
}

const SECRET_PROPS = [
  'debug',
]

function parse (filePath) {
  return docgen.parse(fs.readFileSync(filePath, 'utf-8')).props
}

function toArray (props) {
  return map(props, (prop, name) => Object.assign({ name }, prop))
}

function prune (props) {
  SECRET_PROPS.forEach(secret => {
    if (!props.some(p => p.name === secret)) {
      throw new Error(`\`${secret}\` is marked as a 'secret' prop, but it's not present in \`propTypes\``)
    }
  })
  return props.filter(p => !SECRET_PROPS.includes(p.name))
}

function sort (props) {
  return sortBy(props, [p => !p.required, 'name'])
}

function prepareDescription (props) {
  return props.map(prop => {
    const description = prop.description ? `${prop.description}\n` : ''
    return Object.assign({}, prop, { description })
  })
}

function prepareDefaultValue (props) {
  return props.map(prop => {
    let { defaultValue } = prop
    if (defaultValue) {
      if (defaultValue.value.includes('\n')) {
        defaultValue = `\n\`\`\`jsx\n${defaultValue.value}\n\`\`\``
      } else {
        defaultValue = ` \`${defaultValue.value}\``
      }
      defaultValue = `Default value:${defaultValue}\n\n`
    } else {
      defaultValue = ''
    }
    return Object.assign({}, prop, { defaultValue })
  })
}

function format (props) {
  return props.reduce((str, { name, type, required, description, defaultValue }) => {
    if (type) {
      return `${str}#### \`${name}: ${TYPES[type.name]}\`${required ? '' : ' (optional)'}\n${defaultValue}${description}\n`
    } else {
      throw new Error(`ERROR: \`${name}\` is present in \`defaultProps\` but not in \`propTypes\`!`)
    }
  }, '')
}

module.exports = flow(parse, toArray, prune, sort, prepareDescription, prepareDefaultValue, format)
