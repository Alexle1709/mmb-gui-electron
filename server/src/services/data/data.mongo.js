
/* eslint quotes: 0 */
// Defines the MongoDB $jsonSchema for service `data`. (Can be re-generated.)
const merge = require('lodash.merge');
// !code: imports // !end
// !code: init // !end

let moduleExports = merge({},
  // !<DEFAULT> code: model
  {
    bsonType: "object",
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: "objectId"
      },
      model: {
        bsonType: "string"
      },
      rule: {
        bsonType: "string"
      },
      shock: {
        oneOf: [
          {
            type: "string",
            enum: [
              "Fis",
              "Mon"
            ]
          },
          {
            type: "null"
          }
        ],
        bsonType: "string"
      },
      func: {
        enum: [
          "IRF",
          "AC",
          "VAR"
        ],
        bsonType: "string"
      },
      outputvar: {
        enum: [
          "inflation",
          "interest",
          "output",
          "outputgap"
        ],
        bsonType: "string"
      },
      values: {
        bsonType: "string"
      }
    },
    required: [
      "model",
      "rule",
      "shock",
      "func",
      "outputvar",
      "values"
    ]
  },
  // !end
  // !code: moduleExports // !end
);

// !code: exports // !end
module.exports = moduleExports;

// !code: funcs // !end
// !code: end // !end
