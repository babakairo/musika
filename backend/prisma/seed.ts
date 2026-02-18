import { PrismaClient, Role, DeliveryType, OrderStatus, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Only seed if the database is empty (safe for production restarts)
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log('✅ Database already seeded — skipping.');
    return;
  }

  console.log('🌱 Seeding Musika database...');

  const hashedPassword = await bcrypt.hash('Password123!', 12);

  // ─── Users ───────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: 'admin@musika.co.zw',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Musika',
      phone: '+263771000000',
      role: Role.ADMIN,
    },
  });

  const sellerUser1 = await prisma.user.create({
    data: {
      email: 'techstore@musika.co.zw',
      password: hashedPassword,
      firstName: 'Tendai',
      lastName: 'Moyo',
      phone: '+263771000001',
      role: Role.SELLER,
    },
  });

  const sellerUser2 = await prisma.user.create({
    data: {
      email: 'fashionhub@musika.co.zw',
      password: hashedPassword,
      firstName: 'Rudo',
      lastName: 'Chikwanda',
      phone: '+263771000002',
      role: Role.SELLER,
    },
  });

  const sellerUser3 = await prisma.user.create({
    data: {
      email: 'homeessentials@musika.co.zw',
      password: hashedPassword,
      firstName: 'Chiedza',
      lastName: 'Mwangi',
      phone: '+263771000003',
      role: Role.SELLER,
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@musika.co.zw',
      password: hashedPassword,
      firstName: 'Farai',
      lastName: 'Ncube',
      phone: '+263771000010',
      role: Role.CUSTOMER,
    },
  });

  // ─── Sellers ─────────────────────────────────────────────────
  const seller1 = await prisma.seller.create({
    data: {
      userId: sellerUser1.id,
      storeName: 'TechZim Store',
      description: 'Zimbabwe\'s premier electronics and gadgets store. We stock the latest tech at competitive prices.',
      logo: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200&h=200&fit=crop',
      banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=300&fit=crop',
      approved: true,
    },
  });

  const seller2 = await prisma.seller.create({
    data: {
      userId: sellerUser2.id,
      storeName: 'Fashion Hub Zim',
      description: 'Trendy African and international fashion. Clothing, shoes, and accessories for every occasion.',
      logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
      banner: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=300&fit=crop',
      approved: true,
    },
  });

  const seller3 = await prisma.seller.create({
    data: {
      userId: sellerUser3.id,
      storeName: 'Home Essentials ZW',
      description: 'Everything you need for your home. Kitchen, living room, bedroom — all under one roof.',
      logo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
      banner: 'https://images.unsplash.com/photo-1556909195-b2b8d7a3e7a5?w=1200&h=300&fit=crop',
      approved: true,
    },
  });

  // ─── Categories ───────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
        featured: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Fashion',
        slug: 'fashion',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop',
        featured: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Home & Kitchen',
        slug: 'home-kitchen',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
        featured: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Sports & Outdoors',
        slug: 'sports-outdoors',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop',
        featured: false,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Beauty & Personal Care',
        slug: 'beauty-personal-care',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
        featured: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Books & Stationery',
        slug: 'books-stationery',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
        featured: false,
      },
    }),
  ]);

  const [electronics, fashion, homeKitchen, sports, beauty] = categories;

  // ─── Products ─────────────────────────────────────────────────
  const productData = [
    // Electronics
    {
      sellerId: seller1.id,
      categoryId: electronics.id,
      name: 'Samsung Galaxy A54 5G',
      slug: 'samsung-galaxy-a54-5g',
      description: 'Experience the future with the Samsung Galaxy A54 5G. Features a stunning 6.4-inch Super AMOLED display, 50MP triple camera system, and all-day 5000mAh battery. Perfect for Zimbabwe\'s growing 5G network.',
      price: 450.00,
      comparePrice: 520.00,
      images: [
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop',
      ],
      featured: true,
      rating: 4.6,
      reviewCount: 128,
      sku: 'TECH-SAM-A54-5G',
      quantity: 45,
    },
    {
      sellerId: seller1.id,
      categoryId: electronics.id,
      name: 'Apple iPhone 15',
      slug: 'apple-iphone-15',
      description: 'The iPhone 15 with Dynamic Island, 48MP main camera, and USB-C charging. Experience Apple\'s most refined smartphone with its A16 Bionic chip for unmatched performance.',
      price: 899.00,
      comparePrice: 999.00,
      images: [
        'https://images.unsplash.com/photo-1696446702183-c18f1b5b8ad8?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop',
      ],
      featured: true,
      rating: 4.8,
      reviewCount: 256,
      sku: 'TECH-APL-IP15',
      quantity: 20,
    },
    {
      sellerId: seller1.id,
      categoryId: electronics.id,
      name: 'JBL Tune 770NC Wireless Headphones',
      slug: 'jbl-tune-770nc-wireless-headphones',
      description: 'Adaptive Noise Cancelling with 70-hour battery life. Pure Bass sound with multipoint connection — connect to two devices simultaneously. Foldable design for easy carrying.',
      price: 95.00,
      comparePrice: 120.00,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&h=600&fit=crop',
      ],
      featured: false,
      rating: 4.5,
      reviewCount: 89,
      sku: 'TECH-JBL-770NC',
      quantity: 60,
    },
    {
      sellerId: seller1.id,
      categoryId: electronics.id,
      name: 'HP Pavilion 15 Laptop',
      slug: 'hp-pavilion-15-laptop',
      description: 'Intel Core i5 13th Gen, 8GB RAM, 512GB SSD. 15.6-inch FHD display with Windows 11. Ideal for students and professionals. Backed by HP\'s 1-year warranty.',
      price: 680.00,
      comparePrice: 750.00,
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop',
      ],
      featured: true,
      rating: 4.4,
      reviewCount: 67,
      sku: 'TECH-HP-PAV15',
      quantity: 15,
    },
    // Fashion
    {
      sellerId: seller2.id,
      categoryId: fashion.id,
      name: 'African Print Ankara Dress',
      slug: 'african-print-ankara-dress',
      description: 'Beautifully crafted Ankara wrap dress featuring vibrant Zimbabwean-inspired geometric prints. Made from 100% premium cotton. Available in sizes XS-2XL. Machine washable.',
      price: 45.00,
      comparePrice: 65.00,
      images: [
        'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop',
      ],
      featured: true,
      rating: 4.7,
      reviewCount: 143,
      sku: 'FASH-ANK-DRESS-01',
      quantity: 80,
    },
    {
      sellerId: seller2.id,
      categoryId: fashion.id,
      name: 'Nike Air Max 270',
      slug: 'nike-air-max-270',
      description: 'The Nike Air Max 270 delivers visible cushioning under every step. Lightweight mesh upper for maximum breathability. Max Air unit in heel for all-day comfort. Available sizes 38-47.',
      price: 120.00,
      comparePrice: 150.00,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop',
      ],
      featured: true,
      rating: 4.6,
      reviewCount: 211,
      sku: 'FASH-NIK-AM270',
      quantity: 35,
    },
    {
      sellerId: seller2.id,
      categoryId: fashion.id,
      name: 'Men\'s Slim Fit Chinos',
      slug: 'mens-slim-fit-chinos',
      description: 'Premium slim-fit chino pants crafted from stretch cotton blend for ultimate comfort and style. Perfect for both office and casual wear. Multiple colour options: Khaki, Navy, Olive, Black.',
      price: 35.00,
      comparePrice: 50.00,
      images: [
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=600&fit=crop',
      ],
      featured: false,
      rating: 4.3,
      reviewCount: 98,
      sku: 'FASH-CHN-SLIM-01',
      quantity: 120,
    },
    // Home & Kitchen
    {
      sellerId: seller3.id,
      categoryId: homeKitchen.id,
      name: 'Instant Pot Duo 7-in-1',
      slug: 'instant-pot-duo-7-in-1',
      description: 'The world\'s best-selling multi-cooker. Pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer — all in one. 6-quart capacity, perfect for families.',
      price: 89.00,
      comparePrice: 110.00,
      images: [
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop',
      ],
      featured: true,
      rating: 4.8,
      reviewCount: 389,
      sku: 'HOME-IP-DUO-7IN1',
      quantity: 25,
    },
    {
      sellerId: seller3.id,
      categoryId: homeKitchen.id,
      name: 'Egyptian Cotton Bedsheet Set',
      slug: 'egyptian-cotton-bedsheet-set',
      description: '400 thread count 100% Egyptian cotton. Ultra-soft, breathable, and durable. Set includes flat sheet, fitted sheet, and 4 pillowcases. Available in Queen and King sizes. Multiple colour options.',
      price: 55.00,
      comparePrice: 75.00,
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=600&fit=crop',
      ],
      featured: false,
      rating: 4.5,
      reviewCount: 156,
      sku: 'HOME-BED-EGCOT-Q',
      quantity: 40,
    },
    {
      sellerId: seller3.id,
      categoryId: homeKitchen.id,
      name: 'Nespresso Vertuo Coffee Machine',
      slug: 'nespresso-vertuo-coffee-machine',
      description: 'Brew barista-quality coffee at home. Centrifusion technology extracts the perfect cup every time. Compatible with 30+ Vertuo pod varieties. Auto-shutoff after 9 minutes.',
      price: 145.00,
      comparePrice: 180.00,
      images: [
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop',
      ],
      featured: true,
      rating: 4.7,
      reviewCount: 203,
      sku: 'HOME-NESP-VERT-01',
      quantity: 18,
    },
    // Beauty
    {
      sellerId: seller2.id,
      categoryId: beauty.id,
      name: 'Cetaphil Moisturising Cream 500g',
      slug: 'cetaphil-moisturising-cream-500g',
      description: 'Dermatologist-recommended moisturiser for dry to very dry, sensitive skin. Non-greasy formula absorbs quickly. Clinically proven to restore the skin\'s natural protective barrier. Fragrance-free.',
      price: 18.00,
      comparePrice: 25.00,
      images: [
        'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop',
      ],
      featured: false,
      rating: 4.6,
      reviewCount: 445,
      sku: 'BEAU-CET-MOIST-500',
      quantity: 200,
    },
    // Sports
    {
      sellerId: seller1.id,
      categoryId: sports.id,
      name: 'Garmin Forerunner 265 GPS Watch',
      slug: 'garmin-forerunner-265-gps-watch',
      description: 'Advanced running watch with AMOLED display, training readiness, and race predictor. Daily Suggested Workouts adapt to your performance. Up to 15-day battery life in smartwatch mode.',
      price: 350.00,
      comparePrice: 400.00,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
      ],
      featured: false,
      rating: 4.7,
      reviewCount: 87,
      sku: 'SPORT-GAR-FR265',
      quantity: 12,
    },
  ];

  for (const product of productData) {
    const { sku, quantity, rating, reviewCount, ...productFields } = product;
    const created = await prisma.product.create({
      data: {
        ...productFields,
        rating,
        reviewCount,
      },
    });

    await prisma.inventory.create({
      data: {
        productId: created.id,
        sku,
        quantityAvailable: quantity,
        quantityReserved: 0,
        quantitySold: Math.floor(Math.random() * 50),
      },
    });
  }

  // ─── Agent Locations ──────────────────────────────────────────
  await prisma.agentLocation.createMany({
    data: [
      { name: 'Musika Agent — Harare CBD', address: 'Shop 14, Pioneer House, Samora Machel Ave', city: 'Harare', phone: '+263242700100' },
      { name: 'Musika Agent — Avondale', address: '12 King George Rd, Avondale', city: 'Harare', phone: '+263242700101' },
      { name: 'Musika Agent — Borrowdale', address: 'Borrowdale Village, Borrowdale Rd', city: 'Harare', phone: '+263242700102' },
      { name: 'Musika Agent — Bulawayo CBD', address: '78 Joshua Mqabuko Nkomo St', city: 'Bulawayo', phone: '+263292700100' },
      { name: 'Musika Agent — Gweru', address: '23 Robert Mugabe Way, Gweru', city: 'Gweru', phone: '+263154700100' },
      { name: 'Musika Agent — Mutare', address: '45 Herbert Chitepo St, Mutare', city: 'Mutare', phone: '+263202700100' },
    ],
  });

  // ─── Sample Order ─────────────────────────────────────────────
  const products = await prisma.product.findMany({ take: 2, include: { inventory: true } });

  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      status: OrderStatus.DELIVERED,
      totalAmount: 545.00,
      deliveryType: DeliveryType.HOME_DELIVERY,
      deliveryAddress: '24 Chitepo Avenue, Harare, Zimbabwe',
      trackingNumber: 'MSK-20240115-001',
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
            unitPrice: products[0].price,
            subtotal: products[0].price,
          },
          {
            productId: products[1].id,
            quantity: 1,
            unitPrice: products[1].price,
            subtotal: products[1].price,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      method: 'ECOCASH',
      status: PaymentStatus.SUCCESS,
      reference: 'ECO-' + Date.now(),
      amount: 545.00,
      phone: customer.phone!,
      paidAt: new Date(),
    },
  });

  console.log('✅ Seeding complete!');
  console.log('\n📋 Login credentials:');
  console.log('   Admin:    admin@musika.co.zw    / Password123!');
  console.log('   Seller 1: techstore@musika.co.zw / Password123!');
  console.log('   Seller 2: fashionhub@musika.co.zw / Password123!');
  console.log('   Customer: customer@musika.co.zw  / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
