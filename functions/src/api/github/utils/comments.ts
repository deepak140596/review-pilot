import { HighLevelSummary } from "../../../models/high-level-summary";
const stringSimilarity = require('string-similarity');

export function generateTextSummary(summary: HighLevelSummary) {
    let text = '';
    if (summary.styles) {
        text += generateSection('Style', summary.styles);
    }
    if (summary.bugFixes) {
        text += generateSection('Bug Fixes', summary.bugFixes);
    }
    if (summary.chores) {
        text += generateSection('Chores', summary.chores);
    }
    if (summary.refactors) {
        text += generateSection('Refactor', summary.refactors);
    }
    if (summary.newFeatures) {
        text += generateSection('New Features', summary.newFeatures);
    }
    return text;
}


function generateSection(title: string, items: string[]) {

    if (items.length === 0) {
        return '';
    }

    let text = `- **${title}**\n`;
    items.forEach(item => {
        text += `\t- ${item}\n`;
    });
    return text;
}

export async function filterDuplicateComments(existingComments: any[], newComments: any[]) {

    const threshold = 0.5;
    const filteredComments: any[] = [];

    newComments.forEach(newComment => {
        var isDuplicate = false;
        console.log(`Calculating similarity for comment: ${newComment.body}`);
        existingComments.forEach(existingComment => {
            try {
                if (existingComment.path === newComment.path) {
                    const similarity = stringSimilarity.compareTwoStrings(newComment.body, existingComment.body);
                    console.log(`Similarity: ${similarity}`)
                    console.log(`Existing comment: ${existingComment.body}` )
                    if (similarity >= threshold) {
                        isDuplicate = true;
                    }
                }
            } catch (error) {
                console.error(`Error comparing comments: ${error}`);
            }
        });
        if (!isDuplicate) {
            filteredComments.push(newComment);
            console.log(`Result : New comment`);
        } else {
            console.log(`Result : Duplicate comment`);
        }
    })

    return filteredComments;
}

