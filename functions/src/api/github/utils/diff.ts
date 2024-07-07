export function getDiffHunk(files: any[], filePath: string, position: number): string | null {
    for (const file of files) {
        if (file.filename === filePath) {
            const lines = file.patch.split('\n');
            if (position <= lines.length) {
                return lines[position - 1];
            }
        }
    }

    return null;
}

export function filterDiff(diffContent: string) {
    // Split the diff into lines for easier processing
    const lines = diffContent.split('\n');

    // Flag to indicate if we are within a block that should be retained
    let retainBlock = false;

    // Define patterns that indicate the start of code file diffs
    const codeFilePatterns = [
		/^diff --git a\/.*\.tsx b\/.*\.tsx$/, // TSX files
        /^diff --git a\/.*\.ts b\/.*\.ts$/,   // TypeScript files
        /^diff --git a\/.*\.js b\/.*\.js$/,   // JavaScript files
        /^diff --git a\/.*\.jsx b\/.*\.jsx$/, // JSX files
        /^diff --git a\/.*\.html b\/.*\.html$/, // HTML files
        /^diff --git a\/.*\.scss b\/.*\.scss$/, // SCSS files
        /^diff --git a\/.*\.css b\/.*\.css$/,  // CSS files

        // Android files
        /^diff --git a\/.*\.java b\/.*\.java$/, // Java files
        /^diff --git a\/.*\.kt b\/.*\.kt$/, // Kotlin files
        /^diff --git a\/.*\.xml b\/.*\.xml$/, // XML files
        /^diff --git a\/.*\.gradle b\/.*\.gradle$/, // Gradle files

        // IOS files
        /^diff --git a\/.*\.swift b\/.*\.swift$/, // Swift files
        /^diff --git a\/.*\.m b\/.*\.m$/, // Objective-C files
        /^diff --git a\/.*\.plist b\/.*\.plist$/, // Plist files
        /^diff --git a\/.*\.storyboard b\/.*\.storyboard$/, // Storyboard files

        // Flutter files
        /^diff --git a\/.*\.dart b\/.*\.dart$/, // Dart files
        /^diff --git a\/.*\.json b\/.*\.json$/, // JSON files

        // Python files
        /^diff --git a\/.*\.py b\/.*\.py$/, // Python files

        // Ruby files
        /^diff --git a\/.*\.rb b\/.*\.rb$/, // Ruby files

        // Go files
        /^diff --git a\/.*\.go b\/.*\.go$/, // Go files

        // PHP files
        /^diff --git a\/.*\.php b\/.*\.php$/, // PHP files

        // C# files
        /^diff --git a\/.*\.cs b\/.*\.cs$/, // C# files

        // C++ files
        /^diff --git a\/.*\.cpp b\/.*\.cpp$/, // C++ files

        // C files
        /^diff --git a\/.*\.c b\/.*\.c$/, // C files

        // Rust files
        /^diff --git a\/.*\.rs b\/.*\.rs$/, // Rust files

        // Shell files
        /^diff --git a\/.*\.sh b\/.*\.sh$/, // Shell files

        // SQL files
        /^diff --git a\/.*\.sql b\/.*\.sql$/, // SQL files

        // Docker files
        /^diff --git a\/.*\.dockerfile b\/.*\.dockerfile$/, // Docker files

        // YAML files
        /^diff --git a\/.*\.yml b\/.*\.yml$/, // YAML files

        // Terraform files
        /^diff --git a\/.*\.tf b\/.*\.tf$/, // Terraform files

        // Markdown files
        /^diff --git a\/.*\.md b\/.*\.md$/, // Markdown files


    ];

    // Filter lines, retaining only blocks that match the code file patterns
    const filteredLines = lines.filter(line => {
        if (codeFilePatterns.some(pattern => pattern.test(line))) {
            retainBlock = true;  // Start retaining this block
            return true; // Ensure the diff --git line itself is also retained
        } else if (line.startsWith('diff --git') && retainBlock) {
            retainBlock = false; // End of the retained block and start of a new block
        }

        // Return true to keep the line, false to remove it
        return retainBlock;
    });

    // Join the remaining lines back into a single string
    return filteredLines.join('\n');
}

export function splitDiff(diff: string): string[][] {
    const lines = diff.split('\n');

    // Store arrays of lines, each array is one file's diff
    let currentFileLines: string[] = [];
    const fileSections: string[][] = [];

    lines.forEach(line => {
        if (line.startsWith('diff --git')) {
            if (currentFileLines.length > 0) {
                fileSections.push(currentFileLines);
                currentFileLines = [];
            }
        }
        currentFileLines.push(line);
    });

    // Don't forget to add the last set of lines
    if (currentFileLines.length > 0) {
        fileSections.push(currentFileLines);
    }

    return fileSections;
}

export function splitIntoGroups(fileSections: string[][], numberOfGroups : number): string[] {
    const groups: string[][] = new Array(numberOfGroups).fill(null).map(() => []);
    let currentGroupIndex = 0;

    fileSections.forEach(section => {
        const group = groups[currentGroupIndex];
        group.push(section.join('\n')); // Add the whole file section as a single string

        // Move to the next group, wrap around if necessary
        currentGroupIndex = (currentGroupIndex + 1) % numberOfGroups;
    });

    const filteredGroup = groups.filter((group, index) => {
       return group.length > 0
    })

    let splitGroups: string[] = []
    filteredGroup.forEach((group, index) => {
       const joinedFile = group.join('\n')
       splitGroups.push(joinedFile)
    })
    return splitGroups;
}

export function labelsToCommaSeparatedString(labels: { name: string }[]): string {
    return labels.map(label => label.name).join(', ');
}

export function addPositionToDiffHunks(diffContent: string): string {
    // Split the diff content into lines
    const lines = diffContent.split('\n');
    let modifiedLines: string[] = [];
    let inHunk = false;
    let lineCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('@@')) {
            // Reset line count at the start of a new hunk
            lineCount = 0;
            inHunk = true;
            modifiedLines.push(line + ' // Position: 0');
        } else if (inHunk) {
            if (line.startsWith('-') || line.startsWith(' ')) {
                // Count context and removal lines
                lineCount++;
                modifiedLines.push(line + ` // Position: ${lineCount}`);
                
            } else if (line.startsWith('+')) {
                // Count addition lines
                lineCount++;
                modifiedLines.push(line + ` // Position: ${lineCount}`);
            } else {
                // No longer in hunk
                inHunk = false;
            }
        } else {
            modifiedLines.push(line);
        }
    }

    // Join the modified lines back into a single string
    return modifiedLines.join('\n');
}