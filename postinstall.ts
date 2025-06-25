import path from "path";
import fse from "fs-extra";

const topDir = __dirname;
fse.emptyDirSync(path.join(topDir, "public", "tinymce"));
fse.copySync(
  path.join(topDir, "node_modules", "tinymce"),
  path.join(topDir, "public", "tinymce"),
  { overwrite: true, dereference: true },
);
