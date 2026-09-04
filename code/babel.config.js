module.exports = function (api) {
     const envName = api.env ? api.env() : process.env.BABEL_ENV;
     const isTest = envName === 'test';
     api.cache(() => isTest);
     const presets = isTest
          ? ['babel-preset-expo']
          : [["babel-preset-expo", {
               jsxImportSource: "nativewind"
          }], "nativewind/babel"];

     return {
          presets,
          plugins: [[
               'module:react-native-dotenv',
               {
                    envName: 'APP_ENV',
                    moduleName: '@env',
                    path: '.env',
               },
          ], 'transform-inline-environment-variables', '@babel/plugin-transform-class-static-block', 'react-native-reanimated/plugin', ["module-resolver", {
               root: ["./"],

               alias: {
                    "@": "./",
                    "tailwind.config": "./tailwind.config.js"
               }
          }]],
     };
};
