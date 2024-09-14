import { createApp } from "vue";
import RootComponent from "./app.vue";

import "uikit/dist/js/uikit.min.js";
import "uikit/dist/js/uikit-icons.min.js";

const app = createApp(RootComponent);

app.mount("#root");
