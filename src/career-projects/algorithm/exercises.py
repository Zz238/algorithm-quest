"""Reference implementation. Synthetic examples, Python standard library only."""

def sum_values(values):
    total = 0
    for value in values:
        total += value
    return total

def word_counts(words):
    counts = {}
    for word in words:
        counts[word] = counts.get(word, 0) + 1
    return counts

def dot(a, b):
    if len(a) != len(b):
        raise ValueError("dimensions differ")
    return sum(x * y for x, y in zip(a, b))

def mean(values):
    if not values:
        raise ValueError("empty sample")
    return sum(values) / len(values)

def mse(actual, predicted):
    if not actual or len(actual) != len(predicted):
        raise ValueError("invalid samples")
    return mean([(x - y) ** 2 for x, y in zip(actual, predicted)])

def split_rows(rows, cut):
    if not 0 < cut < len(rows):
        raise ValueError("both partitions must be nonempty")
    return list(rows[:cut]), list(rows[cut:])

def fit_line(xs, ys):
    if len(xs) != len(ys) or len(xs) < 2:
        raise ValueError("invalid training data")
    mx, my = mean(xs), mean(ys)
    variance = sum((x - mx) ** 2 for x in xs)
    if variance == 0:
        raise ValueError("input variance is zero")
    w = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / variance
    return w, my - w * mx

def predict_line(model, xs):
    w, b = model
    return [w * x + b for x in xs]

def accuracy(actual, predicted):
    if not actual or len(actual) != len(predicted):
        raise ValueError("invalid samples")
    return sum(x == y for x, y in zip(actual, predicted)) / len(actual)

def recall(actual, predicted):
    if len(actual) != len(predicted):
        raise ValueError("dimensions differ")
    positives = sum(x == 1 for x in actual)
    return sum(x == 1 and y == 1 for x, y in zip(actual, predicted)) / positives if positives else 0.0

def jaccard(a, b):
    a, b = set(a), set(b)
    return len(a & b) / len(a | b) if a | b else 0.0

def recommend(courses, completed, top_k):
    completed = set(completed)
    tags = {tag for course in courses if course['id'] in completed for tag in course['tags']}
    candidates = [c for c in courses if c['id'] not in completed and set(c.get('requires', [])) <= completed]
    candidates.sort(key=lambda c: (-jaccard(tags, c['tags']), c['id']))
    return [c['id'] for c in candidates[:max(0, top_k)]]

if __name__ == '__main__':
    xs, ys = [1, 2, 3], [2, 4, 6]
    model = fit_line(xs, ys)
    prediction = predict_line(model, [4, 5])
    baseline = [mean(ys)] * 2
    print({'model': model, 'test_mse': mse([8, 10], prediction), 'baseline_mse': mse([8, 10], baseline)})
