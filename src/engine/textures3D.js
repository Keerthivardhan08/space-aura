/**
 * SPACE-AURA: Procedural High-Fidelity 3D Texture Generator
 * Generates photorealistic planetary textures, cloud layers, night lights, and materials
 * using HTML5 Canvas - 100% self-contained, zero external asset dependencies!
 */

import * as THREE from '../../libs/three.module.js';

export class TextureGenerator {
  /**
   * Generates Earth diffuse texture with accurate continental geography,
   * realistic biomes (forests, deserts, mountains, snow caps), shallow coastal shelves, and oceans
   */
  static createEarthTexture(width = 2048, height = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const toX = (lon) => ((lon + 180) / 360) * width;
    const toY = (lat) => ((90 - lat) / 180) * height;

    // 1. Deep Oceanic Base with Latitudinal Gradient
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
    oceanGrad.addColorStop(0, '#061a33'); // Arctic Polar Ocean
    oceanGrad.addColorStop(0.2, '#0a2347');
    oceanGrad.addColorStop(0.5, '#0d325e'); // Equatorial Deep Blue
    oceanGrad.addColorStop(0.8, '#0a2347');
    oceanGrad.addColorStop(1, '#061a33'); // Southern Antarctic Ocean
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle oceanic current ripples
    ctx.fillStyle = 'rgba(15, 60, 110, 0.4)';
    for (let i = 0; i < 120; i++) {
      const qx = Math.random() * width;
      const qy = Math.random() * height;
      ctx.beginPath();
      ctx.ellipse(qx, qy, 80 + Math.random() * 140, 15 + Math.random() * 30, (Math.random() - 0.5) * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Helper: draw a polygon from lat/lon coordinates with coastal shelf & fill
    const drawPolygon = (coords, fillColor, shelf = true) => {
      if (coords.length < 3) return;

      // Draw shallow turquoise coastal shelf fringe first
      if (shelf) {
        ctx.save();
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.55)'; // Cyan shelf
        ctx.lineWidth = width * 0.008;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(toX(coords[0][0]), toY(coords[0][1]));
        for (let i = 1; i < coords.length; i++) {
          ctx.lineTo(toX(coords[i][0]), toY(coords[i][1]));
        }
        ctx.closePath();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(20, 184, 166, 0.35)'; // Turquoise outer reef
        ctx.lineWidth = width * 0.015;
        ctx.stroke();
        ctx.restore();
      }

      // Draw landmass body
      ctx.save();
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.moveTo(toX(coords[0][0]), toY(coords[0][1]));
      for (let i = 1; i < coords.length; i++) {
        ctx.lineTo(toX(coords[i][0]), toY(coords[i][1]));
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // ==================== A. INDIAN SUBCONTINENT & SOUTH ASIA ====================
    const indiaMain = [
      [68.5, 23.8], // Kutch / Gujarat
      [70.0, 21.0], // Saurashtra
      [72.8, 21.0], // Gulf of Khambhat
      [72.8, 18.9], // Mumbai
      [73.8, 15.5], // Goa / Konkan
      [74.8, 13.0], // Karnataka coast
      [76.2, 9.9],  // Kerala / Kochi
      [77.5, 8.1],  // Kanyakumari (Cape Comorin)
      [78.5, 9.2],  // Gulf of Mannar
      [79.8, 10.8], // Point Calimere
      [80.25, 13.7],// Sriharikota / SDSC Space Centre
      [82.3, 16.9], // Kakinada / Godavari Delta
      [84.5, 18.8], // Andhra / Odisha border
      [86.8, 20.8], // Mahanadi Delta / Paradeep
      [88.3, 21.8], // Sundarbans / Ganges Delta
      [91.5, 22.2], // Bangladesh / Meghna River mouth
      [92.5, 21.0], // Chittagong
      [94.0, 19.5], // Myanmar Arakan
      [96.0, 23.0], // Northeast borders
      [93.0, 26.5], // Assam Valley
      [88.5, 27.5], // Sikkim / Himalayas
      [85.0, 28.5], // Nepal Himalayas (Everest)
      [81.0, 30.5], // Uttarakhand Garhwal
      [77.0, 32.5], // Himachal
      [74.5, 35.5], // Karakoram / Ladakh
      [72.0, 34.0], // Khyber / Indus North
      [71.0, 30.0], // Punjab plains
      [68.0, 26.0], // Thar / Sindh
      [67.0, 24.8], // Karachi / Indus Delta
      [64.0, 25.3], // Makran coast
      [68.5, 23.8]
    ];
    drawPolygon(indiaMain, '#2d5a27'); // Lush green baseline

    // Thar Desert in Rajasthan & Indus basin (Golden ochre)
    ctx.fillStyle = '#c89d53';
    ctx.beginPath();
    ctx.ellipse(toX(72.5), toY(26.5), width * 0.016, height * 0.035, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Deccan Plateau warm savanna
    ctx.fillStyle = '#3a6630';
    ctx.beginPath();
    ctx.ellipse(toX(77.0), toY(17.0), width * 0.022, height * 0.05, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Himalayan Snow-Capped Mountain Range (Snow White & Slate Gray)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = width * 0.007;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(toX(73.5), toY(35.0));
    ctx.lineTo(toX(79.0), toY(31.5));
    ctx.lineTo(toX(85.0), toY(28.2));
    ctx.lineTo(toX(92.0), toY(27.8));
    ctx.stroke();

    // Sri Lanka (Teardrop Island at South of India)
    const sriLanka = [
      [80.0, 9.8],  // Jaffna Peninsula
      [81.3, 8.6],  // Trincomalee
      [81.8, 7.0],  // Batticaloa
      [81.2, 6.0],  // Hambantota
      [80.2, 6.0],  // Galle
      [79.8, 6.9],  // Colombo
      [79.8, 8.5],  // Mannar
      [80.0, 9.8]
    ];
    drawPolygon(sriLanka, '#1b4d20');

    // ==================== B. AFRICA & MADAGASCAR ====================
    const africaMain = [
      [-5.8, 35.8],  // Gibraltar Strait (Morocco)
      [3.0, 36.8],   // Algiers
      [10.5, 37.0],  // Tunis
      [15.0, 31.0],  // Gulf of Sirte
      [25.0, 32.0],  // Libya/Egypt
      [30.0, 31.5],  // Nile Delta (Alexandria)
      [32.5, 29.9],  // Suez
      [34.5, 27.8],  // Sinai
      [38.0, 18.0],  // Red Sea coast
      [43.3, 12.6],  // Bab-el-Mandeb
      [51.2, 10.5],  // Horn of Africa (Somalia)
      [46.0, 3.0],   // Mogadishu
      [40.0, -4.0],  // Mombasa (Kenya)
      [39.3, -7.0],  // Dar es Salaam (Tanzania)
      [35.0, -19.0], // Mozambique
      [32.6, -26.0], // Maputo
      [31.0, -30.0], // Durban
      [25.6, -34.0], // Port Elizabeth
      [18.5, -34.5], // Cape of Good Hope
      [15.0, -26.0], // Namibia
      [12.5, -12.0], // Angola
      [12.0, -5.5],  // Congo River Mouth
      [9.5, 2.0],    // Gabon
      [8.5, 4.5],    // Cameroon
      [5.5, 4.5],    // Niger Delta
      [3.0, 6.4],    // Lagos (Nigeria)
      [-1.0, 5.0],   // Ghana
      [-7.5, 4.3],   // Ivory Coast / Liberia
      [-13.0, 9.0],  // Sierra Leone / Guinea
      [-17.5, 14.7], // Dakar (Cape Verde Peninsula)
      [-16.0, 20.0], // Mauritania
      [-13.0, 27.0], // Western Sahara
      [-9.8, 30.5],  // Agadir
      [-7.6, 33.6],  // Casablanca
      [-5.8, 35.8]
    ];
    drawPolygon(africaMain, '#2d5a27');

    // Vast Sahara Desert (Golden Sand Dunes & Hamada)
    ctx.fillStyle = '#d4a359';
    ctx.beginPath();
    ctx.ellipse(toX(15.0), toY(24.0), width * 0.08, height * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();

    // Central Congo Basin Dense Rainforest (Deep Emerald)
    ctx.fillStyle = '#143818';
    ctx.beginPath();
    ctx.ellipse(toX(22.0), toY(-1.0), width * 0.045, height * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nile River Blue Ribbon
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(toX(31.5), toY(-2.5)); // Lake Victoria source
    ctx.lineTo(toX(32.5), toY(15.6)); // Khartoum
    ctx.lineTo(toX(31.2), toY(30.0)); // Cairo
    ctx.lineTo(toX(30.0), toY(31.4)); // Delta
    ctx.stroke();

    // Madagascar
    const madagascar = [
      [49.3, -12.0],
      [50.5, -16.0],
      [47.5, -25.5],
      [44.0, -25.0],
      [43.5, -17.0],
      [47.0, -13.0],
      [49.3, -12.0]
    ];
    drawPolygon(madagascar, '#235c29');

    // ==================== C. ARABIAN PENINSULA & MIDDLE EAST ====================
    const arabia = [
      [35.0, 29.5],  // Aqaba
      [39.0, 21.5],  // Jeddah / Red Sea
      [43.0, 13.0],  // Bab-el-Mandeb
      [45.0, 12.8],  // Aden
      [54.0, 17.0],  // Oman / Salalah
      [59.8, 22.5],  // Ras al Hadd
      [56.5, 26.0],  // Strait of Hormuz
      [50.0, 26.5],  // Persian Gulf / Bahrain
      [48.0, 29.5],  // Kuwait
      [40.0, 31.0],  // Syrian Desert
      [35.0, 29.5]
    ];
    drawPolygon(arabia, '#cfa358'); // Arabian Desert Sands

    // ==================== D. EUROPE & MEDITERRANEAN ====================
    const europeMain = [
      [-9.0, 37.0],  // Portugal (Cape St Vincent)
      [-9.3, 43.0],  // Galicia
      [-1.5, 43.5],  // Bay of Biscay
      [-4.5, 48.3],  // Brittany
      [1.5, 50.0],   // English Channel
      [5.0, 53.0],   // Netherlands / Rhine Delta
      [9.0, 57.0],   // Jutland (Denmark)
      [14.0, 54.0],  // Baltic coast (Germany/Poland)
      [22.0, 55.0],  // Lithuania
      [25.0, 60.0],  // Gulf of Finland
      [30.0, 60.0],  // St Petersburg
      [38.0, 55.0],  // Moscow basin
      [36.0, 46.0],  // Sea of Azov
      [31.0, 46.5],  // Black Sea (Odessa)
      [28.0, 41.0],  // Bosphorus (Istanbul)
      [24.0, 38.0],  // Greece / Athens
      [21.5, 37.0],  // Peloponnese
      [19.0, 41.0],  // Adriatic coast
      [15.5, 38.2],  // Italy (Calabria toe)
      [15.0, 40.5],  // Italy (Naples)
      [12.5, 42.0],  // Italy (Rome)
      [9.0, 44.5],   // Genoa / French Riviera
      [3.0, 42.5],   // Pyrenees border
      [0.0, 40.0],   // Spain (Valencia)
      [-5.3, 36.1],  // Gibraltar
      [-9.0, 37.0]
    ];
    drawPolygon(europeMain, '#2d6a32');

    // British Isles (UK & Ireland)
    const greatBritain = [
      [-5.5, 50.0], // Cornwall
      [1.7, 52.5],  // East Anglia
      [-0.5, 54.5], // Yorkshire
      [-1.8, 57.5], // Scotland East
      [-3.5, 58.6], // John o' Groats
      [-5.5, 56.5], // Highlands
      [-3.0, 53.5], // Liverpool
      [-5.0, 51.5], // Wales
      [-5.5, 50.0]
    ];
    drawPolygon(greatBritain, '#2e7d32');

    const ireland = [
      [-6.0, 53.3], // Dublin
      [-6.0, 55.0], // Belfast
      [-10.0, 54.0],// Galway / Connacht
      [-10.0, 51.8],// Cork
      [-6.0, 53.3]
    ];
    drawPolygon(ireland, '#22c55e');

    // Scandinavian Peninsula (Norway & Sweden)
    const scandinavia = [
      [5.0, 60.0],  // Norway Fjords
      [10.0, 58.0], // Oslo
      [12.5, 56.0], // Malmo
      [18.0, 59.5], // Stockholm
      [24.0, 65.0], // Gulf of Bothnia North
      [28.0, 70.0], // North Cape
      [18.0, 69.0], // Arctic Sweden
      [5.0, 60.0]
    ];
    drawPolygon(scandinavia, '#1b4320');

    // Italy Sicily Island
    const sicily = [
      [13.0, 38.0],
      [15.3, 38.2],
      [15.0, 37.0],
      [14.0, 36.8],
      [13.0, 38.0]
    ];
    drawPolygon(sicily, '#3f6212');

    // ==================== E. EURASIAN INTERIOR, SIBERIA & EAST ASIA ====================
    const eurasiaSiberia = [
      [30.0, 60.0],
      [40.0, 68.0],  // Kola Peninsula
      [60.0, 70.0],  // Yamal / Ob Gulf
      [90.0, 73.0],  // Taymyr Peninsula
      [130.0, 72.0], // Laptev Sea
      [160.0, 70.0], // East Siberian Sea
      [170.0, 65.0], // Chukotka
      [160.0, 55.0], // Kamchatka Peninsula
      [142.0, 52.0], // Sakhalin coast
      [132.0, 43.0], // Vladivostok
      [128.0, 38.0], // Korean Peninsula
      [126.0, 34.5], // Busan
      [120.0, 36.0], // Shandong Peninsula
      [118.0, 39.0], // Bohai Gulf (Beijing)
      [121.5, 31.2], // Shanghai / Yangtze River Delta
      [119.0, 26.0], // Fujian
      [114.0, 22.3], // Pearl River Delta (Hong Kong/Guangzhou)
      [108.5, 21.5], // Gulf of Tonkin
      [108.0, 15.0], // Vietnam (Da Nang)
      [105.0, 9.5],  // Mekong Delta
      [100.5, 13.5], // Bangkok (Gulf of Thailand)
      [103.8, 1.3],  // Singapore / Malay Peninsula tip
      [98.0, 8.0],   // Phuket
      [96.0, 16.5],  // Irrawaddy Delta
      [94.0, 22.0],  // Myanmar interior
      [100.0, 35.0], // Tibetan Plateau
      [85.0, 45.0],  // Xinjiang / Tian Shan
      [65.0, 55.0],  // Urals
      [50.0, 47.0],  // Caspian North
      [40.0, 50.0],  // Volga basin
      [30.0, 60.0]
    ];
    drawPolygon(eurasiaSiberia, '#244820');

    // Gobi Desert in Central Asia / China (Ochre Tan)
    ctx.fillStyle = '#bfa260';
    ctx.beginPath();
    ctx.ellipse(toX(102.0), toY(42.0), width * 0.045, height * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();

    // Japanese Archipelago
    const japanHonshu = [
      [139.0, 35.0], // Tokyo Bay
      [141.0, 38.5], // Sendai
      [141.0, 41.5], // Aomori
      [139.5, 40.0], // Akita
      [136.5, 36.5], // Noto Peninsula
      [133.0, 35.5], // Shimane
      [131.0, 34.0], // Shimonoseki
      [135.0, 34.5], // Osaka / Kobe
      [139.0, 35.0]
    ];
    drawPolygon(japanHonshu, '#166534');

    const japanHokkaido = [
      [141.0, 42.0],
      [145.0, 43.5],
      [142.0, 45.5],
      [140.5, 43.0],
      [141.0, 42.0]
    ];
    drawPolygon(japanHokkaido, '#15803d');

    // Indonesian Archipelago (Sumatra, Java, Borneo, Sulawesi)
    const sumatra = [
      [95.5, 5.5],
      [99.0, 2.0],
      [105.0, -5.0],
      [103.0, -4.0],
      [98.0, 1.0],
      [95.5, 5.5]
    ];
    drawPolygon(sumatra, '#14532d');

    const borneo = [
      [109.0, 1.5],
      [117.0, 4.0],
      [119.0, 0.0],
      [116.0, -4.0],
      [111.0, -3.0],
      [109.0, 1.5]
    ];
    drawPolygon(borneo, '#14532d');

    const java = [
      [106.0, -6.0],
      [114.0, -8.0],
      [112.0, -8.5],
      [106.0, -6.8],
      [106.0, -6.0]
    ];
    drawPolygon(java, '#166534');

    // ==================== F. AUSTRALIA & NEW ZEALAND ====================
    const australiaMain = [
      [142.5, -10.8], // Cape York tip
      [145.0, -15.0], // Cairns (Great Barrier Reef)
      [153.0, -27.5], // Brisbane
      [151.2, -33.8], // Sydney
      [145.0, -38.0], // Melbourne
      [140.0, -38.0], // Adelaide approach
      [136.0, -35.0], // Spencer Gulf (Woomera range)
      [128.0, -32.0], // Great Australian Bight
      [115.8, -32.0], // Perth
      [113.5, -26.0], // Shark Bay (Most westerly point)
      [118.0, -20.0], // Pilbara
      [123.0, -16.5], // Kimberley
      [131.0, -12.5], // Darwin
      [136.0, -12.0], // Arnhem Land
      [138.0, -17.0], // Gulf of Carpentaria South
      [142.5, -10.8]
    ];
    drawPolygon(australiaMain, '#b45309'); // Red Outback Dirt & Savanna

    // Red Centre Outback (Uluru zone)
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.ellipse(toX(133.0), toY(-25.0), width * 0.035, height * 0.045, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fertile East Coast (Sydney/Melbourne green strip)
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(toX(149.0), toY(-33.0), width * 0.008, height * 0.055, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Tasmania Island
    const tasmania = [
      [144.5, -40.5],
      [148.0, -41.0],
      [147.5, -43.5],
      [145.0, -43.0],
      [144.5, -40.5]
    ];
    drawPolygon(tasmania, '#166534');

    // New Zealand (North & South Islands)
    const nzSouth = [
      [166.5, -46.0],
      [171.0, -43.0],
      [174.0, -41.0],
      [171.5, -41.5],
      [168.0, -44.5],
      [166.5, -46.0]
    ];
    drawPolygon(nzSouth, '#15803d');

    const nzNorth = [
      [174.5, -41.2],
      [178.0, -38.5],
      [175.0, -35.0],
      [173.0, -35.5],
      [175.0, -39.0],
      [174.5, -41.2]
    ];
    drawPolygon(nzNorth, '#16a34a');

    // ==================== G. NORTH AMERICA ====================
    const northAmericaMain = [
      [-168.0, 65.5], // Bering Strait (Alaska)
      [-150.0, 71.0], // Barrow / Arctic Ocean
      [-135.0, 69.0], // Mackenzie Delta
      [-95.0, 70.0],  // Nunavut
      [-85.0, 63.0],  // Hudson Bay North
      [-80.0, 55.0],  // James Bay
      [-65.0, 58.0],  // Labrador
      [-53.0, 48.0],  // Newfoundland
      [-64.0, 44.0],  // Nova Scotia
      [-70.0, 42.0],  // Cape Cod / Boston
      [-74.0, 40.5],  // New York Harbor
      [-75.5, 38.0],  // Chesapeake / Wallops Flight Facility
      [-75.5, 35.0],  // Cape Hatteras
      [-80.6, 28.5],  // Cape Canaveral / KSC Spaceport
      [-80.2, 25.8],  // Miami
      [-81.8, 24.5],  // Florida Keys
      [-84.0, 30.0],  // Florida Panhandle
      [-89.5, 29.0],  // Mississippi River Delta
      [-95.0, 29.0],  // Houston / Texas Coast
      [-97.5, 26.0],  // Brownsville / Starbase
      [-97.0, 20.0],  // Veracruz (Mexico)
      [-90.0, 21.0],  // Yucatan Peninsula (Chicxulub)
      [-87.0, 16.0],  // Honduras / Central America
      [-80.0, 8.5],   // Panama Isthmus
      [-84.0, 9.5],   // Costa Rica
      [-92.0, 14.5],  // Guatemala Pacific
      [-105.0, 20.0], // Puerto Vallarta
      [-110.0, 23.0], // Cabo San Lucas (Baja California tip)
      [-114.0, 28.0], // Baja Pacific Coast
      [-117.0, 32.5], // San Diego
      [-120.6, 34.6], // Vandenberg Space Force Base
      [-122.4, 37.8], // San Francisco Bay
      [-124.0, 46.0], // Columbia River
      [-128.0, 52.0], // British Columbia
      [-135.0, 58.0], // Alaska Panhandle (Juneau)
      [-150.0, 60.0], // Anchorage / Cook Inlet
      [-160.0, 55.0], // Alaska Peninsula
      [-168.0, 65.5]
    ];
    drawPolygon(northAmericaMain, '#2d5a27');

    // Mojave & Sonoran Desert (Southwest US / Northern Mexico)
    ctx.fillStyle = '#cda158';
    ctx.beginPath();
    ctx.ellipse(toX(-112.0), toY(32.0), width * 0.03, height * 0.04, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Rocky Mountains Ridge (Snow-Capped Slate)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = width * 0.005;
    ctx.beginPath();
    ctx.moveTo(toX(-115.0), toY(52.0));
    ctx.lineTo(toX(-108.0), toY(40.0));
    ctx.lineTo(toX(-105.0), toY(32.0));
    ctx.stroke();

    // Greenland Vast Ice Sheet
    const greenland = [
      [-45.0, 60.0], // Cape Farewell
      [-35.0, 65.0],
      [-20.0, 75.0],
      [-30.0, 83.0], // Cape Morris Jesup
      [-55.0, 80.0],
      [-52.0, 70.0],
      [-48.0, 64.0],
      [-45.0, 60.0]
    ];
    drawPolygon(greenland, '#f1f5f9'); // Pure glacial ice

    // Cuba
    const cuba = [
      [-84.5, 22.0],
      [-78.0, 22.5],
      [-74.5, 20.0],
      [-77.0, 20.5],
      [-83.0, 21.5],
      [-84.5, 22.0]
    ];
    drawPolygon(cuba, '#16a34a');

    // ==================== H. SOUTH AMERICA ====================
    const southAmericaMain = [
      [-77.0, 8.0],   // Colombia Darien
      [-72.0, 11.5],  // Guajira Peninsula
      [-65.0, 10.5],  // Caracas (Venezuela)
      [-60.0, 9.0],   // Orinoco Delta
      [-52.0, 5.0],   // Kourou / Guiana Space Centre
      [-50.0, 0.0],   // Amazon River Mouth (Equator)
      [-44.0, -2.5],  // Sao Luis
      [-35.0, -5.5],  // Natal / Eastern Bulge (Recife)
      [-38.5, -13.0], // Salvador da Bahia
      [-43.0, -23.0], // Rio de Janeiro
      [-46.5, -24.0], // Santos / Sao Paulo
      [-52.0, -32.0], // Rio Grande do Sul
      [-56.0, -35.0], // Montevideo (Uruguay)
      [-58.5, -34.5], // Buenos Aires (Rio de la Plata)
      [-65.0, -42.0], // Valdes Peninsula
      [-67.0, -52.0], // Patagonia (Gallegos)
      [-66.0, -55.0], // Tierra del Fuego (Cape Horn)
      [-74.0, -50.0], // Chilean Fjords
      [-72.0, -40.0], // Puerto Montt
      [-71.5, -33.0], // Valparaiso / Santiago
      [-70.0, -20.0], // Atacama / Iquique
      [-77.0, -12.0], // Lima (Peru)
      [-81.0, -5.0],  // Point Parinas (Western tip)
      [-80.0, -2.5],  // Gulf of Guayaquil (Ecuador)
      [-79.0, 2.0],   // Colombia Pacific
      [-77.0, 8.0]
    ];
    drawPolygon(southAmericaMain, '#1b4d20');

    // Dense Amazon Rainforest Basin (Vibrant Jungle Deep Green)
    ctx.fillStyle = '#0f3814';
    ctx.beginPath();
    ctx.ellipse(toX(-62.0), toY(-4.0), width * 0.045, height * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Amazon River Ribbon
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.moveTo(toX(-73.0), toY(-4.0)); // Peruvian Iquitos source
    ctx.lineTo(toX(-65.0), toY(-3.5));
    ctx.lineTo(toX(-60.0), toY(-3.1)); // Manaus
    ctx.lineTo(toX(-50.0), toY(0.0));  // Atlantic Mouth
    ctx.stroke();

    // Andes Mountains Ridge along Pacific Rim
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = width * 0.004;
    ctx.beginPath();
    ctx.moveTo(toX(-73.0), toY(10.0));
    ctx.lineTo(toX(-77.0), toY(-10.0));
    ctx.lineTo(toX(-70.0), toY(-25.0));
    ctx.lineTo(toX(-69.0), toY(-45.0));
    ctx.lineTo(toX(-67.0), toY(-54.0));
    ctx.stroke();

    // ==================== I. ANTARCTICA & ARCTIC POLAR ICE ====================
    // Antarctica Continental Ice Shelf
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, height * 0.88, width, height * 0.12);

    // Antarctic Peninsula extending towards South America
    const antarcticPeninsula = [
      [toX(-60), height * 0.88],
      [toX(-58), height * 0.80],
      [toX(-64), height * 0.77],
      [toX(-68), height * 0.82],
      [toX(-65), height * 0.88]
    ];
    ctx.beginPath();
    ctx.moveTo(antarcticPeninsula[0][0], antarcticPeninsula[0][1]);
    for (let i = 1; i < antarcticPeninsula.length; i++) {
      ctx.lineTo(antarcticPeninsula[i][0], antarcticPeninsula[i][1]);
    }
    ctx.closePath();
    ctx.fill();

    // Arctic Sea Ice
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, width, height * 0.06);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  /**
   * Generates Earth Specular Roughness Map
   * Black/Dark Gray = Glossy oceans with brilliant specular sun glint
   * Light Gray/White = Matte landmasses and dry terrain without plastic shine
   */
  static createEarthRoughnessMap(width = 2048, height = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const toX = (lon) => ((lon + 180) / 360) * width;
    const toY = (lat) => ((90 - lat) / 180) * height;

    // Ocean baseline: very dark gray (low roughness = maximum specular water gloss!)
    ctx.fillStyle = '#141414';
    ctx.fillRect(0, 0, width, height);

    // Landmass baseline: high roughness (0.85 = rgb 215, 215, 215) -> dry matte soil
    const drawLandRoughness = (coords) => {
      if (coords.length < 3) return;
      ctx.fillStyle = '#dcdcdc';
      ctx.beginPath();
      ctx.moveTo(toX(coords[0][0]), toY(coords[0][1]));
      for (let i = 1; i < coords.length; i++) {
        ctx.lineTo(toX(coords[i][0]), toY(coords[i][1]));
      }
      ctx.closePath();
      ctx.fill();
    };

    // Draw same key continental masks as matte
    drawLandRoughness([
      [68.5, 23.8], [72.8, 18.9], [76.2, 9.9], [77.5, 8.1], [80.25, 13.7],
      [88.3, 21.8], [94.0, 19.5], [85.0, 28.5], [74.5, 35.5], [67.0, 24.8], [68.5, 23.8]
    ]);
    drawLandRoughness([[80.0, 9.8], [81.8, 7.0], [80.2, 6.0], [79.8, 8.5], [80.0, 9.8]]); // Sri Lanka
    drawLandRoughness([[-5.8, 35.8], [30.0, 31.5], [51.2, 10.5], [18.5, -34.5], [-17.5, 14.7], [-5.8, 35.8]]); // Africa
    drawLandRoughness([[-9.0, 37.0], [30.0, 60.0], [170.0, 65.0], [103.8, 1.3], [-9.0, 37.0]]); // Eurasia
    drawLandRoughness([[142.5, -10.8], [151.2, -33.8], [115.8, -32.0], [131.0, -12.5], [142.5, -10.8]]); // Australia
    drawLandRoughness([[-168.0, 65.5], [-53.0, 48.0], [-80.6, 28.5], [-80.0, 8.5], [-124.0, 46.0], [-168.0, 65.5]]); // North America
    drawLandRoughness([[-77.0, 8.0], [-35.0, -5.5], [-66.0, -55.0], [-81.0, -5.0], [-77.0, 8.0]]); // South America

    // Polar ice caps: moderate roughness (0.45 = rgb 115) -> icy semi-gloss
    ctx.fillStyle = '#737373';
    ctx.fillRect(0, height * 0.88, width, height * 0.12);
    ctx.fillRect(0, 0, width, height * 0.06);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  /**
   * Earth rotating cloud layer with alpha transparency and cyclone vortex spirals
   */
  static createCloudsTexture(width = 2048, height = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, width, height);

    // 1. Swirling atmospheric trade-wind cloud bands
    for (let i = 0; i < 450; i++) {
      const x = Math.random() * width;
      const y = (0.12 + Math.random() * 0.76) * height;
      const rx = 35 + Math.random() * 110;
      const ry = 10 + Math.random() * 28;
      const rot = (Math.random() - 0.5) * 0.35;
      const alpha = 0.15 + Math.random() * 0.55;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Realistic Tropical Cyclone Spirals (Indian Ocean & Pacific Typhoons)
    const drawCyclone = (cx, cy, radius) => {
      ctx.save();
      ctx.translate(cx, cy);
      for (let a = 0; a < Math.PI * 6; a += 0.15) {
        const r = (a / (Math.PI * 6)) * radius;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        const size = 6 + (r / radius) * 14;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.45 + Math.sin(a) * 0.25})`;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    drawCyclone(width * 0.72, height * 0.42, 45); // Bay of Bengal Cyclone
    drawCyclone(width * 0.28, height * 0.35, 50); // Gulf of Mexico Hurricane
    drawCyclone(width * 0.82, height * 0.38, 55); // Western Pacific Typhoon

    // 3. Equatorial Intertropical Convergence Zone (ITCZ) Cloud Belt
    ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
    for (let x = 0; x < width; x += 12) {
      const waveY = height * 0.50 + Math.sin(x * 0.015) * 18 + Math.cos(x * 0.03) * 10;
      ctx.beginPath();
      ctx.arc(x, waveY, 18 + Math.random() * 16, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  /**
   * Night side city lights texture matching real global population corridors
   * (India Gangetic plain, East Asia, Europe, US megalopolis, Nile River)
   */
  static createEarthNightTexture(width = 1024, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const toX = (lon) => ((lon + 180) / 360) * width;
    const toY = (lat) => ((90 - lat) / 180) * height;

    ctx.fillStyle = '#010206';
    ctx.fillRect(0, 0, width, height);

    // Helper: draw dense city light web with warm incandescent amber glow
    const drawCityNode = (lon, lat, count, radius, isMajor = false) => {
      const cx = toX(lon);
      const cy = toY(lat);

      // Radial city bloom
      const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.5);
      bloom.addColorStop(0, 'rgba(255, 215, 120, 0.75)');
      bloom.addColorStop(0.4, 'rgba(245, 158, 11, 0.35)');
      bloom.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Sharp individual street/building nodes
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.pow(Math.random(), 1.6) * radius;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const bright = 0.5 + Math.random() * 0.5;
        ctx.fillStyle = isMajor ? `rgba(255, 245, 200, ${bright})` : `rgba(251, 191, 36, ${bright})`;
        ctx.fillRect(x, y, 1.4, 1.4);
      }
    };

    // 1. INDIA & SOUTH ASIA (Dense Gangetic Plain ribbon & Metros)
    drawCityNode(77.2, 28.6, 250, 16, true); // New Delhi & NCR
    drawCityNode(72.8, 19.0, 220, 14, true); // Mumbai & Pune
    drawCityNode(77.6, 12.9, 180, 12, true); // Bengaluru Tech Hub
    drawCityNode(80.2, 13.0, 160, 11, true); // Chennai
    drawCityNode(78.5, 17.4, 150, 11, true); // Hyderabad
    drawCityNode(88.3, 22.5, 180, 13, true); // Kolkata & Howrah
    drawCityNode(72.5, 23.0, 130, 9);        // Ahmedabad
    // Gangetic Plain Golden Ribbon (Delhi -> Kanpur -> Varanasi -> Patna -> Kolkata)
    for (let t = 0; t <= 1; t += 0.08) {
      const glon = 77.5 + t * (88.0 - 77.5);
      const glat = 28.5 - t * (28.5 - 22.5) + Math.sin(t * Math.PI) * 1.2;
      drawCityNode(glon, glat, 90, 8);
    }

    // 2. EAST ASIA (Japan, Korea, Coastal China)
    drawCityNode(139.7, 35.6, 320, 18, true); // Tokyo-Yokohama Mega-region
    drawCityNode(135.5, 34.6, 200, 12, true); // Osaka / Kyoto
    drawCityNode(127.0, 37.5, 220, 13, true); // Seoul
    drawCityNode(116.4, 39.9, 250, 15, true); // Beijing
    drawCityNode(121.4, 31.2, 280, 16, true); // Shanghai
    drawCityNode(113.2, 23.1, 260, 15, true); // Guangzhou / Shenzhen / Hong Kong

    // 3. EUROPE (London, Paris, Benelux, Rhine-Ruhr, Northern Italy)
    drawCityNode(-0.1, 51.5, 280, 16, true);  // London
    drawCityNode(2.35, 48.8, 260, 15, true);  // Paris
    drawCityNode(4.4, 50.8, 220, 13, true);   // Brussels / Amsterdam / Rotterdam
    drawCityNode(7.0, 51.2, 200, 12);         // Rhine-Ruhr Industrial Web
    drawCityNode(9.2, 45.4, 180, 11, true);   // Milan & Po Valley
    drawCityNode(-3.7, 40.4, 160, 11);        // Madrid
    drawCityNode(13.4, 52.5, 160, 11);        // Berlin
    drawCityNode(37.6, 55.7, 240, 14, true);  // Moscow

    // 4. NORTH AMERICA (Eastern Seaboard, Great Lakes, Texas, West Coast)
    drawCityNode(-74.0, 40.7, 340, 19, true); // New York / New Jersey
    drawCityNode(-71.0, 42.3, 160, 11);        // Boston
    drawCityNode(-77.0, 38.9, 190, 12, true); // Washington DC
    drawCityNode(-87.6, 41.8, 220, 14, true); // Chicago
    drawCityNode(-95.3, 29.7, 180, 12);       // Houston
    drawCityNode(-96.8, 32.7, 180, 12);       // Dallas
    drawCityNode(-118.2, 34.0, 300, 17, true);// Los Angeles
    drawCityNode(-122.4, 37.7, 220, 13, true);// San Francisco / Silicon Valley
    drawCityNode(-80.2, 25.7, 160, 11);       // Miami / Florida Coast

    // 5. NILE RIVER GLOWING RIBBON (Egypt)
    drawCityNode(31.2, 30.0, 220, 14, true);  // Cairo
    drawCityNode(29.9, 31.2, 140, 10);        // Alexandria
    for (let ylat = 24.0; ylat <= 30.0; ylat += 0.5) {
      drawCityNode(32.8 - (ylat - 24.0) * 0.25, ylat, 50, 4);
    }

    // 6. MIDDLE EAST, SOUTH AMERICA, AUSTRALIA
    drawCityNode(55.2, 25.2, 190, 12, true);  // Dubai / Abu Dhabi
    drawCityNode(-46.6, -23.5, 260, 15, true);// Sao Paulo
    drawCityNode(-43.1, -22.9, 200, 12);      // Rio de Janeiro
    drawCityNode(-58.3, -34.6, 200, 12, true);// Buenos Aires
    drawCityNode(151.2, -33.8, 180, 11, true);// Sydney
    drawCityNode(144.9, -37.8, 160, 10);      // Melbourne

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  /**
   * Moon texture with realistic basaltic maria and impact crater fields
   */
  static createMoonTexture(width = 1024, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Base highland regolith (light grey)
    ctx.fillStyle = '#9e9e9e';
    ctx.fillRect(0, 0, width, height);

    // Regolith noise
    for (let i = 0; i < 15000; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const val = 120 + Math.floor(Math.random() * 70);
      ctx.fillStyle = `rgb(${val},${val},${val})`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Basaltic Lunar Maria (dark patches)
    const drawMare = (x, y, rx, ry) => {
      ctx.fillStyle = '#4a4a50';
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, Math.random(), 0, Math.PI * 2);
      ctx.fill();
    };

    drawMare(width * 0.35, height * 0.35, width * 0.10, height * 0.12); // Oceanus Procellarum
    drawMare(width * 0.50, height * 0.30, width * 0.08, height * 0.09); // Mare Imbrium
    drawMare(width * 0.65, height * 0.38, width * 0.07, height * 0.08); // Mare Tranquillitatis
    drawMare(width * 0.72, height * 0.32, width * 0.05, height * 0.06); // Mare Serenitatis

    // Impact craters with white ejecta rays
    for (let i = 0; i < 120; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const r = 3 + Math.random() * 18;

      // Crater rim
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Crater floor shadow
      ctx.fillStyle = '#3a3a40';
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(1, r - 2), 0, Math.PI * 2);
      ctx.fill();

      // Central peak
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 1, cy - 1, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  /**
   * Mars texture with iron oxide ochre, Valles Marineris canyon, Olympus Mons, and polar ice caps
   */
  static createMarsTexture(width = 1024, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Martian rust red base
    const marsGrad = ctx.createLinearGradient(0, 0, 0, height);
    marsGrad.addColorStop(0, '#9a3c1e');
    marsGrad.addColorStop(0.5, '#c85a2b');
    marsGrad.addColorStop(1, '#9a3c1e');
    ctx.fillStyle = marsGrad;
    ctx.fillRect(0, 0, width, height);

    // Dark basaltic volcanic provinces (Syrtis Major, Acidalia Planitia)
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = (0.2 + Math.random() * 0.6) * height;
      const rx = 30 + Math.random() * 70;
      const ry = 15 + Math.random() * 40;
      ctx.fillStyle = 'rgba(70, 32, 20, 0.45)';
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, Math.random() * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Valles Marineris canyon chasm
    ctx.strokeStyle = '#2b140b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(width * 0.35, height * 0.52);
    ctx.bezierCurveTo(width * 0.45, height * 0.55, width * 0.55, height * 0.50, width * 0.65, height * 0.53);
    ctx.stroke();

    // Olympus Mons caldera
    ctx.fillStyle = '#6e2b14';
    ctx.beginPath();
    ctx.arc(width * 0.25, height * 0.42, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a1306';
    ctx.beginPath();
    ctx.arc(width * 0.25, height * 0.42, 8, 0, Math.PI * 2);
    ctx.fill();

    // Polar ice caps (dry ice / water ice)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.04, width * 0.22, height * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.96, width * 0.18, height * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  /**
   * Europa cracked ice moon texture with brown lineae fractures
   */
  static createEuropaTexture(width = 1024, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Crystalline white/cyan ice crust
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, width, height);

    // Subtle cyan ice hue
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.25)';
      ctx.fillRect(Math.random() * width, Math.random() * height, 180, 80);
    }

    // Intersecting brown tectonic tidal fracture lines (Lineae)
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 70; i++) {
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(154, 52, 18, 0.7)' : 'rgba(120, 53, 15, 0.5)';
      ctx.beginPath();
      let sx = Math.random() * width;
      let sy = Math.random() * height;
      ctx.moveTo(sx, sy);
      for (let j = 0; j < 5; j++) {
        sx += (Math.random() - 0.5) * 200;
        sy += (Math.random() - 0.5) * 120;
        ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    // Chaotic lenticulae mottled brown domes
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = 'rgba(180, 83, 9, 0.4)';
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 6 + Math.random() * 14, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  /**
   * Jupiter gas giant bands texture with Great Red Spot
   */
  static createJupiterTexture(width = 1024, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Zonal horizontal atmospheric bands
    const bandColors = [
      '#e5d5be', '#c7a37a', '#a67b4f', '#dcc5a7', '#8a5e35',
      '#ebd9c3', '#9c6f44', '#bfa07e', '#e3d2be', '#6e4523'
    ];

    const sliceHeight = height / bandColors.length;
    bandColors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(0, i * sliceHeight, width, sliceHeight + 2);
    });

    // Turbulent swirl oscillations across borders
    for (let y = 0; y < height; y += 4) {
      ctx.fillStyle = y % 8 === 0 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(80, 40, 10, 0.15)';
      ctx.beginPath();
      for (let x = 0; x < width; x += 10) {
        const dy = Math.sin(x * 0.03 + y * 0.05) * 3;
        ctx.fillRect(x, y + dy, 12, 3);
      }
    }

    // Great Red Spot anticyclonic storm
    ctx.save();
    ctx.translate(width * 0.65, height * 0.68);
    ctx.fillStyle = '#b9381e';
    ctx.beginPath();
    ctx.ellipse(0, 0, 45, 26, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // White core swirl inside Red Spot
    ctx.strokeStyle = '#e29d8a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  /**
   * Spacecraft Multi-Layer Insulation (MLI) gold foil normal/specular bump texture
   */
  static createGoldFoilTexture(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#eab308'; // NASA Gold Kapton foil
    ctx.fillRect(0, 0, size, size);

    // Wrinkled foil polygon facets
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const s = 15 + Math.random() * 35;
      const shade = (Math.random() - 0.5) * 60;
      const r = Math.min(255, Math.max(0, 234 + shade));
      const g = Math.min(255, Math.max(0, 179 + shade * 0.8));
      const b = Math.min(255, Math.max(0, 8 + shade * 0.2));
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + s, y + (Math.random() - 0.5) * s);
      ctx.lineTo(x + s * 0.8, y + s);
      ctx.closePath();
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  /**
   * Photovoltaic solar array cell texture with blue silicon & silver grid fingers
   */
  static createSolarCellTexture(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Deep anti-reflective blue silicon wafer
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, size, size);

    // Grid cells
    const cols = 4;
    const rows = 8;
    const cellW = size / cols;
    const cellH = size / rows;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = c * cellW + 2;
        const y = r * cellH + 2;
        const w = cellW - 4;
        const h = cellH - 4;

        ctx.fillStyle = '#1e3a8a'; // Deep blue
        ctx.fillRect(x, y, w, h);

        // Thin silver collector fingers
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 1;
        for (let fy = y + 4; fy < y + h; fy += 6) {
          ctx.beginPath();
          ctx.moveTo(x, fy);
          ctx.lineTo(x + w, fy);
          ctx.stroke();
        }

        // Silver main busbars
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.33, y);
        ctx.lineTo(x + w * 0.33, y + h);
        ctx.moveTo(x + w * 0.66, y);
        ctx.lineTo(x + w * 0.66, y + h);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  /**
   * Generates dynamic boiling solar photosphere texture with granulation and sunspots
   */
  static createSunTexture(width = 1024, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#f59e0b');
    grad.addColorStop(0.3, '#fbbf24');
    grad.addColorStop(0.5, '#fef08a');
    grad.addColorStop(0.7, '#fbbf24');
    grad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Convection granules
    for (let i = 0; i < 1800; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = 2 + Math.random() * 8;
      ctx.fillStyle = Math.random() > 0.4 ? 'rgba(255, 255, 255, 0.25)' : 'rgba(217, 119, 6, 0.2)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Solar active regions and sunspots (umbra and penumbra)
    for (let s = 0; s < 12; s++) {
      const sx = Math.random() * width;
      const sy = height * 0.3 + Math.random() * (height * 0.4);
      const sRad = 6 + Math.random() * 12;

      // Penumbra
      ctx.fillStyle = 'rgba(180, 83, 9, 0.7)';
      ctx.beginPath();
      ctx.arc(sx, sy, sRad, 0, Math.PI * 2);
      ctx.fill();

      // Umbra
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(sx, sy, sRad * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Generates Mercury heavily-cratered basalt regolith texture
   */
  static createMercuryTexture(width = 1024, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#52525b';
    ctx.fillRect(0, 0, width, height);

    // Basalt plains and shading
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = 10 + Math.random() * 45;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(39, 39, 42, 0.35)' : 'rgba(113, 113, 122, 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Impact craters and bright ray systems
    for (let c = 0; c < 280; c++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const cr = 2 + Math.random() * 14;

      ctx.strokeStyle = '#a1a1aa';
      ctx.lineWidth = 1.5;
      ctx.fillStyle = '#27272a';
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (cr > 8) {
        // Crater rays
        ctx.strokeStyle = 'rgba(228, 228, 231, 0.25)';
        ctx.lineWidth = 0.8;
        for (let ray = 0; ray < 6; ray++) {
          const ang = Math.random() * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(ang) * cr * 3.5, cy + Math.sin(ang) * cr * 3.5);
          ctx.stroke();
        }
      }
    }

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Generates Venus thick swirling sulfuric acid cloud decks
   */
  static createVenusTexture(width = 1024, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#fef3c7');
    grad.addColorStop(0.3, '#fde68a');
    grad.addColorStop(0.5, '#f5d0fe');
    grad.addColorStop(0.7, '#fde68a');
    grad.addColorStop(1, '#fef3c7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Swirling atmospheric chevron jet streams
    for (let y = 0; y < height; y += 12) {
      ctx.fillStyle = y % 24 === 0 ? 'rgba(217, 119, 6, 0.12)' : 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= width; x += 40) {
        const offset = Math.sin((x / width) * Math.PI * 4) * 8;
        ctx.lineTo(x, y + offset);
      }
      ctx.lineTo(width, y + 16);
      ctx.lineTo(0, y + 16);
      ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Generates Saturn butterscotch and gold atmospheric bands
   */
  static createSaturnTexture(width = 1024, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#78716c');
    grad.addColorStop(0.2, '#ca8a04');
    grad.addColorStop(0.4, '#eab308');
    grad.addColorStop(0.5, '#fef08a');
    grad.addColorStop(0.6, '#eab308');
    grad.addColorStop(0.8, '#a16207');
    grad.addColorStop(1, '#57534e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Delicate zonal jet stream lines
    for (let y = 0; y < height; y += 8) {
      ctx.fillStyle = (y % 16 === 0) ? 'rgba(255, 255, 255, 0.14)' : 'rgba(113, 63, 18, 0.1)';
      ctx.fillRect(0, y, width, 4);
    }

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Generates Saturn concentric rings texture with Cassini Division & Encke Gap
   */
  static createSaturnRingsTexture(width = 1024, height = 64) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, width, 0);
    // Transparent inner edge
    grad.addColorStop(0.0, 'rgba(0,0,0,0)');
    // Ring C (Crepe Ring, faint)
    grad.addColorStop(0.12, 'rgba(161, 98, 7, 0.25)');
    grad.addColorStop(0.28, 'rgba(202, 138, 4, 0.45)');
    // Ring B (Brightest and densest)
    grad.addColorStop(0.32, 'rgba(254, 240, 138, 0.92)');
    grad.addColorStop(0.58, 'rgba(234, 179, 8, 0.95)');
    grad.addColorStop(0.64, 'rgba(254, 240, 138, 0.90)');
    // Cassini Division (Dark gap!)
    grad.addColorStop(0.65, 'rgba(0,0,0,0.02)');
    grad.addColorStop(0.70, 'rgba(0,0,0,0.02)');
    // Ring A
    grad.addColorStop(0.72, 'rgba(234, 179, 8, 0.75)');
    // Encke Gap
    grad.addColorStop(0.85, 'rgba(0,0,0,0.05)');
    grad.addColorStop(0.87, 'rgba(202, 138, 4, 0.65)');
    grad.addColorStop(0.96, 'rgba(161, 98, 7, 0.4)');
    // F Ring & outer edge
    grad.addColorStop(1.0, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Generates Uranus cyan-aquamarine ice giant texture
   */
  static createUranusTexture(width = 1024, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.3, '#7dd3fc');
    grad.addColorStop(0.5, '#a5f3fc');
    grad.addColorStop(0.7, '#7dd3fc');
    grad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle atmospheric bands
    for (let y = 0; y < height; y += 18) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(0, y, width, 6);
    }

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Generates Neptune deep royal azure blue texture with Great Dark Spot
   */
  static createNeptuneTexture(width = 1024, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#1e3a8a');
    grad.addColorStop(0.2, '#1d4ed8');
    grad.addColorStop(0.5, '#2563eb');
    grad.addColorStop(0.8, '#1d4ed8');
    grad.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // White methane cirrus streaks ("Scooter")
    for (let i = 0; i < 35; i++) {
      const sx = Math.random() * width;
      const sy = Math.random() * height;
      const sw = 40 + Math.random() * 120;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.beginPath();
      ctx.ellipse(sx, sy, sw, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Great Dark Spot storm
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.beginPath();
    ctx.ellipse(width * 0.38, height * 0.42, 55, 30, -0.2, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }
}
