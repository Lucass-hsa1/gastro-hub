// Pool de imagens reais de comida (Unsplash) — todos com URL estável.
// O fallback é o emoji se carregamento falhar (tratado no <img onError>).

type FoodCat =
  | 'burger' | 'pizza' | 'sushi' | 'sashimi' | 'pasta' | 'risoto' | 'salada'
  | 'mexicana' | 'doces' | 'bolos' | 'sorvete' | 'bebida' | 'cerveja' | 'vinho'
  | 'cafe' | 'suco' | 'acai' | 'padaria' | 'frango' | 'peixe' | 'carne'
  | 'sopa' | 'feijoada' | 'wrap' | 'pastel' | 'tapioca' | 'misc'

const POOLS: Record<FoodCat, string[]> = {
  burger: [
    '1568901346375-23c9450c58cd',
    '1571091718767-18b5b1457add',
    '1551782450-a2132b4ba21d',
    '1572802419224-296b0aeee0d9',
    '1586190848861-99aa4a171e90',
    '1550317138-10000687a72b',
  ],
  pizza: [
    '1513104890138-7c749659a591',
    '1565299624946-b28f40a0ae38',
    '1574071318508-1cdbab80d002',
    '1593504049359-74330189a345',
    '1588315029754-2dd089d39a1a',
    '1604068549290-dea0e4a305ca',
  ],
  sushi: [
    '1579871494447-9811cf80d66c',
    '1617196034796-73dfa7b1fd56',
    '1611143669185-af224c5e3252',
    '1607301406259-dfb186e15de8',
    '1580822184713-fc5400e7fe10',
    '1553621042-f6e147245754',
  ],
  sashimi: [
    '1611143669185-af224c5e3252',
    '1607301406259-dfb186e15de8',
    '1583623025817-d180a2221d0a',
  ],
  pasta: [
    '1551892374-ecf8754cf8b0',
    '1608897013039-887f21d8c804',
    '1621996346565-e3dbc646d9a9',
    '1572441710087-04ab5ba9a3a9',
    '1612874742237-6526221588e3',
    '1556761223-4c4282c73f77',
  ],
  risoto: [
    '1633964913295-ceb43826a07e',
    '1633964913849-96bb09cfd0b5',
    '1574484184081-afea8a62f9c7',
  ],
  salada: [
    '1512621776951-a57141f2eefd',
    '1546069901-ba9599a7e63c',
    '1607532941433-304659e8198a',
    '1505253758473-96b7015fcd40',
    '1540420773420-3366772f4999',
  ],
  mexicana: [
    '1565299585323-38d6b0865b47',
    '1551782450-17144efb9c50',
    '1582659499879-e4c80a5a3eed',
    '1626700051175-6818013e1d4f',
    '1599974579688-8dbdd335c77f',
  ],
  doces: [
    '1488477181946-6428a0291777',
    '1571115177098-24ec42ed204d',
    '1551024506-0bccd828d307',
    '1481391319762-47dff72954d9',
    '1528975604071-b4dc52a2d18c',
    '1606313564200-e75d5e30476c',
  ],
  bolos: [
    '1565958011703-44f9829ba187',
    '1578985545062-69928b1d9587',
    '1535254973040-607b474cb50d',
    '1606313564200-e75d5e30476c',
  ],
  sorvete: [
    '1567206563064-6f60f40a2b57',
    '1501443762994-82bd5dace89a',
    '1497034825429-c343d7c6a68f',
  ],
  bebida: [
    '1437418747212-8d9709afab22',
    '1544145945-f90425340c7e',
    '1551751299-1b51cab2694c',
    '1622543925917-763c34d1a86e',
    '1551024601-bec78aea704b',
  ],
  cerveja: [
    '1535958636474-b021ee887b13',
    '1571767454098-246b94fbcf70',
    '1604079628040-94301bb21b91',
    '1608270586620-248524c67de9',
    '1518176258769-f227c798150e',
  ],
  vinho: [
    '1568213816046-0ee1c42bd559',
    '1566995541428-f74b1b0dca91',
    '1547595628-c61a29f496f0',
    '1571999917907-051bda5d50d3',
  ],
  cafe: [
    '1509042239860-f550ce710b93',
    '1495474472287-4d71bcdd2085',
    '1521017432531-fbd92d768814',
  ],
  suco: [
    '1622597467836-f3285f2131b8',
    '1546173159-315724a31696',
    '1600718374662-0483d2b9da44',
  ],
  acai: [
    '1590301157890-4810ed352733',
    '1572443490709-c3b5ace7e15a',
    '1564144006388-615f7d96a9b3',
    '1638176067000-9e2b2a98df96',
  ],
  padaria: [
    '1568827999250-3f6afff96e66',
    '1509365465985-25d11c17e812',
    '1555507036-ab1f4038808a',
    '1586444248902-2f64eddc13df',
    '1517433367423-c7e5b0f35086',
  ],
  frango: [
    '1532550907401-a500c9a57435',
    '1562967914-608f82629710',
    '1604908176997-125f25cc6f3d',
    '1610057099443-fde8c4d50f91',
  ],
  peixe: [
    '1535140728325-a4d3707eee94',
    '1559847844-5315695dadae',
    '1580959375944-abd7e991f971',
    '1599084993091-1cb5c0721cc6',
  ],
  carne: [
    '1546964124-0cce460f38ef',
    '1558030006-450675393462',
    '1544025162-d76694265947',
    '1565299507177-b0ac66763828',
  ],
  sopa: [
    '1547928576-b822bcced2db',
    '1547592180-85f173990554',
    '1605379399642-870262d3d051',
  ],
  feijoada: [
    '1565299507177-b0ac66763828',
    '1604908176997-125f25cc6f3d',
    '1546964124-0cce460f38ef',
  ],
  wrap: [
    '1626700051175-6818013e1d4f',
    '1565299585323-38d6b0865b47',
  ],
  pastel: [
    '1568827999250-3f6afff96e66',
    '1509365465985-25d11c17e812',
  ],
  tapioca: [
    '1517433367423-c7e5b0f35086',
    '1568827999250-3f6afff96e66',
  ],
  misc: [
    '1546069901-ba9599a7e63c',
    '1567620905732-2d1ec7ab7445',
    '1565958011703-44f9829ba187',
  ],
}

function detectCategory(text: string): FoodCat {
  const t = text.toLowerCase()
  // bebidas vêm primeiro (alguns nomes têm "doce" mas são vinho doce, etc)
  if (/cerveja|ipa|stella|heineken|long neck|chopp|fardo/.test(t)) return 'cerveja'
  if (/vinho|chianti|tinto|chardonnay|cabernet/.test(t)) return 'vinho'
  if (/whisky|gin|vodka|rum|destilado|tequila/.test(t)) return 'bebida'
  if (/caf[eé]|capuccin|cappucc|expresso|espresso/.test(t)) return 'cafe'
  if (/suco|smoothi|vitamina|detox|coco|laranja/.test(t)) return 'suco'
  if (/coca|refri|guaran[aá]|spri/.test(t)) return 'bebida'
  if (/ch[áa] |ch[áa]$|ice tea/.test(t)) return 'bebida'
  if (/milkshake|shake|caipi|drink|margarita|mojito|s[aá]ke|sake/.test(t)) return 'bebida'
  if (/[aá]gua|agua tonica/.test(t)) return 'bebida'

  // doces / sobremesas
  if (/sorvete|gelato|popsicle|paleta/.test(t)) return 'sorvete'
  if (/bolo|cupcake|brownie/.test(t)) return 'bolos'
  if (/sobremes|pudim|cheesecake|p[aá]vê|pave|torta|cookie|macaron|brigadeiro|nutella|chocolate|sonho|tiramis|doce/.test(t)) return 'doces'

  // a[cç]a[ií]
  if (/a[çc]a[ií]/.test(t)) return 'acai'

  // pratos
  if (/burger|hamb[uú]rguer|smash|cheese/.test(t)) return 'burger'
  if (/pizza/.test(t)) return 'pizza'
  if (/temaki/.test(t)) return 'sushi'
  if (/sashimi/.test(t)) return 'sashimi'
  if (/sushi|nigiri|hot roll|uramaki|combo|gyoza|yakisoba|teriyaki/.test(t)) return 'sushi'
  if (/spaghetti|nhoque|carbonara|lasanha|talharim|fettucc|penne|rigatoni|ravioli/.test(t)) return 'pasta'
  if (/risoto|risotto/.test(t)) return 'risoto'
  if (/salada|caesar|verde/.test(t)) return 'salada'
  if (/bowl/.test(t)) return 'salada'
  if (/wrap/.test(t)) return 'wrap'
  if (/taco|burrito|nacho|quesadilla|chili|guaca|tortilla/.test(t)) return 'mexicana'

  if (/feijoada|feijão tropeiro|tropeir/.test(t)) return 'feijoada'
  if (/picanha|fil[eé]|alcatra|costela|bife|carne|strogonoff/.test(t)) return 'carne'
  if (/frango|chicken|coxinha|coxa|peito de frango|parmegiana|asa de/.test(t)) return 'frango'
  if (/peixe|salm[aã]o|atum|bacalhau|moqueca|tilapia|peixaria/.test(t)) return 'peixe'
  if (/camar[aã]o|lula|polvo|fruto/.test(t)) return 'peixe'

  if (/pastel|esfiha/.test(t)) return 'pastel'
  if (/tapioca|crepe/.test(t)) return 'tapioca'
  if (/p[aã]o|cro[ií]ssant|p[aã]o de queijo|baguete|focaccia/.test(t)) return 'padaria'

  if (/sopa|caldo|min[ée]stra/.test(t)) return 'sopa'

  return 'misc'
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0
  }
  return h
}

/** Retorna URL Unsplash para o prato; estável por dish.id (mesma img sempre). */
export function dishImageUrl(dish: { id: string; name: string; category: string }, size = 400): string {
  const cat = detectCategory(`${dish.name} ${dish.category}`)
  const pool = POOLS[cat]
  const idx = hash(dish.id) % pool.length
  return `https://images.unsplash.com/photo-${pool[idx]}?w=${size}&q=70&auto=format&fit=crop`
}

/** Para banner de restaurante (formato landscape maior). */
export function restaurantBannerUrl(photoId: string, size = 800): string {
  return `https://images.unsplash.com/photo-${photoId}?w=${size}&q=75&auto=format&fit=crop`
}
