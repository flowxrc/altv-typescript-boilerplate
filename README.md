## altv-tsc
alt:V typescript boilerplate with altv-pkg.
### Git-ignored files
- All files in the resources with the `dlc_` prefix, except the `stream.toml` since the dlcpacks are large in size.
- All files in the `src/server-files` directory, except [altv-pkg configuration](https://github.com/altmp/altv-pkg).
- Miscellaneous directories like `node_modules` and `dist` (the build target directory).
### Setup
Open the command line, navigate to the repository folder and run.
```bash
npm run install
```
Run the following command, or use the `Update Binaries.bat` script.
```bash
npm run update
```
### Building
Run the following command, or use the `Build Server.bat` script.
```bash
npm run build
```