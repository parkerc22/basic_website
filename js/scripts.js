import jsonData from '../card_data.json' with { type: 'json' };
//1. load card information^^^ and html elements
let queryRaw;
let queries = [];
let prompts = [];
let qtypes = [];
fetch('./queries.txt')
  .then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
  })
  .then(text => {
    queryRaw = text; // Assign the result to the variable
    // Data is available here immediately
    
    queryRaw.split("\n").forEach((line, idx) => {
        queries.push(line.split('|')[0]);
        prompts.push(line.split('|')[1]);
        qtypes.push(line.split('|')[2]);
    });  
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });

async function startGame() {
    //2. load queries (this really should be a json
    const numLeft = document.getElementById("numLeft");
    numLeft.textContent = "Number of cards left: 32635";
    let queries = [];
    let prompts = [];
    let qtypes = [];
    queryRaw.split("\n").forEach((line, idx) => {
        queries.push(line.split('|')[0]);
        prompts.push(line.split('|')[1]);
        qtypes.push(line.split('|')[2]);
    });  
    

    let prev_qtype = "";

    //3. populate possible cards (all of them)
    let possibleCards = Object.keys(jsonData);
    const linkElement = document.getElementById("scryfallLink");
    linkElement.href = "https://scryfall.com";
    linkElement.textContent = "";
    //4. initiate game loop
    while (true) {
        const pghElement = document.getElementById("myParagraph");
        const numLeft = document.getElementById("numLeft");

        //6. Determine the best 5 queries
        let best_min = [];
        let best_idx = [];
        for (let i = 0; i < queries.length; i++) {
            //make sure we don't reuse a prompt of the same type we just had
            let one_ct = 0;
            for (let c = 0; c < possibleCards.length; c++) {
                if (jsonData[possibleCards[c]][i] == 1) {
                    one_ct++;
                }
            }
            let current_min = Math.min(one_ct, possibleCards.length - one_ct);
            if ((best_min.length <= 5) || (current_min > Math.min(...best_min))) {
                best_min.push(current_min);
                best_idx.push(i);
                // check if the arrays are big enough for us to cut the last element from
                if (best_min.length == 6) {
                    // find the min element idx
                    let r = best_min.indexOf(Math.min(...best_min));
                    best_min.splice(r, 1);
                    best_idx.splice(r, 1);
                }
            }
        }

        //7. check if unable to distinguish
        if (Math.max(...best_min) == 0) {
            pghElement.textContent = "Unable to distinguish between " + possibleCards.join();
            break;
        }

        //8. Randomly choose a query and print it
        let final_idx = weightedRandom(best_min, best_idx, prev_qtype, qtypes);
        prev_qtype = qtypes[final_idx];
        pghElement.textContent = prompts[final_idx];

        //9. Receive user input
        let input = await getInput("yesButton", "noButton");
        let num = 0;
        if (input == "yesButton") {
            num = 1;
        }
        //10. update possible cards list
        possibleCards = possibleCards.filter(card => jsonData[card][final_idx] == num);
        numLeft.textContent = "Number of cards left: " + possibleCards.length;

        //11. check if the game is done
        if (possibleCards.length == 1) {
            pghElement.textContent = "Your card is ";
            const linkElement = document.getElementById("scryfallLink");
            linkElement.href = "https://scryfall.com/search?q=%22" + possibleCards[0] + "%22";
            linkElement.textContent = possibleCards[0];
            break;
        }
    }
}
function getInput(buttonAId, buttonBId) {
    return new Promise((resolve) => {
        const buttonA = document.getElementById(buttonAId);
        const buttonB = document.getElementById(buttonBId);

        // Define the function that resolves the promise
        const clickHandler = (event) => {
            // Remove the event listeners after the first click to prevent memory leaks and repeated calls
            buttonA.removeEventListener('click', clickHandler);
            buttonB.removeEventListener('click', clickHandler);
            // Resolve the promise with the ID of the clicked button
            resolve(event.target.id);
        };

        // Add event listeners to both buttons
        buttonA.addEventListener('click', clickHandler);
        buttonB.addEventListener('click', clickHandler);
    });
}


// Get the button element by its ID
const button1 = document.getElementById("startGame");

// Add a 'click' event listener to the button
button1.addEventListener("click", startGame);

function weightedRandom(weights, items, prevType, qtypes) {
    let i;
    for (i = 0; i < weights.length; i++) {
        if (qtypes[items[i]]===prevType) {
            weights[i] *= 0.15;
        }
    }
    for (i = 1; i < weights.length; i++)
        weights[i] += weights[i - 1];
    
    let random = Math.random() * weights[weights.length - 1];
    for (i = 0; i < weights.length; i++)
        if (weights[i] > random)
            break;
    return items[i];
}
