const nums = [2, 3, 1, 2, 4, 3];
const target = 7;

let left = 0;
let sum = 0;
let answer = Infinity;

for (let right = 0; right < nums.length; right++) {
  sum += nums[right];

  while (sum >= target) {
    answer = Math.min(answer, right - left + 1);
    sum -= nums[left];
    left++;
  }
}

console.log(answer === Infinity ? 0 : answer); // 2
