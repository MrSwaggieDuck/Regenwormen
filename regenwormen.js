let tiles_free = [21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36];
let tiles_out = [];
let tiles_enemy = [];
let losing_value = 0;
let player_count = 1;

function SelectFree (n) {
	// Check if tile not already free
	if (!tiles_free.includes(n)) {
		document.getElementById("free" + n).classList.add("selected");
		tiles_free.push(n);
		if (tiles_out.includes(n)) {
			tiles_out.splice(tiles_out.indexOf(n), 1);
			document.getElementById("out" + n).classList.remove("selected");
		} else if (tiles_enemy.includes(n)) {
			tiles_enemy.splice(tiles_enemy.indexOf(n), 1);
			document.getElementById("enemy" + n).classList.remove("selected");
		}
	}
}

function SelectEnemy (n) {
	// Check if tile not already enemy
	if (!tiles_enemy.includes(n)) {
		document.getElementById("enemy" + n).classList.add("selected");
		tiles_enemy.push(n);
		if (tiles_out.includes(n)) {
			tiles_out.splice(tiles_out.indexOf(n), 1);
			document.getElementById("out" + n).classList.remove("selected");
		} else if (tiles_free.includes(n)) {
			tiles_free.splice(tiles_free.indexOf(n), 1);
			document.getElementById("free" + n).classList.remove("selected");
		}
	}
}

function SelectOut (n) {
	// Check if tile not already out
	if (!tiles_out.includes(n)) {
		document.getElementById("out" + n).classList.add("selected");
		tiles_out.push(n);
		if (tiles_free.includes(n)) {
			tiles_free.splice(tiles_free.indexOf(n), 1);
			document.getElementById("free" + n).classList.remove("selected");
		} else if (tiles_enemy.includes(n)) {
			tiles_enemy.splice(tiles_enemy.indexOf(n), 1);
			document.getElementById("enemy" + n).classList.remove("selected");
		}
	}
}

function calculate_throws (n, k) {
	let result = []

	if (k == 1) {
		return [[1], [2], [3], [4], [5], [6]];
	} else {
		let prev = calculate_throws (n, k-1)
		for (let i = 0; i < prev.length; i++) {
			for (let j = prev[i][prev[i].length-1]; j < n+1; j++) {
				result.push([].concat(prev[i], [j]));
			}
		}
	}
	return result
}

function worm_value (state) {
	if (!state.includes(6)) {
		return 0;
	}

	

	x = state.reduce((a, b) => a + b, 0)

	while (tiles_out.includes(x) || x > 36) {
		x--;
	}

	let base;


	if (x < 21) {
		base = 0
	} else if (x < 25) {
		base = 1
	} else if (x < 29) {
		base = 2;
	} else if (x < 33) {
		base = 3;
	} else {
		base = 4;
	}

	if (tiles_free.includes(x)) {
		return base;
	} else if (tiles_enemy.includes(x)) {
		return base * (1 + 1/(player_count-1))
	} else {
		return 0;
	}
}

function factorial(num)
{
    var rval=1;
    for (var i = 2; i <= num; i++)
        rval = rval * i;
    return rval;
}

function prob_of_throw (t, k=6) {
	bottom = 1
	for (let i = 0; i < k+1; i++) {
		bottom *= factorial(t.filter(x => x == i).length);
	}
		
	result = (factorial(t.length) / bottom) * Math.pow(1/k, t.length);
	return result
}

function merge_states (a, b) {
	let result = ([].concat(a, b));
	result.sort();
	return result;
}

function state_to_string (state) {
	if (state == null) return;
	result = "";
	for (let i = 0; i < state.length; i++) {
		result = result.concat(state[i]);
	}
	return result;
}

function string_to_state (string) {
	result = [];
	for (let i = 0; i < string.length; i++) {
		result.push(parseInt(string.charAt(i)));
	}
	return result;
}

function calculate_roll (start, calculate_take=false, roll=null) {
	let start_string = state_to_string(start);
	let start_roll_string = state_to_string(roll);
	expected_values = {}
	states = calculate_throws(6, 8);

	states.forEach((s) => {
		expected_values[s] = worm_value(s);
	})	

	for (let t = 7; t > 0; t--) {
		possible_states = calculate_throws(6, t)
		possible_throws = calculate_throws(6, 8-t)
		// For every state check for every throw the chance and expected value after throw
		for (let state of possible_states) {
			let expected_value_take;
			if (worm_value(state) != 0) {
				expected_value_take = worm_value(state);
			} else {
				expected_value_take = -losing_value;
			}
			let expected_value_roll = 0
			// For every throw calculate chance and expected value for best take
			for (let t of possible_throws) {
				chance = prob_of_throw(t)
				let best_take = 0;
				let best_worm_value = -losing_value;
				
				// For every take calculate the new state and expected_value
				for (let take = 1; take < 7; take++) {
					if (state.includes(take) || !t.includes(take)) {
						continue
					} else {
						let state_after_take = merge_states(state, t.filter(x => x == take));
						if (expected_values[state_after_take] > best_worm_value) {
							best_take = take
							best_worm_value = expected_values[state_after_take]
						}
					}
				}
				expected_value_roll += chance*best_worm_value
				if (calculate_take && state_to_string(state) == start_string && state_to_string(t) == start_roll_string) {
					if (best_take == 0) {
						document.getElementById("take-result").textContent = "Dead";
					} else {
						document.getElementById("take-result").textContent = "Take " + best_take;
					}
				}
				
			}
			if (state_to_string(state) == start_string) {
				console.log(expected_value_take, expected_value_roll)
				if (expected_value_take >= expected_value_roll) {
					document.getElementById("roll-result").textContent = "Stop";
				} else {
					document.getElementById("roll-result").textContent = "Roll: " + expected_value_roll;
				}
				return;
			}
			
			expected_values[state] = Math.max(expected_value_take, expected_value_roll)	
		}
	}
	return expected_values[start];
}

function StartRollCalculations() {
	losing_value = parseInt(document.getElementById("losing-tile").value);
	player_count = parseInt(document.getElementById("player-count").value);
	start_state = string_to_state(document.getElementById("state-input").value).sort();
	calculate_roll(start_state);
}

function StartTakeCalculations() {
	losing_value = parseInt(document.getElementById("losing-tile").value);
	player_count = parseInt(document.getElementById("player-count").value);
	start_state = string_to_state(document.getElementById("state-input").value).sort();
	start_roll = string_to_state(document.getElementById("roll-input").value).sort();
	calculate_roll(start_state, true, start_roll);
}
	