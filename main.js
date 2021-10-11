import SVGIcons2SVGFontStream from "svgicons2svgfont";
import svg2ttf from "svg2ttf";

import { readdir, stat, writeFile } from "fs/promises";
import { createReadStream } from "fs";

import { listIconMarkdown } from "./src/icons.js";

const getAllIcons = async (path, icons = [[], []]) => {
    const files = await readdir(path);
    for (const file of files) {
        const stats = await stat(path + "/" + file);

        if (stats.isDirectory()) {
            icons = await getAllIcons(path + "/" + file, icons);
        } else {
            const filetype = file.split(".")[1];
            if (filetype === "svg") {
                icons[1].push(file);
                icons[0].push(path + "/" + file);
            }
        }
    }

    return icons;
};

const firstUTF = "e900";
let data = "";

(async () => {
    const fontStream = new SVGIcons2SVGFontStream({
        fontName: "mini-file-icons",
        normalize: true,
        fontHeight: 1000,
    });

    const icons = await getAllIcons("./icons");
    const [iconPaths, iconNames] = icons;

    const iconsLength = iconPaths.length;

    // Credit https://stackoverflow.com/a/63886620/16065010
    const indices = Array.from(iconNames.keys());
    indices.sort((a, b) => iconNames[a].localeCompare(iconNames[b]));

    let utf = firstUTF;
    let iconUnicode = [utf];

    for (let i = 0; i < iconsLength; i++) {
        const iconIndex = indices[i];

        const glyph = createReadStream(iconPaths[iconIndex]);
        glyph.metadata = {
            unicode: [String.fromCharCode(parseInt(utf, 16))],
            name: iconNames[iconIndex],
        };

        fontStream.write(glyph);

        // Credit https://stackoverflow.com/a/31439284/16065010
        utf = (parseInt(utf, 16) + 1).toString(16);
        iconUnicode.push(utf);
    }

    fontStream.end();

    fontStream.on("data", (chunk) => {
        data += chunk;
    });

    fontStream.on("end", async () => {
        const ttf = svg2ttf(data, {});
        await writeFile("./fonts/mini-file-icons.ttf", Buffer.from(ttf.buffer));

        listIconMarkdown(indices, iconPaths, iconNames, iconUnicode);
    });
})();
