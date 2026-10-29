class Solution {
    public int heightChecker(int[] heights) {
        int[] expected = new int[heights.length];
        for (int i = 0; i < heights.length; i++) {
            expected[i] = heights[i];
        }
        for (int end = expected.length - 1; end > 0; end--) {
            for (int i = 0; i < end; i++) {
                if (expected[i] > expected[i + 1]) {
                    int temp = expected[i];
                    expected[i] = expected[i + 1];
                    expected[i + 1] = temp;
                }
            }
        }
        int count = 0;
        for (int i = 0; i < heights.length; i++) {
            if (heights[i] != expected[i]) count++;
        }
        return count;
    }
}
