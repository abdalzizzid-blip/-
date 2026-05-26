// local fallback mapping to platform native DOMException
module.exports = globalThis.DOMException || Error;
