import { writeFile } from "fs/promises";

const listIconMarkdown = async (
    iconIndexs,
    iconPaths,
    iconNames,
    iconUnicodes
) => {
    let markdownFile = `# List icons

This is list of icons with svg icon, name of icon and unicode

| Icon | Name | Unicode |
| ---- | ---- | ------- |
`;

    const iconsLength = iconIndexs.length;
    for (let i = 0; i < iconsLength; i++) {
        const iconIndex = iconIndexs[i];

        const iconUnicode = String.fromCharCode(parseInt(iconUnicodes[i], 16));

        let row = "| ";
        row += `![${iconNames[iconIndex]}](${iconPaths[iconIndex]}) | ${iconNames[iconIndex]} | ${iconUnicode} |\n`;

        markdownFile += row;
    }

    await writeFile("./icons.md", markdownFile);
};

export { listIconMarkdown };
