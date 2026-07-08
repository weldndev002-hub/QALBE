const url = 'https://zltfiscpwffdefaucgbr.supabase.co/rest/v1';
const key = 'sb_publishable_RVL9vRhiWcZb7QMEhaLRtg_1NR67VJd';

async function fetchTable(table) {
  const res = await fetch(`${url}/${table}`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const data = await res.json();
  console.log(`\n=== ${table} ===`);
  console.log(JSON.stringify(data, null, 2));
}

async function run() {
  await fetchTable('features');
  await fetchTable('membership_tiers');
}
run();
