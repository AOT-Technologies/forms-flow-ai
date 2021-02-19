module.exports = {
    runtimeCompiler: true,
    devServer: {
      port: '4000',
      proxy: 'https://bpm2.aot-technologies.com/camunda',
      }
  }
  