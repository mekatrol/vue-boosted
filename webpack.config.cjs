const fs = require('fs');
const os = require('os');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const dts = require('dts-bundle');

const file = fs.readFileSync('./package.json');
const json = JSON.parse(file);

const libraryName = json.name;

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'this',
    library: libraryName
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true
        }
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  externals: [nodeExternals()]
};

const bundleDts = () => {
  const outputFile = path.resolve('dist/index.d.ts');

  // Bundle the ts files (simply finds all .d.ts files and merges them)
  dts.bundle({
    name: libraryName,
    main: './__staging/index.d.ts',
    out: outputFile,
    removeSource: false,
    outputAsModuleFolder: true // to use npm in-package typings
  });

  // Add our header to .d.ts file (replease generated header)
  const content = fs.readFileSync(outputFile).toString().split(os.EOL);
  content[0] = `// ${libraryName} type definitions`;
  const fileContent = content.join(os.EOL);
  fs.writeFileSync(outputFile, fileContent);
};

bundleDts();
