import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import Components from "unplugin-vue-components/vite"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"
import AutoImport from "unplugin-auto-import/vite"

export default ({ mode }) => {
  console.log(mode === "development" ? "开发环境 " + mode : "生产环境 " + mode)
  return defineConfig({
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [
          // 使用unplugin-vue-components按需加载样式，开发环境会导致项目异常卡顿
          // 导致原因：vite会预加载style，当首次启动 vite 服务时会对 style 进行依赖预构建，，因为element-plus的按需样式会导入大量style文件，导致页面会卡住直至style构建完成
          // https://github.com/antfu/unplugin-vue-components/issues/361
          //  这里开发环境不按需加载样式，生产环境才按需加载样式
          ElementPlusResolver({
            importStyle: mode === "development" ? false : "sass",
          }),
        ],
      }),
      // 使用unplugin-vue-components按需加载样式，开发环境会导致项目异常卡顿
      // 导致原因：vite会预加载style，当首次启动 vite 服务时会对 style 进行依赖预构建，，因为element-plus的按需样式会导入大量style文件，导致页面会卡住直至style构建完成
      // https://github.com/antfu/unplugin-vue-components/issues/361
      // 这里自定义一个vite插件，更改src/main.js内容，开发环境全局引入样式
      {
        name: "dev-auto-import-element-plus",
        transform(code, id) {
          if (/src\/main.js$/.test(id) && mode === "development") {
            return {
              code: `${code};import 'element-plus/dist/index.css';`,
              map: null,
            }
          }
        },
      },
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  })
}
