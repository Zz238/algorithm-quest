class Solution {
    public int[] sortArray(int[] nums) {
        int[] temp = new int[nums.length];
        sort(nums, temp, 0, nums.length - 1);
        return nums;
    }
    private void sort(int[] a, int[] t, int l, int r) {
        if (l >= r) return;
        int m = l + (r - l) / 2;
        sort(a, t, l, m);
        sort(a, t, m + 1, r);
        int i = l, j = m + 1, k = l;
        while (i <= m && j <= r) {
            if (a[i] <= a[j]) t[k++] = a[i++];
            else t[k++] = a[j++];
        }
        while (i <= m) t[k++] = a[i++];
        while (j <= r) t[k++] = a[j++];
        for (int p = l; p <= r; p++) a[p] = t[p];
    }
}
