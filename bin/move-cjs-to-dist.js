import { resolve, dirname, parse, format } from "node:path";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

function convertToAbsolutePath(relativePath) {
  return resolve(dirname(fileURLToPath(import.meta.url)), relativePath);
}

async function moveAndRename(source, destination) {
  for (const entry of await readdir(convertToAbsolutePath(source), {
    withFileTypes: true,
  })) {
    if (entry.isDirectory()) {
      await moveAndRename(
        `${source}/${entry.name}`,
        `${destination}/${entry.name}`
      );
    }

    if (entry.isFile()) {
      const { ext: extension, name: filename } = parse(entry.name);

      if (extension !== ".js") {
        continue;
      }

      const fileContent = await readFile(
        convertToAbsolutePath(`${source}/${entry.name}`),
        "utf8"
      );

      const rewrittenContent = fileContent.replace(
        /require\("(\..+?).js"\)/g,
        (_, capture) => {
          return `require("${capture}.cjs")`;
        }
      );

      const renamed = format({ name: filename, ext: ".cjs" });

      await writeFile(
        convertToAbsolutePath(`${destination}/${renamed}`),
        rewrittenContent,
        "utf8"
      );
    }
  }
}

moveAndRename("../build/cjs", "../dist").catch((err) => {
  console.error(err);
  process.exit(1);
});
