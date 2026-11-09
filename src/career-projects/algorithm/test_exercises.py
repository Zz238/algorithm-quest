import unittest
from exercises import *

class PracticeTests(unittest.TestCase):
    def test_sum(self):
        self.assertEqual(sum_values([2, 4, 1]), 7)
        self.assertEqual(sum_values([]), 0)
    def test_words(self):
        self.assertEqual(word_counts(['java', 'sql', 'java']), {'java': 2, 'sql': 1})
        self.assertEqual(word_counts([]), {})
    def test_dot(self):
        self.assertEqual(dot([1, 2], [3, 4]), 11)
        self.assertEqual(dot([], []), 0)
        with self.assertRaises(ValueError): dot([1], [])
    def test_mean(self):
        self.assertEqual(mean([2, 4, 6]), 4)
        with self.assertRaises(ValueError): mean([])
    def test_error(self):
        self.assertEqual(mse([2, 4], [1, 3]), 1)
        with self.assertRaises(ValueError): mse([1], [])
    def test_split(self):
        a, b = split_rows([1, 2, 3, 4], 2)
        self.assertEqual((a, b), ([1, 2], [3, 4]))
        self.assertFalse(set(a) & set(b))
        with self.assertRaises(ValueError): split_rows([1], 0)
    def test_fit(self):
        self.assertEqual(fit_line([1, 2, 3], [2, 4, 6]), (2, 0))
        self.assertEqual(predict_line((2, 1), [3]), [7])
        with self.assertRaises(ValueError): fit_line([1, 1], [2, 3])
    def test_accuracy(self):
        self.assertEqual(accuracy([1, 0, 0, 0], [0, 0, 0, 0]), .75)
        with self.assertRaises(ValueError): accuracy([], [])
    def test_recall(self):
        self.assertEqual(recall([1, 0, 0, 0], [0, 0, 0, 0]), 0)
        self.assertEqual(recall([0], [0]), 0)
    def test_similarity(self):
        self.assertAlmostEqual(jaccard(['array', 'loop'], ['array', 'search']), 1/3)
        self.assertEqual(jaccard([], []), 0)
    def test_recommendation(self):
        courses = [{'id':'arrays','tags':['array'],'requires':[]}, {'id':'hash','tags':['array','lookup'],'requires':['arrays']}, {'id':'tree','tags':['tree'],'requires':['recursion']}, {'id':'loop','tags':['array'],'requires':[]}]
        self.assertEqual(recommend(courses, ['arrays'], 2), ['loop', 'hash'])
        self.assertEqual(recommend(courses, ['arrays'], 0), [])
        self.assertEqual(recommend([], [], 3), [])

if __name__ == '__main__': unittest.main()
