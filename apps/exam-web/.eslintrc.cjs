const customAntiCheatCheckerOn = {
  create(context) {
    return {
      VariableDeclaration(node) {
        node.declarations.forEach(declaration => {
          if (
            declaration.init &&
            declaration.init.type === 'CallExpression' &&
            declaration.init.callee.name === 'useState' &&
            declaration.init.arguments.length > 0 &&
            declaration.init.arguments[0].type === 'Literal' &&
            declaration.init.arguments[0].value === true &&
            declaration.id.type === 'ArrayPattern' &&
            declaration.id.elements.length === 2 &&
            declaration.id.elements[0].name === 'canUpdateDishonesty' &&
            declaration.id.elements[1].name === 'setCanUpdateDishonesty'
          ) {
            context.report({
              node: declaration.init.arguments[0],
              message: 'State variable "canUpdateDishonesty" initial value must be true.',
              fix(fixer) {
                return fixer.replaceText(declaration.init.arguments[0], 'true');
              }
            });
          }
        });
      }
    };
  }
};

const eptsPlugin = {
  rules: {
    "enforce-anti-check-initial-true": customAntiCheatCheckerOn
  }
}

module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ['react-refresh'],
  // plugins: {
  //   "enpitsu-custom-lint": eptsPlugin
  // },
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
  },
};
