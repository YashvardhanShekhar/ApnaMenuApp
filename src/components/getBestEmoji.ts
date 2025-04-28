const levenshtein = (a:string, b:string) => {
  const tmp = [];
  let i,
    j,
    alen = a.length,
    blen = b.length,
    row,
    slen = 0;
  for (i = 0; i <= alen; i++) {
    tmp[i] = [i];
  }
  for (j = 0; j <= blen; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= alen; i++) {
    row = tmp[i];
    for (j = 1; j <= blen; j++) {
      slen = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j - 1] + 1, row[j] + 1, tmp[i - 1][j - 1] + slen);
    }
  }
  return tmp[alen][blen];
};

const emojiMap: Record< string, string> = {
  snacks: '🍟',
  beverages: '🥤',
  dessert: '🍰',
  burger: '🍔',
  pizza: '🍕',
  coffee: '☕',
  icecream: '🍦',
  appetizers: '🍤',
  soups: '🍲',
  salads: '🥗',
  entrees: '🥘',
  sides: '🍞',
  sandwiches: '🥪',
  pasta: '🍝',
  sushi: '🍣',
  tacos: '🌮',
  steak: '🥩',
  seafood: '🦞',
  chicken: '🍗',
  fish: '🐟',
  rice: '🍚',
  noodles: '🍜',
  breakfast: '🥞',
  tea: '🫖',
  juices: '🧃',
  alcoholic: '🍸',
  wine: '🍷',
  beer: '🍺',
  cakes: '🎂',
  pies: '🥧',
  cookies: '🍪',
  pastries: '🥐',
  vegan: '🌱',
  vegetarian: '🥦',
  cocktails: '🍹',
}

// Function to get the best matching emoji even with spelling errors
const getBestEmoji = (input : string) => {
  let closestMatch = null;
  let minDistance = Infinity;

  // Loop through emojiMap to find the closest match
  for (const keyword in emojiMap) {
    const distance = levenshtein(input.toLowerCase(), keyword.toLowerCase());
    if (distance < minDistance) {
      minDistance = distance;
      closestMatch = emojiMap[keyword];
    }
  }

  // If no close match is found, return a default emoji
  return closestMatch || '📋';
};

export default getBestEmoji;
