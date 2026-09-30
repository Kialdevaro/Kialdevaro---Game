const fs = require('fs');

async function updateGamesJson() {
  console.log("Memulai pengambilan data game dari GameMonetize...");

  const categories = ['All', 'Action', 'Puzzle', 'Racing', 'Arcade', 'Adventure', 'Sports', 'Strategy', 'Casual', 'Shooting'];
  const types = ['html5', 'mobile'];
  let requests = [];

  categories.forEach(cat => {
    types.forEach(t => {
      const url = `https://rss.gamemonetize.com/rssfeed.php?format=json&category=${cat}&type=${t}&popularity=newest&company=All&amount=All`;
      requests.push(
        fetch(url)
          .then(res => res.ok ? res.json() : [])
          .catch(() => [])
      );
    });
  });

  const results = await Promise.all(requests);
  let rawGMList = [];
  results.forEach(arr => {
    if (Array.isArray(arr)) {
      rawGMList = rawGMList.concat(arr);
    }
  });

  // Deduplikasi berdasarkan URL game
  const uniqueMap = new Map();
  rawGMList.forEach(game => {
    const title = game.title || game.name || 'Game';
    const url = game.url || game.gameurl || '';
    if (url && !uniqueMap.has(url)) {
      uniqueMap.set(url, {
        title: title,
        url: url,
        icon: game.thumb || game.image || 'https://cdn-icons-png.flaticon.com/512/330/330499.png',
        genre: game.category || game.genre || 'Arcade',
        newest: true
      });
    }
  });

  const finalGamesList = Array.from(uniqueMap.values());
  console.log(`Total game unik terkumpul: ${finalGamesList.length}`);

  fs.writeFileSync('games.json', JSON.stringify(finalGamesList, null, 2));
  console.log("File games.json berhasil diperbarui!");
}

updateGamesJson();
