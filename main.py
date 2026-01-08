import pickle
import time
print("Loading card information...")

with open('card_data', 'rb') as f: # Open in read-binary mode ('rb')
    id_db = pickle.load(f)

print("Card information loaded. Loading queries...")

queries = []
query_script = {}
with open('queries.txt', 'r') as query_file:
    for line in query_file:
        queries.append(line.rstrip().split('|')[0])
        query_script[line.rstrip().split('|')[0]] = line.rstrip().split('|')[1]

print("Queries loaded.")

possible_cards = []
for key in id_db:
    possible_cards.append(key)

while True:
    print(str(len(possible_cards))+ " possible cards remaining...")

    #find an index that splits the card list
    best_min = 0
    best_idx = 0
    for i in range(len(queries)):
        one_ct = 0
        for c in possible_cards:
            if id_db[c][i] == 1:
                one_ct += 1
        current_min = min(one_ct, len(possible_cards)-one_ct)
        if current_min > best_min:
            best_min = current_min
            best_idx = i
    if best_min == 0:
        print("unable to distinguish between these " + str(len(possible_cards)) + " cards:")
        print(possible_cards)
        break
    answer = input(str(query_script[queries[best_idx]])+"\n")
    result = 0
    if "y" in answer.lower():
        result = 1
    #cull possible cards based on result
    possible_cards = [i for i in possible_cards if id_db[i][best_idx] == result]

    if len(possible_cards) == 1:
        print(possible_cards[0])
        break
    time.sleep(0.2)