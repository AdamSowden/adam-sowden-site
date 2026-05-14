// Launcher: sets CWD to project root then runs next dev
process.chdir(__dirname);
process.argv = [process.argv[0], process.argv[1], "dev", "--port", "3014"];
require("./node_modules/next/dist/bin/next");
