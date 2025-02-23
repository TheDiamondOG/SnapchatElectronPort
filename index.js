const { app, BrowserWindow, session } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        icon: path.join(__dirname, "icon.png"),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            sandbox: true,
        }
    });

    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    win.webContents.setUserAgent(userAgent);

    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
        details.requestHeaders["User-Agent"] = userAgent;
        delete details.requestHeaders["Electron"];
        delete details.requestHeaders["x-requested-with"];
        callback({ cancel: false, requestHeaders: details.requestHeaders });
    });

    win.webContents.on("will-navigate", (event, url) => {
        if (!url.startsWith("https://web.snapchat.com") && url.includes("https://snapchat.com") && !url.startsWith("https://accounts.snapchat.com/accounts/v2/login")) {
            event.preventDefault();
            win.loadURL("https://accounts.snapchat.com/accounts/v2/login");
        }
    });

    win.webContents.on("did-navigate", (event, url) => {
        if (!url.startsWith("https://web.snapchat.com") && url.startsWith("https://snapchat.com") && !url.startsWith("https://accounts.snapchat.com/accounts/v2/login")) {
            win.loadURL("https://accounts.snapchat.com/accounts/v2/login");
        }
    });

    win.webContents.setWindowOpenHandler(({ url }) => {
        win.loadURL(url);
        return { action: "deny" };
    });

    win.loadURL("https://web.snapchat.com/");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
