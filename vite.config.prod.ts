import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
    base: "./",
    plugins: [
        vue()
    ],
    resolve: {
        alias: {
            "@": path.join(__dirname, "src")
        }
    },
    define: {
        runtimeConfig: JSON.stringify({})
    }
});
