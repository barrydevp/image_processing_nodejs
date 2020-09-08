const isUndef = v => v === null || v === undefined
const isFunc = f => typeof f === 'function'
const isNumber = n => typeof n === 'number'
const isString = s => typeof s === 'string'
const isArray = Array.isArray
const isObject = obj => obj && !isArray(obj) && typeof obj === 'object'
const isPromise = p => p && isFunc(p.then)
const isIterator = it => it && isFunc(it.next) && isFunc(it.throw)
const isIterable = it =>
    it && isFunc(Symbol) ? isFunc(it[Symbol.iterator]) : isArray(it)
const isStringableFunc = f => isFunc(f) && f.hasOwnProperty('toString')
const isSymbol = sym =>
    Boolean(sym) &&
    typeof Symbol === 'function' &&
    sym.constructor === Symbol &&
    sym !== Symbol.prototype
const isDate = date => !isNaN(Date.parse(date))
const isInstanceOf = (obj, _Class) => obj instanceof _Class

exports.isUndef = isUndef
exports.isFunc = isFunc
exports.isNumber = isNumber
exports.isString = isString
exports.isArray = isArray
exports.isObject = isObject
exports.isPromise = isPromise
exports.isIterator = isIterator
exports.isIterable = isIterable
exports.isStringableFunc = isStringableFunc
exports.isSymbol = isSymbol
exports.isDate = isDate
exports.isInstanceOf = isInstanceOf
