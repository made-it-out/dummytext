const fs = require("fs/promises");
const minPhrases = 4
const maxPhrases = 6
const minSentences = 4
const maxSentences = 7
const trailingCommaChance = 0.15
const Category = require('./models/category');

const categories = {
    // Create a new category
    createCategory(category) {
        return Category.findOne({ name: category })
            .then(document => {
                // If document is found, return
                if (document) {
                    return { "Error": `Category \'${category}\' already exists` }
                }
                // Else create category
                return Category.create({ name: category, phrases: [] })
            })
            .then(result => {
                // If the result has _id property, that means a new category was created, so return success message
                if(result._id){
                    return {"message": `Category \'${category}\' created`}
                }
                // Otherwise the result would be the error object message from the previous then()
                return result
            })
            .catch(error => error)
    },
    // Get all categories
    getCategories(){
        return Category.find({})
        .then(categories => categories.map(category => category.name))
        .catch(error => error)
    },
    // Read the phrases of a category
    readPhrases(category) {
        // If given category is mixed, choose a new category every time readPhrases is called (every sentence)
        if(category === 'mixed'){
            return Category.find({})
            .then(categories => {
                const randomNumber = Math.floor(Math.random() * categories.length)
                return categories[randomNumber].phrases
            })
            .catch(error => error)
        }
        else{
            return Category.findOne({ name: category })
            .then(category => category.phrases)
            .catch(error => error)
        }
        
    },
    // Add a phrase to a category
    addPhrase(category, phrase) {
        return Category.findOne({ name: category })
            .then(document => {
                // If document is found, add phrase and save
                if (document) {
                    // Check that phrase does not already exist
                    if(document.phrases.includes(phrase)){
                        return { "Error": `Phrase \'${phrase}\' already exists` }
                    }
                    document.phrases.push(phrase)
                    return document.save()
                }
                // Else return not found
                return { "Error": `Category \'${category}\' not found` }

            })
            .then(result => {
                // If document was found, document.save() returns the document
                if(result.phrases){
                    return { category, phrases: result.phrases }
                }
                // If document was not found, return not found from previous .then()
                return result
            })
            .catch(error => error)
    },
    // Delete phrases from a category
    removePhrase(category, phrase) {
        return Category.findOne({ name: category })
            .then(document => {
                // If document is found, remove phrase and save
                if (document) {
                    document.phrases = document.phrases.filter(p => p !== phrase)
                    return document.save()
                }
                // Else return not found
                return { "Error": `Category ${category} not found` }
            })
            .then(result => {
                // If document was found, document.save() returns the document
                if(result.phrases){
                    return { category, phrases: result.phrases }
                }
                // If document was not found, return not found from previous .then()
                return result
            })
            .catch(error => error)
    },
    // Delete category
    removeCategory(category) {
        return Category.deleteOne({name: category})
        .then(result => {
            // If a category is actually deleted
            if(result.deletedCount > 0){
                return {"message": `Category \'${category}\' deleted`}
            }
            // If no category was found
            return {"Error": `Category \'${category}\' not found`}
        })
        .catch(error => error)
    },
    // Filter phrases to create a sentence
    filterPhrases(phrases, numberOfPhrases, sentence) {
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
    createSentence(category) {
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
    createParagraph(category) {
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

                        if (paragraph.length === numberOfSentences) {
                            // Return the array  of sentences
                            resolve(paragraph)
                        }
                    })
                    .catch(error => reject(error))
            }
        })
    },
    // Create paragraphs
    createParagraphs(category, numberOfParagraphs) {
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

                        if (paragraphs.length === numberOfParagraphs) {
                            // Return the array  of paragraphs
                            resolve(paragraphs)
                        }
                    })
                    .catch(error => reject(error))
            }
        })
    }
}

module.exports = categories