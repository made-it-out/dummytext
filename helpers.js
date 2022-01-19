const helpers = {
    // Create a string of random alphanumeric characters, of a given length
    createRandomString: function (length) {
        length = typeof (length) === 'number' && length > 0 ? length : false;

        if (length) {
            // Define all the possible characters that could go into a string
            const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

            // Start the final string
            let string = '';
            for (let i = 1; i <= length; i++) {
                // Get a random character from the possibleCharacters string
                const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

                // Append this character to the final string
                string += randomCharacter;
            }

            // Return the final string
            return string;
        } else {
            return false;
        }
    },
    // Parse a JSON string to an object in all cases, without throwing
    parseJSONToObject: function (string) {
        try {
            const object = JSON.parse(string);
            return object;
        } catch (exception) {
            return {};
        }
    }
}

module.exports = helpers