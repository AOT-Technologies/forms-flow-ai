module.exports = {
  runtimeCompiler: true,
  devServer: {
    port: '3000',
    proxy: {
      '/engine-rest': {
        target: 'https://bpm3.aot-technologies.com/camunda',
        ws: true,
        changeOrigin: true,
        pathRewrite: {

        }
      }
    }
  }
}
