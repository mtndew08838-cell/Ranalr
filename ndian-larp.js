// ==KettuPlugin==
// @name Indian Discord Larp
// @description LARP as another user (username + avatar)
// @version 1.1.0
// ==/KettuPlugin==

export default {
    name: "IndianDiscordLarp",
    description: "Spoof username and avatar (LARP)",
    version: "1.1.0",

    settings: {
        targetUserId: { type: "string", description: "Target User ID", default: "" },
        targetUsername: { type: "string", description: "Target Username", default: "" }
    },

    start() {
        this.targetUserId = this.settings.targetUserId?.value ?? this.settings.targetUserId;
        this.targetUsername = this.settings.targetUsername?.value ?? this.settings.targetUsername;

        if (!this.targetUserId || !this.targetUsername) {
            console.log("[IndianLarp] Set Target User ID and Username in settings!");
            return;
        }

        this.addCSS();
        this.initLarp();
    },

    stop() {
        document.getElementById("indian-larp-css")?.remove();
        this.observer?.disconnect();
    },

    addCSS() {
        const style = document.createElement("style");
        style.id = "indian-larp-css";
        style.textContent = `[class*="typingDots"] { display: none !important; }`;
        document.head.appendChild(style);
    },

    async initLarp() {
        const webpack = window.Kettu?.Webpack || window.vendetta?.webpack;
        if (!webpack) return setTimeout(() => this.initLarp(), 2000);

        const UserStore = webpack.findByStoreName?.("UserStore");
        if (!UserStore) return setTimeout(() => this.initLarp(), 1500);

        this.currentUser = UserStore.getCurrentUser();
        if (!this.currentUser) return setTimeout(() => this.initLarp(), 1500);

        this.targetUser = await UserStore.getUser(this.targetUserId).catch(() => null);
        this.replaceAvatars(document.body);

        this.observer = new MutationObserver(() => this.replaceAvatars(document.body));
        this.observer.observe(document.body, { childList: true, subtree: true });
    },

    replaceAvatars(root) {
        if (!this.currentUser?.id || !this.targetUserId) return;

        root.querySelectorAll("img").forEach(img => {
            const src = img.src || "";
            if (src.includes(`/avatars/${this.currentUser.id}/`)) {
                img.src = src.replace(`/avatars/${this.currentUser.id}/`, `/avatars/${this.targetUserId}/`);
            }
        });

        root.querySelectorAll("[style*='background-image']").forEach(el => {
            let style = el.style.backgroundImage || "";
            if (style.includes(`/avatars/${this.currentUser.id}/`)) {
                el.style.backgroundImage = style.replace(`/avatars/${this.currentUser.id}/`, `/avatars/${this.targetUserId}/`);
            }
        });
    }
};