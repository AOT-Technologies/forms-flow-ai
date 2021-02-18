module.exports = {
    runtimeCompiler: true,
    devServer: {
      port: '3000',
      proxy: 'https://bpm2.aot-technologies.com/camunda',
      }
  }
  