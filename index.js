const phrases = ['lorem', 'ipsum','dolor','sit','amet']
const maxSentenceLength = 10;

function test(){
    console.log(phrases[Math.floor(Math.random() * phrases.length)])

    Math.round(Math.random() * maxSentenceLength + 1)
}
test()