const input = [100, 4, 200, 1, 3, 2];

const input2 = [0, 3, 7, 2, 5, 8, 4, 6, 0, 1];

const input3 = [1, 2, 10, 11, 12];

const input4 = [1, 3];

const findMax = (arr) => {
  const newSet = new Set(arr);
  let sum = 0;

  for (let i = 0; i < arr.length; i++) {
    let target = arr[i];
    let hasNum = newSet.has(target - 1);
    if (!hasNum) {
      let temp = 0;
      let hasNextNum = newSet.has(target + 1);
      while (hasNextNum) {
        target++;
        hasNextNum = newSet.has(target + 1);
        temp++;
        sum = Math.max(sum, temp);
      }
    }
  }

  return sum + 1;
};

// const result = findMax(input);
// console.log(result);

// const result2 = findMax(input2);
// console.log(result2);

// const result3 = findMax(input3);
// console.log(result3);

const result4 = findMax(input4);
console.log(result4);
