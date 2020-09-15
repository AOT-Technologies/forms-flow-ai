module.exports = {
  // mode: 'development',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            ['es2015', {modules: false}],
            'react',
            'stage-2'
          ]
        }
      }
    ]
  }
};
