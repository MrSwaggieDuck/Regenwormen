from math import factorial


k = 8 # Amount of dices to throw
n = 6 # Amount of side on each 

LOWEST_TILE = 21
TILE_AMOUNT = 16


out = [False]*TILE_AMOUNT
available = [True]*TILE_AMOUNT
others = [False]*TILE_AMOUNT


def calculate_throws (n, k):
	result = []

	if (k == 1):
		return [(1, ), (2, ), (3, ), (4, ), (5, ), (6, )]
	else:
		prev = calculate_throws (n, k-1)
		for i in range (len(prev)):
			for j in range(prev[i][-1], n+1):
				result.append(prev[i] + (j, ))

	return result

def worm_value (throw):
	if not (6 in throw):
		return 0
	x = sum(throw)
	if x < 21:
		return 0
	elif x < 25:
		return 1
	elif x < 29:
		return 2
	elif x < 33:
		return 3
	else:
		return 4

def sum(tup):
	s = 0
	for v in tup:
		s += v
	return s

def prob_of_throw (throw, k=6):
	bottom = 1
	for i in range (k+1):
		bottom *= factorial(throw.count(i))
	result = (factorial(len(throw)) / bottom) * (1/k)**len(throw)
	return result

def merge_states (a, b):
	return tuple(sorted(a+b))

expected_values = {}
states = calculate_throws(n, k)

for s in states:
	expected_values[s] = worm_value(s)



for t in reversed(range(1, 8)):
	possible_states = calculate_throws(6, t)
	possible_throws = calculate_throws(6, 8-t)
	# For every state check for every throw the chance and expected value after throw
	for state in possible_states:
		expected_value_take = worm_value(state)
		expected_value_roll = 0
		# For every throw calculate chance and expected value for best take
		sum_chance = 0
		for throw in possible_throws:
			chance = prob_of_throw(throw)
			sum_chance += chance
			best_take = 0
			best_worm_value = 0
			# For every take calculate the new state and expected_value
			for take in range(1,7):
				if (take in state or not take in throw):
					continue
				else:
					state_after_take = merge_states(state, tuple(filter(lambda x: x == take, throw)))
					if (expected_values[state_after_take] > best_worm_value):
						best_take = take
						best_worm_value = expected_values[state_after_take]
			expected_value_roll += chance*best_worm_value
		print(sum_chance)
		expected_values[state] = max(expected_value_take, expected_value_roll)

print (expected_values)
		
