import jsonData from '../card_data.json' with { type: 'json' };
//1. load card information^^^ and html elements
let queryRaw;

fetch('js/queries.txt')
  .then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
  })
  .then(text => {
    queryRaw = text; // Assign the result to the variable
    console.log("Inside .then(): Data assigned to variable.");
    // Data is available here immediately
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });

async function startGame() {
    //2. load queries (this really should be a json
    console.log("starting...");
    const numLeft = document.getElementById("numLeft");
    numLeft.textContent = "Number of cards left: 35205";

    let queries = [];
    let prompts = [];
    queryRaw.split("\n").forEach((line, idx) => {
        queries.push(line.split('|')[0]);
        prompts.push(line.split('|')[1]);
    });

    //3. populate possible cards (all of them)
    let possibleCards = Object.keys(jsonData);
    //4. initiate game loop
    while (true) {
        const pghElement = document.getElementById("myParagraph");
        const numLeft = document.getElementById("numLeft");

        //6. Determine the ideal query
        let best_min = 0;
        let best_idx = 0;
        for (let i = 0; i < queries.length; i++) {
            let one_ct = 0;
            for (let c = 0; c < possibleCards.length; c++) {
                if (jsonData[possibleCards[c]][i] == 1) {
                    one_ct++;
                }
            }
            let current_min = Math.min(one_ct, possibleCards.length - one_ct);
            if (current_min > best_min) {
                best_min = current_min;
                best_idx = i;
            }
        }
        //7. check if unable to distinguish
        if (best_min == 0) {
            pghElement.textContent = "Unable to distinguish between " + possibleCards.join();
            break;
        }

        //8. Print chosen query
        console.log(prompts[best_idx]);
        pghElement.textContent = prompts[best_idx];

        //9. Receive user input
        let input = await getInput("yesButton", "noButton");
        console.log(input)
        let num = 0;
        if (input == "yesButton") {
            num = 1;
        }
        //10. update possible cards list
        possibleCards = possibleCards.filter(card => jsonData[card][best_idx] == num);
        numLeft.textContent = "Number of cards left: " + possibleCards.length;

        //11. check if the game is done
        if (possibleCards.length == 1) {
            pghElement.textContent = "Your card is " + possibleCards[0];
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
