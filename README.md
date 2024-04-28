# Mass Flow Controller App

## How to compile

1. Go to `app` folder
2. Run `electron-builder install-app-deps`
3. Next run some command below: 
    * `npx electron-builder --win` for Windows;
    * `npx electron-builder --linux rpm` for systems like Fedora/RPM;
    * `npx electron-builder --linux deb` for systems like Ubuntu/Debian;
    * `npx electron-builder --linux AppImage` for an universal AppImage;
    * `npx electron-builder --linux tar.xz` for systems like Ubuntu/Debian;
4. After the build, you have an installator!