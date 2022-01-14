const categories = require("./categories");
const minPhrases = 2
const maxPhrases = 6
const minSentences = 4
const maxSentences = 7
const trailingCommaChance = 0.15

function createParagraphs(category, numberOfParagraphs) {
    // Create empty array for appending paragraphs
    let paragraphs = [];

    return new Promise((resolve, reject) => {
        // call createParagraph numberOfParagraphs times
        for (let i = 0; i < numberOfParagraphs; i++) {
            createParagraph(category)
                .then(paragraph => {
                    // Convert paragraph from array to string with spaces between sentences
                    paragraph = paragraph.join(" ")

                    paragraphs.push(paragraph)

                    if (i === numberOfParagraphs - 1) {
                        // Return the array  of paragraphs
                        resolve(paragraphs)
                    }
                })
        }
    })
}

function createParagraph(category) {
    // Generate number of sentences
    const numberOfSentences = Math.max(minSentences, Math.round(Math.random() * maxSentences));

    // Create empty array for appending sentences
    let paragraph = [];

    return new Promise((resolve, reject) => {
        // call createSentence numberOfSentences times
        for (let i = 0; i < numberOfSentences; i++) {
            createSentence(category)
                .then(sentence => {
                    // Convert sentence from array to string
                    sentence = sentence.join("")

                    // Push sentence to paragraph
                    paragraph.push(sentence)

                    if (i === numberOfSentences - 1) {
                        // Return the array  of sentences
                        resolve(paragraph)
                    }
                })
        }
    })
}

function createSentence(category) {
    // Generate number of phrases
    const numberOfPhrases = Math.max(minPhrases, Math.round(Math.random() * maxPhrases));

    // Create empty sentence array for appending phrases
    let sentence = [];

    // Returns final sentence as an array
    return categories.readPhrases(category)
        .then(phrases => {
            return filterPhrases(phrases, numberOfPhrases, sentence)
        })
        .catch(error => error)
}

function filterPhrases(phrases, numberOfPhrases, sentence) {
    let availablePhrases = phrases

    // Choose random phrase
    let phrase = availablePhrases[Math.floor(Math.random() * availablePhrases.length)]

    // Filter out the chosen phrase from availablePhrases
    availablePhrases = availablePhrases.filter(p => p !== phrase);

    // Capitalize the first letter of the first phrase in the sentence
    if (sentence.length === 0) {
        let splitPhrase = phrase.split("")

        splitPhrase[0] = splitPhrase[0].toUpperCase()

        phrase = splitPhrase.join("")
    }
    // Add a space to the beginning of each phrase that is not the first phrase in the sentence
    else {
        phrase = " " + phrase
    }

    // Give phrase a random chance of having a trailing comma, but not the last phrase in a sentence
    if (numberOfPhrases > sentence.length + 1) {
        const hasComma = Math.random() <= trailingCommaChance ? true : false

        if (hasComma) {
            phrase += ","
        }
    }

    // Add phrase to sentence
    sentence.push(phrase)

    // Call filterPhrases again until the sentence is as long as numberOfPhrases
    if (numberOfPhrases > sentence.length) {
        return filterPhrases(availablePhrases, numberOfPhrases, sentence)
    }
    else {
        // Add period to end of sentence
        sentence[sentence.length - 1] += "."

        // Return the completed sentece
        return sentence
    }
}

module.exports = createParagraphs