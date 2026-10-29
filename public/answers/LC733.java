import java.util.ArrayDeque;
import java.util.Queue;
class Solution {
    public int[][] floodFill(int[][] image, int sr, int sc, int color) {
        int old = image[sr][sc];
        if (old == color) return image;
        int rows = image.length, cols = image[0].length;
        Queue<int[]> q = new ArrayDeque<>();
        q.offer(new int[]{sr, sc});
        image[sr][sc] = color;
        int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};
        while (!q.isEmpty()) {
            int[] p = q.poll();
            for (int[] d : dirs) {
                int r = p[0] + d[0], c = p[1] + d[1];
                if (r >= 0 && r < rows && c >= 0 && c < cols && image[r][c] == old) {
                    image[r][c] = color;
                    q.offer(new int[]{r, c});
                }
            }
        }
        return image;
    }
}
