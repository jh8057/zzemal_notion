function isValid(s) {
  const temp = [];

  const maps = new Map();
  maps.set("(", ")");
  maps.set("{", "}");
  maps.set("[", "]");
  for (let i = 0; i < s.length; i++) {
    if (maps.has(s[i])) {
      temp.push(s[i]);
    } else {
      if (!temp.length) return false;
      if (maps.get(temp.pop()) !== s[i]) return false;
    }
  }

  return !temp.length;
}

console.log(isValid("(())"));
