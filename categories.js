const fs = require("fs/promises");
const categoriesDir = "./data/categories"
const minPhrases = 2
const maxPhrases = 6
const minSentences = 4
const maxSentences = 7
const trailingCommaChance = 0.15

const categories = {
    // Create a new category
    createCategory: function (category) {
        // Check if category already exists
        fs.access(`${categoriesDir}/${category}.json`)
            // If category exists, fulfills with undefined
            .then(value => console.log(JSON.stringify({ "Error": `Category \'${category}\' already exists` })))
            // If category does not exist, create it
            .catch(error => {
                fs.writeFile(`${categoriesDir}/${category}.json`, JSON.stringify({ phrases: [] }), 'utf-8')
                    // If successful, fulfills with undefined
                    .then(resolve => console.log(`Successfully created category: ${category}`))
                    // If error writing file
                    .catch(error => console.log("Error writing file: \n", error))
            })
    },
    // Read the phrases of a category
    readPhrases: function (category) {
        return fs.readFile(`${categoriesDir}/${category}.json`, 'utf-8')
            .then(content => {
                const object = JSON.parse(content);
                // console.log(`Phrases in ${category} category:`, object.phrases);
                return object.phrases;
            })
            // If error reading file
            .catch(error =>  { return {"Error": "Category not found"}})
    },
    // Add a phrase to a category
    addPhrase: function (category, phrase) {
        fs.readFile(`${categoriesDir}/${category}.json`, 'utf-8')
            .then(content => {
                // Create an object from the file
                const object = JSON.parse(content)
                // Push the phrase into the phrases array
                object.phrases.push(phrase);

                // Create a JSON string with the new object
                const string = JSON.stringify(object)
                // Write the file with the new string
                fs.writeFile(`${categoriesDir}/${category}.json`, string)
                    // Fulfills with undefined
                    .then(resolve => console.log(`Successfully added phrase: \'${phrase}\' to category: \'${category}\'`))
                    // If error writing file
                    .catch(error => console.log(error))
            })
            // If error reading file
            .catch(error => console.log(error))
    },
    // Delete phrases from a category
    removePhrase: function (category, phrase) {
        fs.readFile(`${categoriesDir}/${category}.json`, 'utf-8')
            .then(content => {
                // Create an object from the file
                const object = JSON.parse(content)

                // Check if phrase exists
                if (object.phrases.includes(phrase)) {
                    // Includes the phrase, remove it
                    object.phrases = object.phrases.filter(p => p !== phrase)

                    // Create a JSON string with the new object
                    const string = JSON.stringify(object)
                    // Write the file with the new string
                    fs.writeFile(`${categoriesDir}/${category}.json`, string)
                        // Fulfills with undefined
                        .then(resolve => console.log(`Successfully removed phrase: \'${phrase}\' from category: \'${category}\'`))
                        // If error writing file
                        .catch(error => console.log(error))
                }
                else {
                    // Does not include phrase, return
                    return console.log({ "Error": `Category: \'${category}\' does not contain the phrase \'${phrase}\'` })
                }
            })
            // If error reading file
            .catch(error => console.log(error))
    },
    // Delete category
    removeCategory: function (category) {
        fs.unlink(`${categoriesDir}/${category}.json`)
            // Fulfills with undefined
            .then(resolve => console.log(`Successfully removed category: \'${category}\'`))
            // If error deleting category
            .catch(error => console.log({ "Error": `Could not remove category: \'${category}\', it may not exist` }, error))
    },
    // Filter phrases to create a sentence
    filterPhrases: function(phrases, numberOfPhrases, sentence) {
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
            return this.filterPhrases(availablePhrases, numberOfPhrases, sentence)
        }
        else {
            // Add period to end of sentence
            sentence[sentence.length - 1] += "."
    
            // Return the completed sentece
            return sentence
        }
    },
    // Create a sentence
    createSentence: function(category) {
        // Generate number of phrases
        const numberOfPhrases = Math.max(minPhrases, Math.round(Math.random() * maxPhrases));
    
        // Create empty sentence array for appending phrases
        let sentence = [];
    
        // Returns final sentence as an array
        return this.readPhrases(category)
            .then(phrases => {
                return this.filterPhrases(phrases, numberOfPhrases, sentence)
            })
            .catch(error => error)
    },
    // Create a paragraph
    createParagraph: function(category) {
        // Generate number of sentences
        const numberOfSentences = Math.max(minSentences, Math.round(Math.random() * maxSentences));
    
        // Create empty array for appending sentences
        let paragraph = [];
    
        return new Promise((resolve, reject) => {
            // call createSentence numberOfSentences times
            for (let i = 0; i < numberOfSentences; i++) {
                this.createSentence(category)
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
    },
    // Create paragraphs
    createParagraphs: function(category, numberOfParagraphs) {
        // Create empty array for appending paragraphs
        let paragraphs = [];
    
        return new Promise((resolve, reject) => {
            // call createParagraph numberOfParagraphs times
            for (let i = 0; i < numberOfParagraphs; i++) {
                this.createParagraph(category)
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
}

module.exports = categories