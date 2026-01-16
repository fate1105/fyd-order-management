// productImages.js
// Mock product images using placeholder services
// Sử dụng Unsplash Source API cho ảnh thời trang thực tế

const UNSPLASH_BASE = 'https://images.unsplash.com';

// Ảnh theo category
const categoryImages = {
  tshirt: [
    `${UNSPLASH_BASE}/photo-1521572163474-6864f9cf17ab?w=600`, // áo thun trắng
    `${UNSPLASH_BASE}/photo-1583743814966-8936f5b7be1a?w=600`, // áo thun đen
    `${UNSPLASH_BASE}/photo-1576566588028-4147f3842f27?w=600`, // áo thun graphic
    `${UNSPLASH_BASE}/photo-1562157873-818bc0726f68?w=600`, // áo thun oversize
  ],
  polo: [
    `${UNSPLASH_BASE}/photo-1625910513413-5fc45e80b5f0?w=600`, // polo trắng
    `${UNSPLASH_BASE}/photo-1598033129183-c4f50c736f10?w=600`, // polo đen
    `${UNSPLASH_BASE}/photo-1589310243389-96a5483213a8?w=600`, // polo navy
  ],
  shirt: [
    `${UNSPLASH_BASE}/photo-1596755094514-f87e34085b2c?w=600`, // sơ mi trắng
    `${UNSPLASH_BASE}/photo-1603252109303-2751441dd157?w=600`, // sơ mi xanh
    `${UNSPLASH_BASE}/photo-1598961942613-ba897716405b?w=600`, // sơ mi linen
  ],
  hoodie: [
    `${UNSPLASH_BASE}/photo-1556821840-3a63f95609a7?w=600`, // hoodie đen
    `${UNSPLASH_BASE}/photo-1509942774463-acf339cf87d5?w=600`, // hoodie xám
    `${UNSPLASH_BASE}/photo-1578768079052-aa76e52ff62e?w=600`, // hoodie graphic
  ],
  jacket: [
    `${UNSPLASH_BASE}/photo-1551028719-00167b16eac5?w=600`, // bomber jacket
    `${UNSPLASH_BASE}/photo-1576871337622-98d48d1cf531?w=600`, // denim jacket
    `${UNSPLASH_BASE}/photo-1591047139829-d91aecb6caea?w=600`, // windbreaker
  ],
  jeans: [
    `${UNSPLASH_BASE}/photo-1542272604-787c3835535d?w=600`, // jean xanh
    `${UNSPLASH_BASE}/photo-1541099649105-f69ad21f3246?w=600`, // jean đen
    `${UNSPLASH_BASE}/photo-1582552938357-32b906df40cb?w=600`, // jean ripped
  ],
  pants: [
    `${UNSPLASH_BASE}/photo-1473966968600-fa801b869a1a?w=600`, // kaki
    `${UNSPLASH_BASE}/photo-1624378439575-d8705ad7ae80?w=600`, // chinos
    `${UNSPLASH_BASE}/photo-1506629082955-511b1aa562c8?w=600`, // jogger
  ],
  shorts: [
    `${UNSPLASH_BASE}/photo-1591195853828-11db59a44f6b?w=600`, // short cargo
    `${UNSPLASH_BASE}/photo-1565084888279-aca607ecce0c?w=600`, // short denim
    `${UNSPLASH_BASE}/photo-1552902865-b72c031ac5ea?w=600`, // short chino
  ],
};

// Product images mapping - mỗi sản phẩm có nhiều ảnh
export const productImages = {
  // ÁO THUN
  1: { // Áo thun FYD Basic Logo
    name: 'Áo thun FYD Basic Logo',
    colors: {
      black: [
        `${UNSPLASH_BASE}/photo-1583743814966-8936f5b7be1a?w=600`,
        `${UNSPLASH_BASE}/photo-1618354691373-d851c5c3a990?w=600`,
        `${UNSPLASH_BASE}/photo-1618354691438-25bc04584c23?w=600`,
        `${UNSPLASH_BASE}/photo-1622445275576-721325763afe?w=600`,
      ],
      white: [
        `${UNSPLASH_BASE}/photo-1521572163474-6864f9cf17ab?w=600`,
        `${UNSPLASH_BASE}/photo-1581655353564-df123a1eb820?w=600`,
        `${UNSPLASH_BASE}/photo-1627225924765-552d49cf47ad?w=600`,
      ],
      navy: [
        `${UNSPLASH_BASE}/photo-1618354691229-88d47f285158?w=600`,
        `${UNSPLASH_BASE}/photo-1618354691551-44de113f0164?w=600`,
      ],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1583743814966-8936f5b7be1a?w=300`,
  },
  2: { // Áo thun FYD Oversize
    name: 'Áo thun FYD Oversize',
    colors: {
      black: [
        `${UNSPLASH_BASE}/photo-1562157873-818bc0726f68?w=600`,
        `${UNSPLASH_BASE}/photo-1503341504253-dff4815485f1?w=600`,
        `${UNSPLASH_BASE}/photo-1529374255404-311a2a4f1fd9?w=600`,
      ],
      white: [
        `${UNSPLASH_BASE}/photo-1554568218-0f1715e72254?w=600`,
        `${UNSPLASH_BASE}/photo-1523381210434-271e8be1f52b?w=600`,
      ],
      gray: [
        `${UNSPLASH_BASE}/photo-1618354691321-e851c56960d1?w=600`,
        `${UNSPLASH_BASE}/photo-1571945153237-4929e783af4a?w=600`,
      ],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1562157873-818bc0726f68?w=300`,
  },
  3: { // Áo thun Graphic
    name: 'Áo thun FYD Graphic Tee',
    colors: {
      black: [
        `${UNSPLASH_BASE}/photo-1576566588028-4147f3842f27?w=600`,
        `${UNSPLASH_BASE}/photo-1503342217505-b0a15ec3261c?w=600`,
        `${UNSPLASH_BASE}/photo-1503342394128-c104d54dba01?w=600`,
      ],
      white: [
        `${UNSPLASH_BASE}/photo-1527719327859-c6ce80353573?w=600`,
        `${UNSPLASH_BASE}/photo-1489987707025-afc232f7ea0f?w=600`,
      ],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1576566588028-4147f3842f27?w=300`,
  },
  4: { // Basic Studio Plain
    name: 'Áo thun Basic Studio Plain',
    colors: {
      black: [`${UNSPLASH_BASE}/photo-1618354691373-d851c5c3a990?w=600`],
      white: [`${UNSPLASH_BASE}/photo-1521572163474-6864f9cf17ab?w=600`],
      gray: [`${UNSPLASH_BASE}/photo-1618354691321-e851c56960d1?w=600`],
      navy: [`${UNSPLASH_BASE}/photo-1618354691229-88d47f285158?w=600`],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1521572163474-6864f9cf17ab?w=300`,
  },
  5: { // Urban Tie-Dye
    name: 'Áo thun Urban Tie-Dye',
    colors: {
      blue: [
        `${UNSPLASH_BASE}/photo-1569087682520-45253cc2e0ee?w=600`,
        `${UNSPLASH_BASE}/photo-1503342083360-4b7e9a3e5f25?w=600`,
      ],
      purple: [
        `${UNSPLASH_BASE}/photo-1558171813-4c088753af8f?w=600`,
        `${UNSPLASH_BASE}/photo-1503342250614-ca440786f637?w=600`,
      ],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1569087682520-45253cc2e0ee?w=300`,
  },

  // ÁO POLO
  6: { // Polo FYD Classic
    name: 'Áo Polo FYD Classic',
    colors: {
      black: [
        `${UNSPLASH_BASE}/photo-1598033129183-c4f50c736f10?w=600`,
        `${UNSPLASH_BASE}/photo-1594938298603-c8148c4dae35?w=600`,
      ],
      white: [
        `${UNSPLASH_BASE}/photo-1625910513413-5fc45e80b5f0?w=600`,
        `${UNSPLASH_BASE}/photo-1586363104862-3a5e2ab60d99?w=600`,
      ],
      navy: [
        `${UNSPLASH_BASE}/photo-1589310243389-96a5483213a8?w=600`,
        `${UNSPLASH_BASE}/photo-1594938374182-a57061dff0f6?w=600`,
      ],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1625910513413-5fc45e80b5f0?w=300`,
  },
  7: { // Polo Premium
    name: 'Áo Polo FYD Premium',
    colors: {
      black: [`${UNSPLASH_BASE}/photo-1598033129183-c4f50c736f10?w=600`],
      white: [`${UNSPLASH_BASE}/photo-1625910513413-5fc45e80b5f0?w=600`],
      navy: [`${UNSPLASH_BASE}/photo-1589310243389-96a5483213a8?w=600`],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1598033129183-c4f50c736f10?w=300`,
  },
  8: { // Polo Stripe
    name: 'Áo Polo Classic Wear Stripe',
    colors: {
      navy: [`${UNSPLASH_BASE}/photo-1594938374182-a57061dff0f6?w=600`],
      gray: [`${UNSPLASH_BASE}/photo-1594938298603-c8148c4dae35?w=600`],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1594938374182-a57061dff0f6?w=300`,
  },

  // ÁO SƠ MI
  9: { // Sơ mi Oxford
    name: 'Áo Sơ Mi FYD Oxford',
    colors: {
      white: [
        `${UNSPLASH_BASE}/photo-1596755094514-f87e34085b2c?w=600`,
        `${UNSPLASH_BASE}/photo-1598961942613-ba897716405b?w=600`,
        `${UNSPLASH_BASE}/photo-1620012253295-c15cc3e65df4?w=600`,
      ],
      lightblue: [
        `${UNSPLASH_BASE}/photo-1603252109303-2751441dd157?w=600`,
        `${UNSPLASH_BASE}/photo-1594938291221-94f18cbb5660?w=600`,
      ],
      navy: [`${UNSPLASH_BASE}/photo-1598522325074-042db73aa4e6?w=600`],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1596755094514-f87e34085b2c?w=300`,
  },
  10: { // Sơ mi Slim Fit
    name: 'Áo Sơ Mi FYD Slim Fit',
    colors: {
      white: [
        `${UNSPLASH_BASE}/photo-1598961942613-ba897716405b?w=600`,
        `${UNSPLASH_BASE}/photo-1607345366928-199ea26cfe3e?w=600`,
      ],
      lightblue: [
        `${UNSPLASH_BASE}/photo-1594938291221-94f18cbb5660?w=600`,
        `${UNSPLASH_BASE}/photo-1603252109303-2751441dd157?w=600`,
      ],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1598961942613-ba897716405b?w=300`,
  },
  11: { // Sơ mi Linen
    name: 'Áo Sơ Mi Basic Linen',
    colors: {
      white: [`${UNSPLASH_BASE}/photo-1598961942613-ba897716405b?w=600`],
      beige: [`${UNSPLASH_BASE}/photo-1596755094514-f87e34085b2c?w=600`],
      lightblue: [`${UNSPLASH_BASE}/photo-1594938291221-94f18cbb5660?w=600`],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1596755094514-f87e34085b2c?w=300`,
  },

  // ÁO HOODIE
  12: { // Hoodie Essential
    name: 'Áo Hoodie FYD Essential',
    colors: {
      black: [
        `${UNSPLASH_BASE}/photo-1556821840-3a63f95609a7?w=600`,
        `${UNSPLASH_BASE}/photo-1620799140408-edc6dcb6d633?w=600`,
        `${UNSPLASH_BASE}/photo-1578768079052-aa76e52ff62e?w=600`,
      ],
      gray: [
        `${UNSPLASH_BASE}/photo-1509942774463-acf339cf87d5?w=600`,
        `${UNSPLASH_BASE}/photo-1542406775-ade58c52d2e4?w=600`,
      ],
      navy: [
        `${UNSPLASH_BASE}/photo-1614975059251-992f11792b9f?w=600`,
        `${UNSPLASH_BASE}/photo-1611312449408-fcece27cdbb7?w=600`,
      ],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1556821840-3a63f95609a7?w=300`,
  },
  13: { // Hoodie Zip-Up
    name: 'Áo Hoodie FYD Zip-Up',
    colors: {
      black: [
        `${UNSPLASH_BASE}/photo-1620799140408-edc6dcb6d633?w=600`,
        `${UNSPLASH_BASE}/photo-1578768079052-aa76e52ff62e?w=600`,
      ],
      darkgray: [
        `${UNSPLASH_BASE}/photo-1509942774463-acf339cf87d5?w=600`,
        `${UNSPLASH_BASE}/photo-1542406775-ade58c52d2e4?w=600`,
      ],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1620799140408-edc6dcb6d633?w=300`,
  },
  14: { // Hoodie Graphic
    name: 'Áo Hoodie Urban Graphic',
    colors: {
      black: [
        `${UNSPLASH_BASE}/photo-1578768079052-aa76e52ff62e?w=600`,
        `${UNSPLASH_BASE}/photo-1556821840-3a63f95609a7?w=600`,
      ],
      white: [
        `${UNSPLASH_BASE}/photo-1509942774463-acf339cf87d5?w=600`,
        `${UNSPLASH_BASE}/photo-1542406775-ade58c52d2e4?w=600`,
      ],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1578768079052-aa76e52ff62e?w=300`,
  },

  // ÁO KHOÁC
  15: { // Bomber Jacket
    name: 'Áo Khoác FYD Bomber',
    colors: {
      black: [
        `${UNSPLASH_BASE}/photo-1551028719-00167b16eac5?w=600`,
        `${UNSPLASH_BASE}/photo-1591047139829-d91aecb6caea?w=600`,
        `${UNSPLASH_BASE}/photo-1548126032-079a0fb0099d?w=600`,
      ],
      navy: [
        `${UNSPLASH_BASE}/photo-1544022613-e87ca75a784a?w=600`,
        `${UNSPLASH_BASE}/photo-1591047139829-d91aecb6caea?w=600`,
      ],
      olive: [
        `${UNSPLASH_BASE}/photo-1548126032-079a0fb0099d?w=600`,
        `${UNSPLASH_BASE}/photo-1551028719-00167b16eac5?w=600`,
      ],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1551028719-00167b16eac5?w=300`,
  },
  16: { // Denim Jacket
    name: 'Áo Khoác FYD Denim',
    colors: {
      blue: [
        `${UNSPLASH_BASE}/photo-1576871337622-98d48d1cf531?w=600`,
        `${UNSPLASH_BASE}/photo-1601933973783-43cf8a7d4c5f?w=600`,
        `${UNSPLASH_BASE}/photo-1523205771623-e0faa4d2813d?w=600`,
      ],
      black: [
        `${UNSPLASH_BASE}/photo-1548126032-079a0fb0099d?w=600`,
        `${UNSPLASH_BASE}/photo-1591047139829-d91aecb6caea?w=600`,
      ],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1576871337622-98d48d1cf531?w=300`,
  },
  17: { // Windbreaker
    name: 'Áo Khoác Urban Windbreaker',
    colors: {
      black: [
        `${UNSPLASH_BASE}/photo-1591047139829-d91aecb6caea?w=600`,
        `${UNSPLASH_BASE}/photo-1544022613-e87ca75a784a?w=600`,
      ],
      navy: [
        `${UNSPLASH_BASE}/photo-1544022613-e87ca75a784a?w=600`,
        `${UNSPLASH_BASE}/photo-1591047139829-d91aecb6caea?w=600`,
      ],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1591047139829-d91aecb6caea?w=300`,
  },

  // QUẦN JEAN
  18: { // Jean Slim Fit
    name: 'Quần Jean FYD Slim Fit',
    colors: {
      blue: [
        `${UNSPLASH_BASE}/photo-1542272604-787c3835535d?w=600`,
        `${UNSPLASH_BASE}/photo-1604176354204-9268737828e4?w=600`,
        `${UNSPLASH_BASE}/photo-1541099649105-f69ad21f3246?w=600`,
      ],
      lightblue: [
        `${UNSPLASH_BASE}/photo-1582552938357-32b906df40cb?w=600`,
        `${UNSPLASH_BASE}/photo-1565084888279-aca607ecce0c?w=600`,
      ],
      black: [
        `${UNSPLASH_BASE}/photo-1541099649105-f69ad21f3246?w=600`,
        `${UNSPLASH_BASE}/photo-1542272604-787c3835535d?w=600`,
      ],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1542272604-787c3835535d?w=300`,
  },
  19: { // Jean Straight
    name: 'Quần Jean FYD Straight',
    colors: {
      blue: [
        `${UNSPLASH_BASE}/photo-1604176354204-9268737828e4?w=600`,
        `${UNSPLASH_BASE}/photo-1542272604-787c3835535d?w=600`,
      ],
      lightblue: [
        `${UNSPLASH_BASE}/photo-1582552938357-32b906df40cb?w=600`,
        `${UNSPLASH_BASE}/photo-1565084888279-aca607ecce0c?w=600`,
      ],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1604176354204-9268737828e4?w=300`,
  },
  20: { // Jean Ripped
    name: 'Quần Jean FYD Ripped',
    colors: {
      blue: [
        `${UNSPLASH_BASE}/photo-1582552938357-32b906df40cb?w=600`,
        `${UNSPLASH_BASE}/photo-1541099649105-f69ad21f3246?w=600`,
        `${UNSPLASH_BASE}/photo-1542272604-787c3835535d?w=600`,
      ],
      black: [
        `${UNSPLASH_BASE}/photo-1541099649105-f69ad21f3246?w=600`,
        `${UNSPLASH_BASE}/photo-1542272604-787c3835535d?w=600`,
      ],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1582552938357-32b906df40cb?w=300`,
  },
  21: { // Jean Basic Regular
    name: 'Quần Jean Basic Regular',
    colors: {
      blue: [
        `${UNSPLASH_BASE}/photo-1542272604-787c3835535d?w=600`,
        `${UNSPLASH_BASE}/photo-1604176354204-9268737828e4?w=600`,
      ],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1542272604-787c3835535d?w=300`,
  },

  // QUẦN KAKI
  22: { // Kaki Slim
    name: 'Quần Kaki FYD Slim',
    colors: {
      black: [
        `${UNSPLASH_BASE}/photo-1473966968600-fa801b869a1a?w=600`,
        `${UNSPLASH_BASE}/photo-1624378439575-d8705ad7ae80?w=600`,
      ],
      beige: [
        `${UNSPLASH_BASE}/photo-1624378439575-d8705ad7ae80?w=600`,
        `${UNSPLASH_BASE}/photo-1473966968600-fa801b869a1a?w=600`,
      ],
      navy: [
        `${UNSPLASH_BASE}/photo-1473966968600-fa801b869a1a?w=600`,
        `${UNSPLASH_BASE}/photo-1624378439575-d8705ad7ae80?w=600`,
      ],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1473966968600-fa801b869a1a?w=300`,
  },
  23: { // Chinos
    name: 'Quần Kaki FYD Chinos',
    colors: {
      black: [`${UNSPLASH_BASE}/photo-1473966968600-fa801b869a1a?w=600`],
      beige: [`${UNSPLASH_BASE}/photo-1624378439575-d8705ad7ae80?w=600`],
      gray: [`${UNSPLASH_BASE}/photo-1473966968600-fa801b869a1a?w=600`],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1624378439575-d8705ad7ae80?w=300`,
  },
  24: { // Kaki Pleated
    name: 'Quần Kaki Classic Pleated',
    colors: {
      black: [`${UNSPLASH_BASE}/photo-1473966968600-fa801b869a1a?w=600`],
      beige: [`${UNSPLASH_BASE}/photo-1624378439575-d8705ad7ae80?w=600`],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1473966968600-fa801b869a1a?w=300`,
  },

  // QUẦN SHORT
  25: { // Short Cargo
    name: 'Quần Short FYD Cargo',
    colors: {
      black: [
        `${UNSPLASH_BASE}/photo-1591195853828-11db59a44f6b?w=600`,
        `${UNSPLASH_BASE}/photo-1552902865-b72c031ac5ea?w=600`,
      ],
      beige: [
        `${UNSPLASH_BASE}/photo-1552902865-b72c031ac5ea?w=600`,
        `${UNSPLASH_BASE}/photo-1591195853828-11db59a44f6b?w=600`,
      ],
      olive: [
        `${UNSPLASH_BASE}/photo-1591195853828-11db59a44f6b?w=600`,
        `${UNSPLASH_BASE}/photo-1552902865-b72c031ac5ea?w=600`,
      ],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1591195853828-11db59a44f6b?w=300`,
  },
  26: { // Short Denim
    name: 'Quần Short FYD Denim',
    colors: {
      blue: [
        `${UNSPLASH_BASE}/photo-1565084888279-aca607ecce0c?w=600`,
        `${UNSPLASH_BASE}/photo-1591195853828-11db59a44f6b?w=600`,
      ],
      lightblue: [
        `${UNSPLASH_BASE}/photo-1565084888279-aca607ecce0c?w=600`,
        `${UNSPLASH_BASE}/photo-1591195853828-11db59a44f6b?w=600`,
      ],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1565084888279-aca607ecce0c?w=300`,
  },
  27: { // Short Chino
    name: 'Quần Short Basic Chino',
    colors: {
      black: [`${UNSPLASH_BASE}/photo-1552902865-b72c031ac5ea?w=600`],
      beige: [`${UNSPLASH_BASE}/photo-1552902865-b72c031ac5ea?w=600`],
      navy: [`${UNSPLASH_BASE}/photo-1591195853828-11db59a44f6b?w=600`],
      gray: [`${UNSPLASH_BASE}/photo-1552902865-b72c031ac5ea?w=600`],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1552902865-b72c031ac5ea?w=300`,
  },

  // QUẦN JOGGER
  28: { // Jogger Tech
    name: 'Quần Jogger FYD Tech',
    colors: {
      black: [
        `${UNSPLASH_BASE}/photo-1506629082955-511b1aa562c8?w=600`,
        `${UNSPLASH_BASE}/photo-1552902865-b72c031ac5ea?w=600`,
      ],
      navy: [
        `${UNSPLASH_BASE}/photo-1506629082955-511b1aa562c8?w=600`,
        `${UNSPLASH_BASE}/photo-1552902865-b72c031ac5ea?w=600`,
      ],
      gray: [
        `${UNSPLASH_BASE}/photo-1506629082955-511b1aa562c8?w=600`,
        `${UNSPLASH_BASE}/photo-1552902865-b72c031ac5ea?w=600`,
      ],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1506629082955-511b1aa562c8?w=300`,
  },
  29: { // Jogger Fleece
    name: 'Quần Jogger FYD Fleece',
    colors: {
      black: [
        `${UNSPLASH_BASE}/photo-1506629082955-511b1aa562c8?w=600`,
        `${UNSPLASH_BASE}/photo-1552902865-b72c031ac5ea?w=600`,
      ],
      darkgray: [
        `${UNSPLASH_BASE}/photo-1506629082955-511b1aa562c8?w=600`,
        `${UNSPLASH_BASE}/photo-1552902865-b72c031ac5ea?w=600`,
      ],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1506629082955-511b1aa562c8?w=300`,
  },
  30: { // Jogger Cargo
    name: 'Quần Jogger Urban Cargo',
    colors: {
      black: [
        `${UNSPLASH_BASE}/photo-1506629082955-511b1aa562c8?w=600`,
        `${UNSPLASH_BASE}/photo-1552902865-b72c031ac5ea?w=600`,
      ],
      olive: [
        `${UNSPLASH_BASE}/photo-1506629082955-511b1aa562c8?w=600`,
        `${UNSPLASH_BASE}/photo-1552902865-b72c031ac5ea?w=600`,
      ],
    },
    thumbnail: `${UNSPLASH_BASE}/photo-1506629082955-511b1aa562c8?w=300`,
  },
};

// Helper functions
export const getProductThumbnail = (productId) => {
  return productImages[productId]?.thumbnail || getPlaceholder(300);
};

export const getProductImages = (productId, color = null) => {
  const product = productImages[productId];
  if (!product) return [getPlaceholder(600)];
  
  if (color && product.colors[color]) {
    return product.colors[color];
  }
  
  // Return first color's images
  const firstColor = Object.keys(product.colors)[0];
  return product.colors[firstColor] || [getPlaceholder(600)];
};

export const getProductMainImage = (productId, color = null) => {
  const images = getProductImages(productId, color);
  return images[0];
};

export const getAllProductColors = (productId) => {
  const product = productImages[productId];
  if (!product) return [];
  return Object.keys(product.colors);
};

// Placeholder image generator
export const getPlaceholder = (size = 400, text = 'FYD') => {
  return `https://via.placeholder.com/${size}x${size}/f5f5f5/333333?text=${text}`;
};

// Color hex mapping
export const colorHexMap = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#808080',
  darkgray: '#404040',
  navy: '#000080',
  blue: '#0066CC',
  lightblue: '#87CEEB',
  beige: '#F5F5DC',
  brown: '#8B4513',
  red: '#DC143C',
  pink: '#FFC0CB',
  yellow: '#FFD700',
  green: '#228B22',
  olive: '#808000',
  orange: '#FF8C00',
  purple: '#800080',
  cream: '#FFFDD0',
};

// Get color hex from color name
export const getColorHex = (colorName) => {
  return colorHexMap[colorName?.toLowerCase()] || '#CCCCCC';
};

export default productImages;
