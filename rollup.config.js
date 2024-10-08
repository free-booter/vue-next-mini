import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'

export default [{
  input: 'packages/vue/src/index.ts',
  output: [
    {
      sourcemap: true,
      file: './packages/vue/dist/vue.js',
      // 生成包格式
      format: 'iife',
      name: 'Vue'
    }
  ],
  // 插件
  plugins: [
    // 模块导入的路径补全
    resolve(),
    typescript({
      sourceMap: true
    }),
    // 转 commonjs 为 ESM
    commonjs()
  ]
}]